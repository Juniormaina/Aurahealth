/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_EMAILS?: string;
  readonly VITE_ADMIN_ACCESS_CODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.sol?raw' {
  const content: string;
  export default content;
}
