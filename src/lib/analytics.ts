import { analytics } from "./firebase";
import { logEvent as logFirebaseEvent } from "firebase/analytics";
import * as gtag from './gtag';
import { getFirestore, collection, addDoc } from "firebase/firestore"; 
import { app } from './firebase';

const db = app ? getFirestore(app) : null;

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
  const event = { eventType: 'page_view', page_path: url };
  analytics.then(analyticsInstance => {
    if (analyticsInstance) {
      logFirebaseEvent(analyticsInstance, "page_view", { page_path: url });
    }
  });
  gtag.pageview(new URL(url, window.location.origin));
  logToFirestore(event);
};

export const logPageViewSpecificSection = (section: string) => {
  const event = { eventType: 'page_view_specific_section', section };
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
  logToFirestore(event);
};

export const logCvDownload = () => {
  const event = { eventType: 'cv_download' };
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
  logToFirestore(event);
};