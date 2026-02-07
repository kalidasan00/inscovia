// frontend/app/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { initGA, trackPageView } from '../lib/analytics';
import '../styles/globals.css'; // Your existing styles

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Initialize GA
    initGA();
  }, []);

  useEffect(() => {
    // Track page views on route change
    const handleRouteChange = (url) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Track initial page view
    trackPageView(router.pathname);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.pathname]);

  return <Component {...pageProps} />;
}

export default MyApp;