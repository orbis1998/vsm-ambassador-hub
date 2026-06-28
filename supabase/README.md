# Migrations Supabase — VSM Ambassador Academy

> **Ne pas exécuter automatiquement.** Copier chaque fichier dans le SQL Editor Supabase, dans l'ordre.

## Ordre d'exécution

| # | Fichier | Justification |
|---|---------|---------------|
| 001 | `001_profiles_academy_columns.sql` | Enrichit `profiles` (badge, XP) — pas de doublon `ambassadors` |
| 002 | `002_academy_learning.sql` | Cours, leçons, quiz (nouveau module) |
| 003 | `003_social_community.sql` | Réseau social privé |
| 004 | `004_academy_messaging.sql` | Messagerie (évite collision bot WhatsApp) |
| 005 | `005_academy_opportunities.sql` | Opportunités + candidatures |
| 006 | `006_academy_gamification.sql` | Badges, certificats, défis, XP |
| 007 | `007_academy_notifications.sql` | Notifications + RLS `push_outbox` |
| 008 | `008_rpc_and_views.sql` | Login RPC + vue leaderboard |
| 009 | `009_storage_policies.sql` | Buckets Storage Academy |

## SSO cross-app

Les deux apps doivent utiliser :
- Le **même projet Supabase**
- La **même clé storage** : `vsm.ecosystem.auth`

Redirection depuis le Programme :
```
https://formation.vsmcollection.com/auth/callback#access_token=TOKEN&refresh_token=TOKEN
```

## Rollback

Chaque migration utilise `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` pour être idempotente autant que possible.
