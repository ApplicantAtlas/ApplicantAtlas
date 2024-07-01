import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const RedirectPage = () => {
  const router = useRouter();
  const { toUrl } = router.query as { toUrl: string };
  const [parsedUrl, setParsedUrl] = useState('');

  useEffect(() => {
    if (toUrl) {
      // Decode the URL and set it to the state
      const decodedUrl = decodeURIComponent(toUrl);
      setParsedUrl(decodedUrl);
      // Redirect to the parsed URL
      router.push(decodedUrl);
    }
  }, [toUrl, router]);

  return (
    <div>
      <p>Redirecting...</p>
      {/* Optionally, you can include a fallback link */}
      {parsedUrl && (
        <p>
          If you are not redirected, click <a href={parsedUrl}>here</a>.
        </p>
      )}
    </div>
  );
};

export default RedirectPage;
