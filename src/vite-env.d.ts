/// <reference types="vite/client" />

declare global {
  interface Window {
    dataLayer?: Array<Record<string, string | number | boolean | undefined>>;
  }
}

export {};
