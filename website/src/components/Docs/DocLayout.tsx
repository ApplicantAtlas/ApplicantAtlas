import React, { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { TOCItem } from "../../../lib/markdown";

export interface DocLayoutProps {
  children: ReactNode;
  toc: TOCItem[];
}

export interface DocData {
  contentHtml: string;
  toc: TOCItem[];
}

export interface DocProps {
  docData: DocData;
}

const DocLayout: React.FC<DocLayoutProps> = ({ children, toc }) => {
  return (
    <>
      <Header
        showUserProfile={true}
        showShadow={false}
        customStyles={{ header: "border-b border-gray-200" }}
        menuItems={[]}
      />
      <div className="flex flex-row min-h-screen">
        <aside
          className=" bg-gray-50 dark:bg-gray-800 p-2"
          aria-label="Table of Contents"
        >
          <div className="sticky top-0 min-h-screen py-4 px-3 lg:max-h-screen pt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Table of Contents
            </h2>
            <ul className="mt-4 space-y-2 prose prose-sm sm:prose dark:prose-dark">
              {toc &&
                toc.map((item) => (
                  <li key={item.id} className={`toc-level-${item.depth}`}>
                    <a href={`#${item.id}`}>{item.value}</a>
                  </li>
                ))}
            </ul>
          </div>
        </aside>

        <main className="flex-auto overflow-auto p-4">
          <div className="prose prose-sm sm:prose lg:prose-lg lg:w-4/5">
            {children}
          </div>
        </main>
      </div>
      <Footer />

      <style jsx>{`
        .prose {
          max-width: none;
        }
      `}</style>
    </>
  );
};

export default DocLayout;
