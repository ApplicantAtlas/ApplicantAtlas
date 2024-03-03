import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { getDocData } from "../../../../lib/markdown";
import DocLayout, { DocProps } from "../../../components/Docs/DocLayout";
import path from "path";
import fs from "fs";

export default function DocPage({ docData }: DocProps) {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <DocLayout toc={docData.toc}>
      <div dangerouslySetInnerHTML={{ __html: docData.contentHtml }} />
    </DocLayout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
    const categoriesDir = path.join(process.cwd(), "docs");
    const categories = fs.readdirSync(categoriesDir)
      .filter(item => fs.statSync(path.join(categoriesDir, item)).isDirectory());

  const paths = categories.flatMap((category) => {
    const files = fs.readdirSync(path.join(categoriesDir, category));
    return files.map((file) => ({
      params: { category, slug: file.replace(/\.md$/, "") },
    }));
  });

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { category, slug } = params as { category: string; slug: string };
  var s = slug;
  if (slug === undefined || slug === "") {
    s = "index";
  }

  const docData = await getDocData(category, s, s);
  return {
    props: {
      docData,
    },
  };
};
