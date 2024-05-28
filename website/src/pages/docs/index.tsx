import DocLayout, { DocProps } from '../../components/Docs/DocLayout';
import { getDocData } from '../../../lib/markdown';

export default function CategoryIndexPage({ docData }: DocProps) {
  return (
    <DocLayout toc={docData.toc}>
      <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export async function getStaticProps() {
  const docData = await getDocData('', 'index', 'docs/');
  return {
    props: {
      docData,
    },
  };
}
