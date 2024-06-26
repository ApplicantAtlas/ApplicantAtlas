import React, { useEffect } from 'react';
import Head from 'next/head';

interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const defaultMetadata = {
  title: 'ApplicantAtlas | Open Source Event Management',
  description:
    'Transform your hackathon and event management process with ApplicantAtlas. Create custom forms, automate email workflows, and integrate with your favorite tools seamlessly. Discover our powerful open-source features designed to simplify and enhance your event management experience.',
  keywords:
    'Hackathon management, event management, ApplicantAtlas, open-source event management, custom form builder, automated workflows, email automation, event management tools, hackathon organizing, event automation, hackathon tools, community-driven platform, event organizer tools',
};

const Metadata: React.FC<MetadataProps> = ({
  title,
  description,
  keywords,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <Head>
      <title>{title || defaultMetadata.title}</title>
      <meta
        name="description"
        content={description || defaultMetadata.description}
      />
      <meta name="keywords" content={keywords || defaultMetadata.keywords} />
    </Head>
  );
};

export default Metadata;
