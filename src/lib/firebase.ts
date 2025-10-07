'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { env } from './env';

const firebaseConfig = env.firebase;

let app: FirebaseApp | undefined;

if (firebaseConfig.projectId) {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Failed to initialize Firebase", e);
    }
  } else {
    app = getApps()[0];
  }
}


const analytics: Promise<Analytics | null> =
  typeof window !== 'undefined' && app
    ? isSupported().then((yes) => (yes ? getAnalytics(app!) : null))
    : Promise.resolve(null);

export { app, analytics };
