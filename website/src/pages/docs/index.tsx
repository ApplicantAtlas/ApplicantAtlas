import { GetStaticProps } from 'next';

import { getDocData } from '../../../lib/markdown';
import DocLayout, { DocProps } from '../../components/Docs/DocLayout';

export default function DocsIndexPage({ docData }: DocProps) {
  return (
    <DocLayout toc={docData.toc} path={`docs/index.md`}>
      <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const docData = await getDocData(['']);
  return {
    props: {
      docData,
    },
  };
};
