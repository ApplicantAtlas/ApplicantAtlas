import React from 'react';

const DisabledBackend: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="max-w-md p-8 space-y-4 text-center bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-red-600">
          Managed Hosting Coming Soon
        </h1>
        <p className="text-lg">
          The project, including the backend is functional. We are currently
          working on hosting solutions to support serverless technologies.
        </p>
        <p className="text-lg">
          We are seeking sponsorships to run the backend for free and developing
          a paid solution for a fully managed solution. In the meantime, you can
          run your own instance by visiting our GitHub repository.
        </p>
        <a
          href="https://github.com/davidteather/ApplicantAtlas"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700"
        >
          View GitHub Repository
        </a>
      </div>
    </div>
  );
};

export default DisabledBackend;
