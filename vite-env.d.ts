
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob: (pattern: string | string[], options?: any) => Record<string, any>;
}
