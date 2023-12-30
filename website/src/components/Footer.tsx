import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="p-4 bg-white text-center shadow md:flex md:items-center md:justify-center md:p-6 md:flex-col">
      <span className="text-sm text-gray-500">
        © 2023 David Teather. All Rights Reserved.
      </span>
      <span className="text-sm text-gray-500 mt-2">
        Licensed under
        <a
          href="https://www.gnu.org/licenses/gpl-3.0.en.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {" "}
          GPLv3
        </a>
        .{" "}
        <span>
          View on
          <a
            href="https://github.com/davidteather/ApplicantAtlas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {" "}
            GitHub
          </a>
          .
        </span>
      </span>
    </footer>
  );
};

export default Footer;
