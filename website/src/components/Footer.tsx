import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-4 bg-white text-center shadow md:flex md:items-center md:justify-center md:p-6 md:flex-col">
      <span className="text-sm text-gray-500">
        © 2023 ApplicantAtlas LLC. All Rights Reserved.
      </span>
      <span className="text-sm text-gray-500 mt-2">
        Licensed under
        <a
          href="https://www.gnu.org/licenses/agpl-3.0.en.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {' '}
          AGPLv3
        </a>
        .{' '}
        <span>
          View on
          <a
            href="https://github.com/ApplicantAtlas/ApplicantAtlas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {' '}
            GitHub
          </a>
          .
        </span>
      </span>
      <span className="text-sm text-gray-500 mt-1">
        <a
          href="/docs/privacy-policy"
          className="text-blue-600 hover:underline"
        >
          Terms of Service
        </a>{' '}
        <a
          href="/docs/privacy-policy"
          className="text-blue-600 hover:underline sm:ml-4"
        >
          Privacy Policy
        </a>
      </span>
    </footer>
  );
};

export default Footer;
