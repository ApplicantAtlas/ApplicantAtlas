import React, { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";

interface DocLayoutProps {
  children: ReactNode;
  toc: ReactNode;
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
      <div className="flex min-h-screen">
        <aside
          className="relative lg:w-64 lg:max-w-full"
          aria-label="Table of Contents"
        >
          <div className="sticky top-0 min-h-screen py-4 px-3 bg-gray-50 rounded dark:bg-gray-800 lg:max-h-screen pt-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Table of Contents
            </h2>
            <ul className="mt-4 space-y-2 prose prose-sm sm:prose dark:prose-dark">
              {/* Dynamic Table of Contents */}
              {toc}
            </ul>
          </div>
        </aside>

        <main className="flex-1 w-full p-4">
          <div className="prose prose-sm sm:prose md:prose-lg">
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
