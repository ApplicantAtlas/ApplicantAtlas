import React, { useState } from "react";
import { TOCItem } from "../../../lib/markdown";
import ChevronRight from "../Icons/ChevronRight";

interface TOCProps {
  items: TOCItem[];
}

const TOCItemComponent: React.FC<{ item: TOCItem }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const arrowWidthHeightClass = `h-3 w-3`;
  const arrowMarginClass = `mr-2`;
  const nonChildrenMarginClass = `ml-5 `; // should sum to above

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const goToSegment = () => {
    // Scroll to the heading
    const heading = document.getElementById(item.id);
    if (heading) {
      heading.scrollIntoView({ behavior: "smooth" });
      // Add the hash to the URL
      window.history.pushState({}, "", `#${item.id}`);
    }
  };

  return (
    <>
      <div className={`toc-level-${item.depth}`}>
        <div className="flex items-center">
          {hasChildren && (
            <span
              className={`text-sm ${arrowMarginClass} hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center`}
              onClick={toggleExpand}
            >
              <ChevronRight
                className={`${arrowWidthHeightClass} transform transition-transform ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
              />
            </span>
          )}
          <span
            className={`hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer ${
              !hasChildren ? nonChildrenMarginClass : ""
            }`}
            onClick={goToSegment}
          >
            {item.value}
          </span>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <ul className="pl-4 space-y-2 mt-2">
          {item.children &&
            item.children.map((child) => (
              <li key={child.id}>
                <TOCItemComponent item={child} />
              </li>
            ))}
        </ul>
      )}
    </>
  );
};

// Main TOC component that renders the top-level items
const TOC: React.FC<TOCProps> = ({ items }) => {
  return (
    <div className="sticky top-0 scrollbar-hide h-screen py-4 px-3 pt-4 overflow-y-scroll">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Table of Contents
      </h2>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <TOCItemComponent item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TOC;
