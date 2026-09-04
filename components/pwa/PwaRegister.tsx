'use client';

import { useEffect } from 'react';

export const PwaRegister: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('TrackIT ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('TrackIT ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
};
