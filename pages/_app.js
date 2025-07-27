import '../src/index.css';
import '../src/App.css';
import { SessionProvider } from 'next-auth/react';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
