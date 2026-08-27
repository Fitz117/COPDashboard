/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GOOGLE_MAPS_MAP_ID?: string;
  readonly VITE_GOOGLE_MAPS_3D_MAP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
