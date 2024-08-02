import path from 'path';
import fs from 'fs';
import { ParsedUrlQuery } from 'querystring';

import { GetStaticPaths, GetStaticProps } from 'next';

import { getDocData } from '../../../lib/markdown';
import DocLayout, { DocProps } from '../../components/Docs/DocLayout';

interface Params extends ParsedUrlQuery {
  slug: string[];
}

export default function DocPage({
  docData,
  slug,
}: DocProps & { slug: string[] }) {
  const docPath = slug.join('/');

  return (
    <DocLayout toc={docData.toc} path={`docs/${docPath}`}>
      <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const docsDir = path.join(process.cwd(), 'docs');

  const getPaths = (
    dir: string,
    slug: string[] = [],
  ): Array<{ params: Params }> => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const paths: Array<{ params: Params }> = [];

    entries.forEach((entry) => {
      const entryPath = path.join(dir, entry.name);
      const entrySlug = [...slug, entry.name];

      if (fs.existsSync(entryPath)) {
        if (fs.lstatSync(entryPath).isDirectory()) {
          paths.push(...getPaths(entryPath, entrySlug));
        } else if (entry.isFile()) {
          // ignore the docs/index.md file, so we don't double up creating pages against docs/index.tsx
          if (entrySlug.join('/') === 'index.md') {
            return;
          }

          // if it's a file strip the .md extension at the last element of slug
          let cutSlug = entrySlug.slice(0, -1);
          const lastSlug = entrySlug[entrySlug.length - 1];
          const lastUpdatedSlug = lastSlug.slice(0, -3);

          if (lastUpdatedSlug !== 'index') {
            cutSlug.push(lastUpdatedSlug);
          }
          if (cutSlug.length == 0) cutSlug = [lastUpdatedSlug];
          paths.push({
            params: { slug: cutSlug },
          });
        }
      }
    });

    return paths;
  };

  const paths = getPaths(docsDir);

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as Params;
  const docData = await getDocData(slug);
  return {
    props: {
      docData,
      slug,
    },
  };
};
