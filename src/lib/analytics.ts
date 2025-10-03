import { analytics } from "./firebase";
import { logEvent as logFirebaseEvent } from "firebase/analytics";
import * as gtag from './gtag';
import { getFirestore, collection, addDoc } from "firebase/firestore"; 
import { app } from './firebase';

const db = app ? getFirestore(app) : null;

// Function to get geolocation data from our own API endpoint
const getGeolocationData = async () => {
  try {
    const response = await fetch('/api/geolocation');
    // const response = await fetch('https://ip-api.com/json');
    if (!response.ok) {
      console.error("Error fetching geolocation from own API");
      return {};
    }
    const data = await response.json();
    return {
      country: data.country,
      city: data.city,
      lat: data.lat,
      lon: data.lon,
    };
  } catch (error) {
    console.error("Error fetching geolocation data: ", error);
    return {};
  }
};

// Generic function to log any event to Firestore
const logToFirestore = (event: object) => {
  if (!db) return;
  try {
    addDoc(collection(db, "analytics"), {
      ...event,
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Error writing to Firestore: ", error);
  }
};

export const logPageView = (url: string) => {
  // Log to Google Analytics for all page views
  analytics.then(analyticsInstance => {
    if (analyticsInstance) {
      logFirebaseEvent(analyticsInstance, "page_view", { page_path: url });
    }
  });
  gtag.pageview(new URL(url, window.location.origin));

  // OPTIMIZATION: Only log to Firestore AND get location if the page is the root ('/')
  if (url === '/') {
    const logRootView = async () => {
      const location = await getGeolocationData();
      const event = { 
        eventType: 'page_view', 
        page_path: url, 
        location // Add location only for this specific event
      };
      logToFirestore(event);
    };
    logRootView();
  }
};

export const logPageViewSpecificSection = (section: string) => {
  // Log to Google Analytics
  analytics.then(analyticsInstance => {
    if (analyticsInstance) {
      logFirebaseEvent(analyticsInstance, "page_view_specific_section", { section });
    }
  });
  gtag.event({
    action: 'view_section',
    category: 'navigation',
    label: section,
    value: 1
  });

  // Log to Firestore if section is valid (without location)
  if (section && section.trim() !== '') {
    const event = { eventType: 'page_view_specific_section', section };
    logToFirestore(event);
  }
};

export const logCvDownload = () => {
  const event = { eventType: 'cv_download' };
  // Log to Google Analytics
  analytics.then(analyticsInstance => {
    if (analyticsInstance) {
      logFirebaseEvent(analyticsInstance, "cv_download");
    }
  });
  gtag.event({
    action: 'cv_download',
    category: 'engagement',
    label: 'cv_download_button',
    value: 1
  });

  // Log to Firestore (without location)
  logToFirestore(event);
};