import React, { ReactNode } from 'react';

import Header from '../Header';
import Footer from '../Footer';
import { TOCItem } from '../../../lib/markdown';

import TableOfContents from './TableOfContents';

export interface DocLayoutProps {
  children: ReactNode;
  toc: TOCItem[];
  path: string;
}

export interface DocData {
  contentHtml: string;
  toc: TOCItem[];
}

export interface DocProps {
  docData: DocData;
}

const DocLayout: React.FC<DocLayoutProps> = ({ children, toc, path }) => {
  return (
    <>
      <Header
        showUserProfile={true}
        showShadow={false}
        customStyles={{ header: 'border-b border-gray-200' }}
        menuItems={[]}
      />
      <div className="flex flex-row min-h-screen">
        <aside
          className="bg-gray-50 dark:bg-gray-800 flex flex-col justify-between"
          aria-label="Table of Contents"
        >
          <TableOfContents items={toc} />
          <div className="sticky bottom-0 bg-inherit py-3 px-2 text-center border-t border-gray-200 overflow-wrap w-full">
            <button
              className="btn btn-neutral btn-md p-2"
              onClick={() =>
                window.open(
                  `https://github.com/davidteather/ApplicantAtlas/blob/main/website/${path}`,
                  '_blank',
                )
              }
            >
              Edit Docs on GitHub
            </button>
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
