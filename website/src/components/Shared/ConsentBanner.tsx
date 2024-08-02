import { useEffect, useState } from 'react';
import Link from 'next/link';

import { disablePostHog, enablePostHog } from '@/services/AnalyticsService';

const ConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consentGiven = localStorage.getItem('cookieConsent');
    if (!consentGiven) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    enablePostHog();
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    disablePostHog();
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      id="consent-banner"
      className="fixed bottom-0 z-10 flex w-full flex-col opacity-95 items-center justify-center space-y-4 bg-neutral p-2 text-neutral-content shadow-lg sm:flex-row sm:space-x-4 sm:space-y-0"
    >
      <p className="text-center text-sm sm:text-left">
        We use cookies to enhance your experience. By continuing to visit this
        site you agree to{' '}
        <Link
          href="/docs/privacy-policy"
          className="text-blue-600 hover:underline"
        >
          our use
        </Link>{' '}
        of cookies.
      </p>
      <div className="flex space-x-2">
        <button
          onClick={acceptCookies}
          className="btn btn-outline btn-success btn-sm rounded px-4 py-2"
        >
          Accept
        </button>
        <button
          onClick={declineCookies}
          className="btn-neutral btn btn-outline btn-sm rounded px-4 py-2 text-white"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
