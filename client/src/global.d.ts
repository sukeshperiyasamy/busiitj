// Type definitions for client-side environment variables
interface ImportMetaEnv {
  readonly GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type definitions for Google Maps API
interface Window {
  google?: any;
  initMap?: () => void;
}