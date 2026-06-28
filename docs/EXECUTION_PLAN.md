# Plan d'exécution — VSM Ambassador Academy

> Référence : `docs/AUDIT_DB.md` · Stack réelle : **TanStack Start** + React 19 + Vite + Supabase

## Principes

1. **Ne jamais** recréer `profiles`, `orders`, `conversations` (bot), etc.
2. **Enrichir** `profiles` pour badge/XP/niveau (un seul compte ambassadeur).
3. **Préfixer** les nouvelles tables : `academy_*`, `social_*`.
4. **Messagerie** : `academy_conversations` / `academy_messages` (évite collision WhatsApp).
5. Migrations SQL dans `supabase/migrations/` — **à exécuter manuellement** dans Supabase SQL Editor.

---

## Phases

| Phase | Contenu | Statut |
|-------|---------|--------|
| **0** | Audit DB (fait) | ✅ |
| **1** | Migrations SQL + types + auth `profiles` + SSO + Landing | 🔄 |
| **2** | Module Académie (cours, leçons, quiz, progression) | ⏳ |
| **3** | Gamification (XP, badges, défis, classement) | ⏳ |
| **4** | Communauté (posts, stories, groupes, followers) | ⏳ |
| **5** | Messagerie Realtime (`academy_*`) | ⏳ |
| **6** | Opportunités + candidatures | ⏳ |
| **7** | Certificats PDF/QR | ⏳ |
| **8** | Notifications (`push_outbox` + in-app) | ⏳ |
| **9** | Admin Academy + polish PWA/Lighthouse | ⏳ |
| **10** | Suppression définitive des mocks | ⏳ |

---

## SSO cross-app (Program → Academy)

**Program** redirige vers :
```
https://formation.vsmcollection.com/auth/callback#access_token=...&refresh_token=...&type=...
```
ou (recommandé hash Supabase standard) :
```
https://formation.vsmcollection.com/auth/callback#access_token=...&refresh_token=...
```

**Academy** (`/auth/callback`) appelle `supabase.auth.setSession()` puis redirige `/dashboard`.

**Clé storage partagée** : `vsm.ecosystem.auth` (même projet Supabase).

**Landing** (`/`) : session valide → `/dashboard`, sinon page marketing.

---

## Fichiers migrations (ordre d'exécution)

1. `001_profiles_academy_columns.sql` — ALTER `profiles` (justifié : données ambassadeur unifiées)
2. `002_academy_learning.sql` — cours, leçons, quiz, progression
3. `003_social_community.sql` — posts, stories, comments, reactions, followers, groups
4. `004_academy_messaging.sql` — conversations/messages Academy
5. `005_academy_opportunities.sql` — opportunités + candidatures
6. `006_academy_gamification.sql` — badges, certificats, défis, xp_history
7. `007_academy_notifications.sql` — notifications in-app + RLS `push_outbox`
8. `008_rpc_and_views.sql` — `resolve_ambassador_login`, `is_ambassador`, vues leaderboard
9. `009_storage_policies.sql` — buckets/policies Storage

---

## Mapping mock → Supabase

| Mock actuel | Source réelle |
|-------------|---------------|
| `currentUser` | `profiles` + `auth.users` |
| `ambassadors[]` | `profiles` + `user_roles` (role ambassador) |
| `academy-data.ts` | `academy_courses`, `academy_lessons`, … |
| `social-data.ts` | `social_posts`, `social_stories`, … |
| `conversations/messages` mock | `academy_conversations`, `academy_messages` |
| `notifications` mock | `academy_notifications` + `push_outbox` |
