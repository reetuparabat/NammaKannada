'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('NammaKannada ServiceWorker registered: ', registration.scope);
          })
          .catch((err) => {
            console.warn('NammaKannada ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  return null;
}
