import { GetStaticProps } from 'next';

import { getDocData } from '../../../lib/markdown';
import DocLayout, { DocProps } from '../../components/Docs/DocLayout';

export default function DocsIndexPage({ docData }: DocProps) {
  return (
    <DocLayout toc={docData.toc} path={`docs/terms-of-service.md`}>
      <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const docData = await getDocData(['terms-of-service']);
  return {
    props: {
      docData,
    },
  };
};
