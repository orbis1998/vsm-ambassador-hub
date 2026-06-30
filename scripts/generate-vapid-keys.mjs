/**
 * Génère une paire de clés VAPID pour les notifications push Web.
 * Usage : node scripts/generate-vapid-keys.mjs
 * Copier la clé publique dans .env → VITE_VAPID_PUBLIC_KEY
 * Copier la clé privée dans les secrets Supabase → VAPID_PRIVATE_KEY
 */
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();
console.log("\n=== Clés VAPID Academy ===\n");
console.log("VITE_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("\n# Secret Supabase (Edge Function academy-web-push) :");
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_SUBJECT=mailto:admin@vsmcollection.com");
console.log("\n");
