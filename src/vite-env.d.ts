/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>,
    ) => void;
  }
}

export {};
