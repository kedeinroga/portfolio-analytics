'use client';

import { analytics } from './firebase';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

export const logEvent = (
  eventName: string,
  eventParams?: { [key: string]: any }
) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  analytics.then((analyticInstance) => {
    if (analyticInstance) {
      console.log(`Logging event: ${eventName}`, eventParams);
      firebaseLogEvent(analyticInstance, eventName, eventParams);
    } else {
      console.log(`Firebase Analytics not supported. Event not logged: ${eventName}`, eventParams);
    }
  }).catch(error => {
    console.error("Error with analytics", error);
  });
};
