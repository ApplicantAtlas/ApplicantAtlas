import { GetStaticPaths, GetStaticProps } from "next";
import DocLayout from "../../../components/Docs/DocLayout";
import { getDocData } from "../../../../lib/markdown";
import path from "path";
import fs from "fs";

interface TOCItem {
  value: string;
  id: string;
  depth: number;
}

interface DocData {
  title: string;
  contentHtml: string;
  toc: TOCItem[];
}

interface Props {
  docData: DocData;
}

export default function CategoryIndexPage({ docData }: Props) {
  var toc = null;
  if (docData.toc) {
    toc = (
      <ul>
        {docData.toc.map((item) => (
          <li key={item.id} className={`toc-level-${item.depth}`}>
            <a href={`#${item.id}`}>{item.value}</a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <DocLayout toc={toc}>
        <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { category } = params as { category: string };
  const docData = await getDocData(category, "index");
  return {
    props: {
      docData,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categoriesDir = path.join(process.cwd(), "docs");
  const categories = fs.readdirSync(categoriesDir);

  const paths = categories.map(category => ({
    params: { category }
  }));

  return { paths, fallback: false };
};
