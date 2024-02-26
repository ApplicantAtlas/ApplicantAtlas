import { useEffect, useState } from "react";
import DocLayout from "../../components/Docs/DocLayout";
import { getDocData } from "../../../lib/markdown";

interface TOCItem {
  value: string;
  id: string;
  depth: number;
}

interface DocData {
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

export async function getStaticProps() {
  const docData = await getDocData("", "index", "docs/");
  return {
    props: {
      docData,
    },
  };
}
