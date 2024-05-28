import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';
import rehypeSlug from 'rehype-slug';

export async function processMarkdown(
  filePath: string,
  linksBasePath: string = ''
): Promise<{ contentHtml: string; toc: TOCItem[] }> {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(fileContents);
  let toc: TOCItem[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(() => (tree) => {
      toc = extractTOC(tree);
    })
    .use(remarkRehype)
    .use(rehypeSlug)
    //.use(rehypeAutolinkHeadings)
    .use(() => {
      return (tree: Node) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visit(tree, 'element', (node: any) => {
          if (node.tagName === 'a' && node.properties && node.properties.href) {
            const href: string = node.properties.href;
            if (!href.startsWith('http') && !href.startsWith('#')) {
              const [filePath, anchor] = href.split('#');

              let processedPath = `${linksBasePath}/${filePath
                .replace(/\/index\.md$/, '')
                .replace(/\.md$/, '')}`;

              if (anchor) {
                processedPath += `#${anchor}`;
              }
              node.properties.href = processedPath;
            }
          }
        });
      };
    })
    .use(rehypeStringify);

  const processedContent = await processor.process(content);

  return {
    contentHtml: processedContent.toString(),
    toc,
  };
}

export function getDocPaths(docCategory: string): string[] {
  const docsDirectory = path.join(process.cwd(), 'docs', docCategory);
  return fs.readdirSync(docsDirectory);
}

export interface TOCItem {
  value: string;
  id: string;
  depth: number;
  children?: TOCItem[];
}

export async function getDocData(
  category: string,
  slug: string,
  linksBasePath: string = ''
): Promise<{
  slug: string;
  contentHtml: string;
  toc: TOCItem[];
  [key: string]: any;
}> {
  let fullPath = path.join(process.cwd(), 'docs', category, `${slug}.md`);
  if (category === '') {
    fullPath = path.join(process.cwd(), 'docs', `${slug}.md`);
  }

  const { contentHtml, toc } = await processMarkdown(fullPath, linksBasePath);

  return {
    slug,
    contentHtml,
    toc,
  };
}

// This is a simplified example to extract headings and create a TOC
function extractTOC(tree: Node): TOCItem[] {
  const toc: TOCItem[] = [];
  const stack: Array<TOCItem> = [];

  // Recursively extract text from the node and its children
  // This handles the case where a heading contains inline elements like **bold**
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractText(node: any) {
    if (node.type === 'text') {
      return node.value;
    }
    // If the node has children, recursively extract text from each child
    else if (node.children && node.children.length) {
      return node.children.map(extractText).join('');
    }
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visit(tree, 'heading', (node: any) => {
    const text = extractText(node);
    const id = text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
    const newItem: TOCItem = {
      value: text,
      id,
      depth: node.depth,
      children: [],
    };

    // Find the correct parent item
    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }

    if (stack.length > 0) {
      if (stack.length > 0) {
        const lastItem = stack[stack.length - 1];
        if (lastItem.children) {
          lastItem.children.push(newItem);
        }
      }
    } else {
      toc.push(newItem);
    }

    stack.push(newItem);
  });

  return toc;
}
