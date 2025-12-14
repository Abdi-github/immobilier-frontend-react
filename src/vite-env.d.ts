/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_DEFAULT_LANGUAGE: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_ENABLE_ANALYTICS: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
