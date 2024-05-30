import path from 'path';
import fs from 'fs';

import { GetStaticPaths, GetStaticProps } from 'next';

import DocLayout, { DocProps } from '../../../components/Docs/DocLayout';
import { getDocData } from '../../../../lib/markdown';

export default function CategoryIndexPage({
  docData,
  category,
}: DocProps & { category: string }) {
  return (
    <DocLayout toc={docData.toc} path={`/docs/${category}/index.md`}>
      <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { category } = params as { category: string };
  const docData = await getDocData(category, 'index', `${category}`);
  return {
    props: {
      docData,
      category,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categoriesDir = path.join(process.cwd(), 'docs');
  const categories = fs
    .readdirSync(categoriesDir)
    .filter((item) =>
      fs.statSync(path.join(categoriesDir, item)).isDirectory(),
    );

  const paths = categories.map((category) => ({
    params: { category },
  }));

  return { paths, fallback: false };
};
