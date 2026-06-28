/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AMBASSADOR_PROGRAM_URL?: string;
  readonly VITE_ACADEMY_URL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_FCM_API_KEY?: string;
  readonly VITE_FCM_PROJECT_ID?: string;
  readonly VITE_FCM_MESSAGING_SENDER_ID?: string;
  readonly VITE_FCM_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
