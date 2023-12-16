import React from 'react';
import type { Metadata } from 'next'

// TODO: Add metadata
export const metadata: Metadata = {
  title: 'ApplicantAtlas',
  description: 'ApplicantAtlas',
}

const HomePage = () => {
  return (
      <div>
        <h1>Home Page</h1>
        <p className="text-blue-100 text-base">hello world</p>
      </div>
  );
};

export default HomePage;
