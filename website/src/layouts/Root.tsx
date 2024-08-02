import { Montserrat } from 'next/font/google';
import Head from 'next/head';

import { ToastProvider } from '@/components/Toast/ToastContext';
import ToastErrorWrapper from '@/components/Toast/ToastErrorWrapper';
import ConsentBanner from '@/components/Shared/ConsentBanner';

const inter = Montserrat({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/favicons/favicon-57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/favicons/favicon-76.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicons/favicon-96.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/favicons/favicon-120.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/favicons/favicon-128.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/favicons/smalltile.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="144x144"
          href="/favicons/favicon-144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/favicons/favicon-152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/favicon-180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="195x195"
          href="/favicons/favicon-195.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="196x196"
          href="/favicons/favicon-196.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="228x228"
          href="/favicons/favicon-228.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="270x270"
          href="/favicons/mediumtile.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="558x270"
          href="/favicons/widetile.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="558x558"
          href="/favicons/largetile.png"
        />
      </Head>
      <ToastProvider>
        <ToastErrorWrapper />
        <div className={inter.className}>{children}</div>
        <ConsentBanner />
      </ToastProvider>
    </>
  );
}
