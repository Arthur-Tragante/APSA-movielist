/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_TMDB_API_KEY?: string;
  readonly VITE_OMDB_API_KEY?: string;
  readonly VITE_USER_EMAIL?: string;
  readonly VITE_DISCORD_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

