import { AppProps } from "next/app";
import { Provider } from 'react-redux';
import store from '@/store';

import "../styles/global.css";
import RootLayout from "@/layouts/Root";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <RootLayout>
        <Component {...pageProps} />
      </RootLayout>
    </Provider>
  );
}

export default MyApp;
