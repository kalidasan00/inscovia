// frontend/lib/analytics.js
import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-0KHJ3KVE37';

let isInitialized = false;

export const initGA = () => {
  if (!isInitialized && typeof window !== 'undefined') {
    ReactGA.initialize(TRACKING_ID);
    isInitialized = true;
    console.log('✅ Google Analytics initialized');
  }
};

export const trackPageView = (url) => {
  if (isInitialized) {
    ReactGA.send({ hitType: 'pageview', page: url });
  }
};

export const trackEvent = (category, action, label) => {
  if (isInitialized) {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
};