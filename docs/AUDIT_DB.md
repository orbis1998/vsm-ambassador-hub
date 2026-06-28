# Audit Base de Données — VSM Ambassador Program

> **Généré le :** 2026-06-27T17:18:04.525Z  
> **Mode :** lecture seule — aucune modification effectuée  
> **Projet :** ehmgjgrekjoaohnnlfmw (eu-west-1)  
> **Statut :** EN ATTENTE DE VALIDATION — ne pas exécuter les migrations sans accord

---

## Résumé exécutif

| Métrique | Valeur |
|---|---|
| Tables public | 52 |
| Colonnes totales | 417 |
| Clés étrangères | 61 |
| Politiques RLS | 99 |
| Fonctions public | 27 |
| Types ENUM | 0 |
| Buckets Storage | 5 |
| Tables planifiées absentes | 29 |
| Tables existantes hors plan | 48 |

---

## 1. Tables existantes (52)

### `academy_activity_logs` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `event_type` | text | NO | — |
| `payload` | jsonb | NO | '{}'::jsonb |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_badges` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `slug` | text | NO | — |
| `title` | text | NO | — |
| `description` | text | YES | — |
| `icon_url` | text | YES | — |
| `rarity` | text | NO | 'common'::text |
| `xp_reward` | integer | NO | 0 |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_certificates` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `course_id` | uuid | YES | — |
| `title` | text | NO | — |
| `serial_number` | text | NO | — |
| `qr_payload` | text | NO | — |
| `pdf_url` | text | YES | — |
| `issued_at` | timestamp with time zone | NO | now() |

### `academy_challenge_progress` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `challenge_id` | uuid | NO | — |
| `user_id` | uuid | NO | — |
| `progress_percent` | integer | NO | 0 |
| `completed_at` | timestamp with time zone | YES | — |
| `score` | integer | NO | 0 |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_challenges` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `title` | text | NO | — |
| `description` | text | NO | ''::text |
| `type` | text | NO | 'weekly'::text |
| `goal` | text | NO | — |
| `reward_xp` | integer | NO | 100 |
| `reward_points` | integer | NO | 50 |
| `deadline` | timestamp with time zone | NO | — |
| `is_active` | boolean | NO | true |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_conversations` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `participant_ids` | ARRAY | NO | — |
| `is_group` | boolean | NO | false |
| `title` | text | YES | — |
| `last_message` | text | YES | — |
| `last_message_at` | timestamp with time zone | NO | now() |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_course_progress` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `course_id` | uuid | NO | — |
| `progress_percent` | integer | NO | 0 |
| `completed_at` | timestamp with time zone | YES | — |
| `last_lesson_id` | uuid | YES | — |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_courses` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `slug` | text | NO | — |
| `title` | text | NO | — |
| `description` | text | YES | — |
| `category` | text | NO | 'Brand'::text |
| `difficulty` | text | NO | 'beginner'::text |
| `cover_url` | text | YES | — |
| `duration_minutes` | integer | YES | 0 |
| `lesson_count` | integer | YES | 0 |
| `is_published` | boolean | NO | false |
| `is_parcours` | boolean | NO | false |
| `parent_parcours_id` | uuid | YES | — |
| `sort_order` | integer | NO | 0 |
| `reward_xp` | integer | NO | 0 |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_favorites` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `user_id` | uuid | NO | — |
| `course_id` | uuid | NO | — |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_lesson_progress` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `lesson_id` | uuid | NO | — |
| `completed` | boolean | NO | false |
| `watch_seconds` | integer | NO | 0 |
| `completed_at` | timestamp with time zone | YES | — |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_lessons` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `course_id` | uuid | NO | — |
| `title` | text | NO | — |
| `description` | text | YES | — |
| `position` | integer | NO | 0 |
| `video_url` | text | YES | — |
| `video_duration_seconds` | integer | YES | 0 |
| `content_md` | text | YES | — |
| `is_free_preview` | boolean | NO | false |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_messages` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `conversation_id` | uuid | NO | — |
| `author_id` | uuid | NO | — |
| `type` | text | NO | 'text'::text |
| `body` | text | NO | ''::text |
| `metadata` | jsonb | NO | '{}'::jsonb |
| `read_by` | ARRAY | NO | '{}'::uuid[] |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_notifications` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `type` | text | NO | — |
| `title` | text | NO | — |
| `body` | text | NO | ''::text |
| `actor_id` | uuid | YES | — |
| `link` | text | YES | — |
| `read` | boolean | NO | false |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_opportunities` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `title` | text | NO | — |
| `category` | text | NO | — |
| `description` | text | NO | ''::text |
| `image_url` | text | YES | — |
| `location` | text | YES | — |
| `starts_at` | timestamp with time zone | YES | — |
| `ends_at` | timestamp with time zone | YES | — |
| `slots` | integer | NO | 1 |
| `reward` | text | YES | — |
| `conditions` | ARRAY | NO | '{}'::text[] |
| `status` | text | NO | 'open'::text |
| `is_published` | boolean | NO | true |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_opportunity_applications` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `opportunity_id` | uuid | NO | — |
| `user_id` | uuid | NO | — |
| `status` | text | NO | 'pending'::text |
| `message` | text | YES | — |
| `admin_note` | text | YES | — |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_push_subscriptions` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `endpoint` | text | NO | — |
| `p256dh` | text | NO | — |
| `auth` | text | NO | — |
| `channels` | ARRAY | NO | '{}'::text[] |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_quiz_attempts` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `quiz_id` | uuid | NO | — |
| `score` | integer | NO | — |
| `passed` | boolean | NO | — |
| `answers` | jsonb | NO | '{}'::jsonb |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_quizzes` — ✅ RLS ON (0 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `lesson_id` | uuid | YES | — |
| `course_id` | uuid | YES | — |
| `title` | text | NO | — |
| `passing_score` | integer | NO | 70 |
| `questions` | jsonb | NO | '[]'::jsonb |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_resources` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `title` | text | NO | — |
| `category` | text | NO | 'template'::text |
| `file_url` | text | NO | — |
| `thumbnail_url` | text | YES | — |
| `is_published` | boolean | NO | true |
| `created_at` | timestamp with time zone | NO | now() |

### `academy_typing` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `conversation_id` | uuid | NO | — |
| `user_id` | uuid | NO | — |
| `updated_at` | timestamp with time zone | NO | now() |

### `academy_user_badges` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `user_id` | uuid | NO | — |
| `badge_id` | uuid | NO | — |
| `earned_at` | timestamp with time zone | NO | now() |

### `academy_xp_history` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `amount` | integer | NO | — |
| `source` | text | NO | — |
| `reference_id` | uuid | YES | — |
| `created_at` | timestamp with time zone | NO | now() |

### `ambassador_applications` — ✅ RLS ON (5 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('ambassador_applications_id_seq'::regclass) |
| `full_name` | text | NO | — |
| `phone` | text | NO | — |
| `username` | text | NO | — |
| `main_platform` | text | NO | — |
| `profile_url` | text | YES | — |
| `motivation` | text | NO | — |
| `status` | text | NO | 'pending'::text |
| `created_at` | timestamp with time zone | YES | now() |
| `email` | text | YES | — |
| `user_id` | uuid | YES | — |

### `ambassador_clicks` — ✅ RLS ON (4 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('ambassador_clicks_id_seq'::regclass) |
| `link_id` | bigint | NO | — |
| `clicked_at` | timestamp with time zone | YES | now() |
| `product_id` | bigint | YES | — |
| `referrer` | text | YES | — |
| `user_agent` | text | YES | — |

### `ambassador_links` — ✅ RLS ON (5 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('ambassador_links_id_seq'::regclass) |
| `ambassador_id` | uuid | NO | — |
| `promo_code_id` | bigint | YES | — |
| `target_type` | text | NO | — |
| `target_product_id` | bigint | YES | — |
| `slug` | text | NO | — |
| `created_at` | timestamp with time zone | YES | now() |
| `active` | boolean | NO | true |

### `ambassador_withdrawal_requests` — ✅ RLS ON (4 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | — |
| `ambassador_id` | uuid | NO | — |
| `status` | text | NO | 'pending'::text |
| `mobile_operator` | text | NO | — |
| `msisdn` | text | NO | — |
| `beneficiary_name` | text | NO | — |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |
| `admin_note` | text | YES | — |

### `bot_config` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | text | NO | 'main'::text |
| `bot_active` | boolean | NO | true |
| `system_prompt` | text | NO | ''::text |
| `model` | text | NO | 'llama-3.1-8b-instant'::text |
| `fallback_model` | text | NO | 'llama-3.3-70b-versatile'::text |
| `whisper_model` | text | NO | 'whisper-large-v3'::text |
| `max_tokens` | integer | NO | 512 |
| `temperature` | real | NO | 0.4 |
| `delay_ms` | integer | NO | 800 |
| `memory_msgs` | integer | NO | 8 |
| `quick_replies` | jsonb | NO | '{}'::jsonb |
| `product_keywords` | ARRAY | NO | ARRAY[]::text[] |
| `behavior` | jsonb | NO | '{}'::jsonb |
| `updated_at` | timestamp with time zone | NO | now() |

### `conversations` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `phone` | text | NO | — |
| `name` | text | YES | — |
| `last_message` | text | YES | — |
| `last_ts` | timestamp with time zone | YES | now() |
| `messages_count` | integer | NO | 0 |
| `created_at` | timestamp with time zone | NO | now() |

### `couriers` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | — |
| `full_name` | text | NO | — |
| `phone` | text | YES | — |
| `is_active` | boolean | NO | true |
| `notes` | text | YES | — |
| `created_at` | timestamp with time zone | NO | now() |

### `delivery_zones` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('delivery_zones_id_seq'::regclass) |
| `name` | text | NO | — |
| `city` | text | YES | — |
| `price` | numeric | YES | — |
| `is_active` | boolean | NO | true |

### `expenses` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | — |
| `title` | text | NO | — |
| `category` | text | NO | 'other'::text |
| `amount` | numeric | NO | — |
| `expense_date` | date | NO | CURRENT_DATE |
| `notes` | text | YES | — |
| `created_by` | uuid | YES | — |
| `created_at` | timestamp with time zone | NO | now() |

### `logs` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `level` | text | NO | — |
| `message` | text | NO | — |
| `ts` | timestamp with time zone | NO | now() |

### `messages` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `conversation_id` | uuid | YES | — |
| `role` | text | NO | — |
| `content` | text | NO | — |
| `model` | text | YES | — |
| `media_type` | text | YES | — |
| `ts` | timestamp with time zone | NO | now() |

### `order_items` — ✅ RLS ON (3 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | — |
| `order_id` | bigint | NO | — |
| `product_id` | bigint | YES | — |
| `product_name` | text | NO | — |
| `size` | text | YES | — |
| `color` | text | YES | — |
| `quantity` | integer | NO | 1 |
| `unit_price` | numeric | NO | — |
| `created_at` | timestamp with time zone | YES | now() |
| `unit_cost` | numeric | NO | 0 |

### `orders` — ✅ RLS ON (7 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('orders_id_seq'::regclass) |
| `customer_id` | uuid | YES | — |
| `total_amount` | numeric | NO | — |
| `status` | text | NO | — |
| `created_at` | timestamp with time zone | YES | now() |
| `promo_code_id` | bigint | YES | — |
| `ambassador_id` | uuid | YES | — |
| `source_link_id` | bigint | YES | — |
| `user_id` | uuid | YES | — |
| `customer_name` | text | YES | — |
| `customer_phone` | text | YES | — |
| `delivery_address` | text | YES | — |
| `delivery_date` | text | YES | — |
| `delivery_fee` | numeric | YES | 0 |
| `notes` | text | YES | — |
| `promo_discount` | numeric | YES | 0 |
| `order_source` | text | NO | 'website'::text |
| `courier_id` | bigint | YES | — |

### `product_variants` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | — |
| `product_id` | bigint | NO | — |
| `color` | text | NO | — |
| `size` | text | NO | — |
| `stock` | integer | NO | 0 |
| `created_at` | timestamp with time zone | YES | now() |

### `products` — ✅ RLS ON (3 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('products_id_seq'::regclass) |
| `name` | text | NO | — |
| `price` | numeric | YES | — |
| `is_active` | boolean | NO | true |
| `sku` | text | YES | — |
| `stock` | integer | YES | — |
| `created_at` | timestamp with time zone | NO | now() |
| `description` | text | YES | — |
| `category` | text | YES | — |
| `image_url` | text | YES | — |
| `images` | ARRAY | YES | — |
| `updated_at` | timestamp with time zone | YES | now() |
| `unit_cost` | numeric | NO | 0 |

### `profiles` — ✅ RLS ON (7 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | — |
| `role` | text | NO | 'client'::text |
| `name` | text | YES | — |
| `phone` | text | YES | — |
| `created_at` | timestamp with time zone | YES | now() |
| `updated_at` | timestamp with time zone | YES | now() |
| `email` | text | YES | — |
| `email_verified` | boolean | YES | false |
| `phone_verified` | boolean | YES | false |
| `full_name` | text | YES | — |
| `badge` | text | YES | — |
| `handle` | text | YES | — |
| `avatar_url` | text | YES | — |
| `bio` | text | YES | — |
| `country` | text | YES | — |
| `xp` | integer | NO | 0 |
| `points` | integer | NO | 0 |
| `level` | text | NO | 'Rookie'::text |
| `academy_progress` | integer | NO | 0 |

### `promo_codes` — ✅ RLS ON (5 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('promo_codes_id_seq'::regclass) |
| `code` | text | NO | — |
| `description` | text | YES | — |
| `discount_type` | text | NO | — |
| `discount_value` | numeric | NO | — |
| `is_global` | boolean | NO | false |
| `ambassador_id` | uuid | YES | — |
| `active` | boolean | NO | true |
| `valid_from` | timestamp with time zone | YES | — |
| `valid_to` | timestamp with time zone | YES | — |
| `max_usage` | integer | YES | — |
| `usage_count` | integer | NO | 0 |
| `created_at` | timestamp with time zone | YES | now() |

### `push_outbox` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | bigint | NO | nextval('push_outbox_id_seq'::regclass) |
| `user_id` | uuid | NO | — |
| `title` | text | NO | — |
| `body` | text | NO | — |
| `url` | text | NO | '/dashboard'::text |
| `event_type` | text | NO | — |
| `payload` | jsonb | NO | '{}'::jsonb |
| `created_at` | timestamp with time zone | NO | now() |
| `processed_at` | timestamp with time zone | YES | — |
| `error` | text | YES | — |

### `settings` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `key` | text | NO | — |
| `value` | text | YES | — |
| `description` | text | YES | — |

### `social_comments` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `post_id` | uuid | NO | — |
| `author_id` | uuid | NO | — |
| `parent_id` | uuid | YES | — |
| `text` | text | NO | — |
| `likes_count` | integer | NO | 0 |
| `pinned` | boolean | NO | false |
| `created_at` | timestamp with time zone | NO | now() |

### `social_followers` — ✅ RLS ON (3 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `follower_id` | uuid | NO | — |
| `following_id` | uuid | NO | — |
| `created_at` | timestamp with time zone | NO | now() |

### `social_group_members` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `group_id` | uuid | NO | — |
| `user_id` | uuid | NO | — |
| `role` | text | NO | 'member'::text |
| `joined_at` | timestamp with time zone | NO | now() |

### `social_groups` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `name` | text | NO | — |
| `slug` | text | NO | — |
| `description` | text | YES | — |
| `cover_url` | text | YES | — |
| `category` | text | NO | 'General'::text |
| `privacy` | text | NO | 'public'::text |
| `created_by` | uuid | YES | — |
| `created_at` | timestamp with time zone | NO | now() |

### `social_posts` — ✅ RLS ON (4 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `author_id` | uuid | NO | — |
| `text` | text | NO | ''::text |
| `media` | jsonb | NO | '[]'::jsonb |
| `group_id` | uuid | YES | — |
| `tags` | ARRAY | NO | '{}'::text[] |
| `comments_count` | integer | NO | 0 |
| `shares_count` | integer | NO | 0 |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |

### `social_reactions` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `post_id` | uuid | NO | — |
| `user_id` | uuid | NO | — |
| `reaction` | text | NO | — |
| `created_at` | timestamp with time zone | NO | now() |

### `social_saved_posts` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `user_id` | uuid | NO | — |
| `post_id` | uuid | NO | — |
| `created_at` | timestamp with time zone | NO | now() |

### `social_stories` — ✅ RLS ON (2 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `author_id` | uuid | NO | — |
| `media_url` | text | NO | — |
| `caption` | text | YES | — |
| `expires_at` | timestamp with time zone | NO | — |
| `created_at` | timestamp with time zone | NO | now() |

### `social_story_views` — ✅ RLS ON (0 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `story_id` | uuid | NO | — |
| `viewer_id` | uuid | NO | — |
| `viewed_at` | timestamp with time zone | NO | now() |

### `user_roles` — ✅ RLS ON (3 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `user_id` | uuid | NO | — |
| `role` | text | NO | — |
| `created_at` | timestamp with time zone | NO | now() |

### `whatsapp_sessions` — ✅ RLS ON (1 politiques)

| Colonne | Type | Nullable | Défaut |
|---|---|---|---|
| `id` | text | NO | 'main'::text |
| `connected` | boolean | NO | false |
| `status` | text | NO | 'disconnected'::text |
| `phone_number` | text | YES | — |
| `qr_code` | text | YES | — |
| `connected_at` | timestamp with time zone | YES | — |
| `updated_at` | timestamp with time zone | NO | now() |

---

## 2. Relations (clés étrangères)

| Table source | Colonne | → Table cible | Colonne | ON DELETE | ON UPDATE |
|---|---|---|---|---|---|
| `academy_activity_logs` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_certificates` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_certificates` | `course_id` | `academy_courses` | `id` | SET NULL | NO ACTION |
| `academy_challenge_progress` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_challenge_progress` | `challenge_id` | `academy_challenges` | `id` | CASCADE | NO ACTION |
| `academy_course_progress` | `last_lesson_id` | `academy_lessons` | `id` | SET NULL | NO ACTION |
| `academy_course_progress` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_course_progress` | `course_id` | `academy_courses` | `id` | CASCADE | NO ACTION |
| `academy_courses` | `parent_parcours_id` | `academy_courses` | `id` | SET NULL | NO ACTION |
| `academy_favorites` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_favorites` | `course_id` | `academy_courses` | `id` | CASCADE | NO ACTION |
| `academy_lesson_progress` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_lesson_progress` | `lesson_id` | `academy_lessons` | `id` | CASCADE | NO ACTION |
| `academy_lessons` | `course_id` | `academy_courses` | `id` | CASCADE | NO ACTION |
| `academy_messages` | `author_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_messages` | `conversation_id` | `academy_conversations` | `id` | CASCADE | NO ACTION |
| `academy_notifications` | `actor_id` | `profiles` | `id` | SET NULL | NO ACTION |
| `academy_notifications` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_opportunity_applications` | `opportunity_id` | `academy_opportunities` | `id` | CASCADE | NO ACTION |
| `academy_opportunity_applications` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_push_subscriptions` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_quiz_attempts` | `quiz_id` | `academy_quizzes` | `id` | CASCADE | NO ACTION |
| `academy_quiz_attempts` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_quizzes` | `course_id` | `academy_courses` | `id` | CASCADE | NO ACTION |
| `academy_quizzes` | `lesson_id` | `academy_lessons` | `id` | CASCADE | NO ACTION |
| `academy_typing` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_typing` | `conversation_id` | `academy_conversations` | `id` | CASCADE | NO ACTION |
| `academy_user_badges` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `academy_user_badges` | `badge_id` | `academy_badges` | `id` | CASCADE | NO ACTION |
| `academy_xp_history` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `ambassador_clicks` | `link_id` | `ambassador_links` | `id` | CASCADE | NO ACTION |
| `ambassador_links` | `ambassador_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `ambassador_links` | `promo_code_id` | `promo_codes` | `id` | SET NULL | NO ACTION |
| `ambassador_withdrawal_requests` | `ambassador_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `messages` | `conversation_id` | `conversations` | `id` | CASCADE | NO ACTION |
| `order_items` | `product_id` | `products` | `id` | SET NULL | NO ACTION |
| `order_items` | `order_id` | `orders` | `id` | CASCADE | NO ACTION |
| `orders` | `courier_id` | `couriers` | `id` | SET NULL | NO ACTION |
| `orders` | `source_link_id` | `ambassador_links` | `id` | NO ACTION | NO ACTION |
| `orders` | `customer_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `orders` | `promo_code_id` | `promo_codes` | `id` | NO ACTION | NO ACTION |
| `orders` | `ambassador_id` | `profiles` | `id` | NO ACTION | NO ACTION |
| `product_variants` | `product_id` | `products` | `id` | CASCADE | NO ACTION |
| `promo_codes` | `ambassador_id` | `profiles` | `id` | SET NULL | NO ACTION |
| `social_comments` | `author_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_comments` | `parent_id` | `social_comments` | `id` | CASCADE | NO ACTION |
| `social_comments` | `post_id` | `social_posts` | `id` | CASCADE | NO ACTION |
| `social_followers` | `follower_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_followers` | `following_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_group_members` | `group_id` | `social_groups` | `id` | CASCADE | NO ACTION |
| `social_group_members` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_groups` | `created_by` | `profiles` | `id` | SET NULL | NO ACTION |
| `social_posts` | `group_id` | `social_groups` | `id` | SET NULL | NO ACTION |
| `social_posts` | `author_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_reactions` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_reactions` | `post_id` | `social_posts` | `id` | CASCADE | NO ACTION |
| `social_saved_posts` | `user_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_saved_posts` | `post_id` | `social_posts` | `id` | CASCADE | NO ACTION |
| `social_stories` | `author_id` | `profiles` | `id` | CASCADE | NO ACTION |
| `social_story_views` | `story_id` | `social_stories` | `id` | CASCADE | NO ACTION |
| `social_story_views` | `viewer_id` | `profiles` | `id` | CASCADE | NO ACTION |

---

## 3. Contraintes UNIQUE

- `academy_badges.slug` (academy_badges_slug_key)
- `academy_certificates.serial_number` (academy_certificates_serial_number_key)
- `academy_challenge_progress.user_id` (academy_challenge_progress_challenge_id_user_id_key)
- `academy_challenge_progress.challenge_id` (academy_challenge_progress_challenge_id_user_id_key)
- `academy_course_progress.course_id` (academy_course_progress_user_id_course_id_key)
- `academy_course_progress.user_id` (academy_course_progress_user_id_course_id_key)
- `academy_courses.slug` (academy_courses_slug_key)
- `academy_lesson_progress.user_id` (academy_lesson_progress_user_id_lesson_id_key)
- `academy_lesson_progress.lesson_id` (academy_lesson_progress_user_id_lesson_id_key)
- `academy_lessons.position` (academy_lessons_course_id_position_key)
- `academy_lessons.course_id` (academy_lessons_course_id_position_key)
- `academy_opportunity_applications.user_id` (academy_opportunity_applications_opportunity_id_user_id_key)
- `academy_opportunity_applications.opportunity_id` (academy_opportunity_applications_opportunity_id_user_id_key)
- `academy_push_subscriptions.user_id` (academy_push_subscriptions_user_id_endpoint_key)
- `academy_push_subscriptions.endpoint` (academy_push_subscriptions_user_id_endpoint_key)
- `ambassador_links.slug` (ambassador_links_slug_key)
- `conversations.phone` (conversations_phone_key)
- `product_variants.size` (product_variants_product_id_color_size_key)
- `product_variants.product_id` (product_variants_product_id_color_size_key)
- `product_variants.color` (product_variants_product_id_color_size_key)
- `products.sku` (products_sku_unique)
- `promo_codes.code` (promo_codes_code_key)
- `social_groups.slug` (social_groups_slug_key)
- `user_roles.role` (user_roles_user_id_role_key)
- `user_roles.user_id` (user_roles_user_id_role_key)

---

## 4. Politiques RLS

### `academy_activity_logs`

**academy_activity_own** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`

### `academy_badges`

**academy_badges_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

### `academy_certificates`

**academy_certs_own** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((user_id = auth.uid()) OR is_admin())`

### `academy_challenge_progress`

**academy_challenge_prog_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_challenges`

**academy_challenges_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((is_active = true) OR is_admin())`

### `academy_conversations`

**academy_conv_participant** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(auth.uid() = ANY (participant_ids))`
- WITH CHECK: `(auth.uid() = ANY (participant_ids))`

### `academy_course_progress`

**academy_progress_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_courses`

**academy_courses_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((is_published = true) OR is_admin())`

### `academy_favorites`

**academy_favorites_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_lesson_progress`

**academy_lesson_progress_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_lessons`

**academy_lessons_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM academy_courses c
  WHERE ((c.id = academy_lessons.course_id) AND (c.is_published OR is_admin()))))`

### `academy_messages`

**academy_msg_participant** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM academy_conversations c
  WHERE ((c.id = academy_messages.conversation_id) AND (auth.uid() = ANY (c.participant_ids)))))`
- WITH CHECK: `(author_id = auth.uid())`

### `academy_notifications`

**academy_notif_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_opportunities`

**academy_opp_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((is_published = true) OR is_admin())`

### `academy_opportunity_applications`

**academy_opp_apps_admin** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**academy_opp_apps_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_push_subscriptions`

**academy_push_sub_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_quiz_attempts`

**academy_quiz_attempts_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_resources`

**academy_resources_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((is_published = true) OR is_admin())`

### `academy_typing`

**academy_typing_participant** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `academy_user_badges`

**academy_user_badges_own** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(user_id = auth.uid())`

**academy_user_badges_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

### `academy_xp_history`

**academy_xp_own** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`

### `ambassador_applications`

**Ambassador insert** (INSERT) — rôles: {anon} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

**Anyone can submit ambassador application** (INSERT) — rôles: {anon,authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `((user_id IS NULL) OR (user_id = auth.uid()))`

**admin_all_ambassador_applications** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**ambassador_apps_insert_own** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `((user_id = auth.uid()) AND (lower(COALESCE(status, ''::text)) = 'pending'::text))`

**ambassador_apps_select_own** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`

### `ambassador_clicks`

**Amb clicks admin** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`
- WITH CHECK: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`

**Amb clicks insert public** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

**Amb clicks self select** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM ambassador_links l
  WHERE ((l.id = ambassador_clicks.link_id) AND (l.ambassador_id = auth.uid()))))`

**admin_all_ambassador_clicks** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

### `ambassador_links`

**Amb links admin** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`
- WITH CHECK: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`

**Amb links self insert** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(ambassador_id = auth.uid())`

**Amb links self select** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(ambassador_id = auth.uid())`

**Amb links self update** (UPDATE) — rôles: {public} — permissive: PERMISSIVE

- USING: `(ambassador_id = auth.uid())`

**admin_all_ambassador_links** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

### `ambassador_withdrawal_requests`

**Admins manage withdrawal requests** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `has_role(auth.uid(), 'admin'::text)`
- WITH CHECK: `has_role(auth.uid(), 'admin'::text)`

**Ambassadors view own withdrawal requests** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(ambassador_id = auth.uid())`

**ambassador_withdrawals_insert_own** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(ambassador_id = auth.uid())`

**ambassador_withdrawals_select_own** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(ambassador_id = auth.uid())`

### `bot_config`

**anon all bot_config** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

### `conversations`

**anon all conversations** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

### `couriers`

**Admins manage couriers** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `has_role(auth.uid(), 'admin'::text)`
- WITH CHECK: `has_role(auth.uid(), 'admin'::text)`

### `delivery_zones`

**admin_all_delivery_zones** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**public_read_active_delivery_zones** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(is_active = true)`

### `expenses`

**Admins manage expenses** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `has_role(auth.uid(), 'admin'::text)`
- WITH CHECK: `has_role(auth.uid(), 'admin'::text)`

### `logs`

**anon all logs** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

### `messages`

**anon all messages** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

### `order_items`

**Admins can manage order items** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `has_role(auth.uid(), 'admin'::text)`
- WITH CHECK: `has_role(auth.uid(), 'admin'::text)`

**customer_read_own_order_items** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.customer_id = auth.uid()))))`

**insert_order_items** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

### `orders`

**Admins can manage orders** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `has_role(auth.uid(), 'admin'::text)`
- WITH CHECK: `has_role(auth.uid(), 'admin'::text)`

**Ambassadors view attributed orders** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((ambassador_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM promo_codes pc
  WHERE ((pc.id = orders.promo_code_id) AND (pc.ambassador_id = auth.uid())))))`

**Orders admin full** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`
- WITH CHECK: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`

**Orders ambassador read own** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(ambassador_id = auth.uid())`

**Orders customer read own** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(customer_id = auth.uid())`

**admin_all_orders** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**insert_orders_authenticated** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

### `product_variants`

**admin_all_variants** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**public_read_variants** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`

### `products`

**Allow public read access** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`

**admin_all_products** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**public_read_active_products** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(is_active = true)`

### `profiles`

**Allow individual insert** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(auth.uid() = id)`

**Profiles insert own** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(auth.uid() = id)`

**Profiles select own** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(auth.uid() = id)`

**Profiles update own** (UPDATE) — rôles: {public} — permissive: PERMISSIVE

- USING: `(auth.uid() = id)`

**admin_all_profiles** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**profiles_insert_own** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(id = auth.uid())`

**profiles_select_ambassadors_public** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = profiles.id) AND (ur.role = ANY (ARRAY['ambassador'::text, 'admin'::text]))))) OR has_role(auth.uid(), 'ambassador'::text) OR has_role(auth.uid(), 'admin'::text))`

### `promo_codes`

**Promo admin full** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`
- WITH CHECK: `(EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))`

**Promo ambassador read own** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `((is_global = true) OR (ambassador_id = auth.uid()))`

**admin_all_promo_codes** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**promo_codes_select_active** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(active = true)`

**promo_codes_select_own_ambassador** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(ambassador_id = auth.uid())`

### `push_outbox`

**push_outbox_select_own** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`

### `settings`

**admin_all_settings** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `is_admin()`
- WITH CHECK: `is_admin()`

**public_read_settings** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`

### `social_comments`

**social_comments_insert** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(author_id = auth.uid())`

**social_comments_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

### `social_followers`

**social_followers_delete** (DELETE) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(follower_id = auth.uid())`

**social_followers_insert** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(follower_id = auth.uid())`

**social_followers_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

### `social_group_members`

**social_group_members_join** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(user_id = auth.uid())`

**social_group_members_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

### `social_groups`

**social_groups_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

### `social_posts`

**social_posts_delete_own** (DELETE) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `((author_id = auth.uid()) OR is_admin())`

**social_posts_insert** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(author_id = auth.uid())`

**social_posts_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`

**social_posts_update_own** (UPDATE) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(author_id = auth.uid())`

### `social_reactions`

**social_reactions_all** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `social_saved_posts`

**social_saved_own** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(user_id = auth.uid())`
- WITH CHECK: `(user_id = auth.uid())`

### `social_stories`

**social_stories_insert** (INSERT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `(author_id = auth.uid())`

**social_stories_read** (SELECT) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `(expires_at > now())`

### `user_roles`

**Admins can manage roles** (ALL) — rôles: {authenticated} — permissive: PERMISSIVE

- USING: `has_role(auth.uid(), 'admin'::text)`
- WITH CHECK: `has_role(auth.uid(), 'admin'::text)`

**Allow role insertion for new users** (INSERT) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

**Users can view own roles** (SELECT) — rôles: {public} — permissive: PERMISSIVE

- USING: `(auth.uid() = user_id)`

### `whatsapp_sessions`

**anon all whatsapp_sessions** (ALL) — rôles: {public} — permissive: PERMISSIVE

- USING: `true`
- WITH CHECK: `true`

---

## 5. État RLS par table

| Table | RLS activé | Forcé | Nb politiques |
|---|---|---|---|
| `academy_activity_logs` | ✅ | ❌ | 1 |
| `academy_badges` | ✅ | ❌ | 1 |
| `academy_certificates` | ✅ | ❌ | 1 |
| `academy_challenge_progress` | ✅ | ❌ | 1 |
| `academy_challenges` | ✅ | ❌ | 1 |
| `academy_conversations` | ✅ | ❌ | 1 |
| `academy_course_progress` | ✅ | ❌ | 1 |
| `academy_courses` | ✅ | ❌ | 1 |
| `academy_favorites` | ✅ | ❌ | 1 |
| `academy_lesson_progress` | ✅ | ❌ | 1 |
| `academy_lessons` | ✅ | ❌ | 1 |
| `academy_messages` | ✅ | ❌ | 1 |
| `academy_notifications` | ✅ | ❌ | 1 |
| `academy_opportunities` | ✅ | ❌ | 1 |
| `academy_opportunity_applications` | ✅ | ❌ | 2 |
| `academy_push_subscriptions` | ✅ | ❌ | 1 |
| `academy_quiz_attempts` | ✅ | ❌ | 1 |
| `academy_quizzes` | ✅ | ❌ | 0 |
| `academy_resources` | ✅ | ❌ | 1 |
| `academy_typing` | ✅ | ❌ | 1 |
| `academy_user_badges` | ✅ | ❌ | 2 |
| `academy_xp_history` | ✅ | ❌ | 1 |
| `ambassador_applications` | ✅ | ❌ | 5 |
| `ambassador_clicks` | ✅ | ❌ | 4 |
| `ambassador_links` | ✅ | ❌ | 5 |
| `ambassador_withdrawal_requests` | ✅ | ❌ | 4 |
| `bot_config` | ✅ | ❌ | 1 |
| `conversations` | ✅ | ❌ | 1 |
| `couriers` | ✅ | ❌ | 1 |
| `delivery_zones` | ✅ | ❌ | 2 |
| `expenses` | ✅ | ❌ | 1 |
| `logs` | ✅ | ❌ | 1 |
| `messages` | ✅ | ❌ | 1 |
| `order_items` | ✅ | ❌ | 3 |
| `orders` | ✅ | ❌ | 7 |
| `product_variants` | ✅ | ❌ | 2 |
| `products` | ✅ | ❌ | 3 |
| `profiles` | ✅ | ❌ | 7 |
| `promo_codes` | ✅ | ❌ | 5 |
| `push_outbox` | ✅ | ❌ | 1 |
| `settings` | ✅ | ❌ | 2 |
| `social_comments` | ✅ | ❌ | 2 |
| `social_followers` | ✅ | ❌ | 3 |
| `social_group_members` | ✅ | ❌ | 2 |
| `social_groups` | ✅ | ❌ | 1 |
| `social_posts` | ✅ | ❌ | 4 |
| `social_reactions` | ✅ | ❌ | 1 |
| `social_saved_posts` | ✅ | ❌ | 1 |
| `social_stories` | ✅ | ❌ | 2 |
| `social_story_views` | ✅ | ❌ | 0 |
| `user_roles` | ✅ | ❌ | 3 |
| `whatsapp_sessions` | ✅ | ❌ | 1 |

---

## 6. Fonctions PostgreSQL (public)

- **`_enqueue_push(p_user_id uuid, p_title text, p_body text, p_url text, p_event_type text, p_payload jsonb DEFAULT '{}'::jsonb)`** → `void` [SECURITY DEFINER]
- **`_is_confirmed_order_status(st text)`** → `boolean`
- **`_push_try_webhook(payload jsonb)`** → `void` [SECURITY DEFINER]
- **`academy_award_xp(p_user_id uuid, p_amount integer, p_source text, p_ref uuid DEFAULT NULL::uuid)`** → `void` [SECURITY DEFINER]
- **`admin_dashboard_order_items()`** → `SETOF order_items` [SECURITY DEFINER]
- **`admin_dashboard_orders()`** → `SETOF orders` [SECURITY DEFINER]
- **`ambassador_confirmed_sales_count(_uid uuid)`** → `integer` [SECURITY DEFINER]
- **`ambassador_dashboard_orders()`** → `SETOF orders` [SECURITY DEFINER]
- **`ambassador_dashboard_promo_codes()`** → `SETOF promo_codes` [SECURITY DEFINER]
- **`create_manual_order_admin(_customer_name text, _customer_phone text, _delivery_address text, _delivery_fee numeric, _items jsonb, _order_source text DEFAULT 'manual'::text, _notes text DEFAULT NULL::text, _status text DEFAULT 'traitée'::text)`** → `bigint` [SECURITY DEFINER]
- **`create_order_with_items(_customer_id uuid, _customer_name text, _customer_phone text, _delivery_address text, _delivery_date text, _delivery_fee numeric, _notes text, _promo_code_id bigint, _promo_discount numeric, _total_amount numeric, _source_link_id bigint, _items jsonb)`** → `bigint` [SECURITY DEFINER]
- **`create_order_with_items(_customer_id uuid, _customer_name text, _customer_phone text, _delivery_address text, _delivery_date text, _delivery_fee numeric, _notes text, _promo_code_id bigint, _promo_discount numeric, _total_amount numeric, _items jsonb)`** → `bigint` [SECURITY DEFINER]
- **`decrement_stock_on_order_item()`** → `trigger` [SECURITY DEFINER]
- **`get_my_withdrawal_requests()`** → `SETOF ambassador_withdrawal_requests` [SECURITY DEFINER]
- **`handle_auth_user_insert()`** → `trigger` [SECURITY DEFINER]
- **`handle_new_user_role()`** → `trigger` [SECURITY DEFINER]
- **`has_role(_user_id uuid, _role text)`** → `boolean` [SECURITY DEFINER]
- **`increment_promo_usage()`** → `trigger` [SECURITY DEFINER]
- **`is_admin()`** → `boolean` [SECURITY DEFINER]
- **`is_ambassador(p_user_id uuid DEFAULT auth.uid())`** → `boolean` [SECURITY DEFINER]
- **`request_ambassador_withdrawal(p_mobile_operator text, p_msisdn text, p_beneficiary_name text)`** → `bigint` [SECURITY DEFINER]
- **`resolve_ambassador_login(identifier text)`** → `TABLE(email text, user_id uuid)` [SECURITY DEFINER]
- **`set_updated_at()`** → `trigger`
- **`trg_push_ambassador_approved()`** → `trigger` [SECURITY DEFINER]
- **`trg_push_order_event()`** → `trigger` [SECURITY DEFINER]
- **`trg_push_withdrawal_event()`** → `trigger` [SECURITY DEFINER]
- **`update_products_updated_at()`** → `trigger`

---

## 7. Types ENUM

_Aucun ENUM custom._

---

## 8. Storage Buckets

| Bucket | Public | Limite taille |
|---|---|---|
| `academy-avatars` | ✅ | — |
| `academy-certificates` | ❌ | — |
| `academy-resources` | ✅ | — |
| `academy-social` | ❌ | — |
| `images` | ✅ | — |

---

## 9. Comparaison avec le schéma planifié (VSM Academy)

### Tables planifiées ABSENTES (29)

- `users`
- `ambassadors`
- `courses`
- `lessons`
- `videos`
- `quizzes`
- `quiz_answers`
- `missions`
- `certificates`
- `badges`
- `levels`
- `posts`
- `stories`
- `comments`
- `likes`
- `reactions`
- `followers`
- `groups`
- `group_members`
- `notifications`
- `resources`
- `opportunities`
- `applications`
- `leaderboards`
- `weekly_challenges`
- `challenge_progress`
- `xp_history`
- `activity_logs`
- `push_subscriptions`

### Tables EXISTANTES hors plan Academy (48) — à réutiliser

- `academy_activity_logs`
- `academy_badges`
- `academy_certificates`
- `academy_challenge_progress`
- `academy_challenges`
- `academy_conversations`
- `academy_course_progress`
- `academy_courses`
- `academy_favorites`
- `academy_lesson_progress`
- `academy_lessons`
- `academy_messages`
- `academy_notifications`
- `academy_opportunities`
- `academy_opportunity_applications`
- `academy_push_subscriptions`
- `academy_quiz_attempts`
- `academy_quizzes`
- `academy_resources`
- `academy_typing`
- `academy_user_badges`
- `academy_xp_history`
- `ambassador_applications`
- `ambassador_clicks`
- `ambassador_links`
- `ambassador_withdrawal_requests`
- `bot_config`
- `couriers`
- `delivery_zones`
- `expenses`
- `logs`
- `order_items`
- `orders`
- `product_variants`
- `products`
- `promo_codes`
- `push_outbox`
- `social_comments`
- `social_followers`
- `social_group_members`
- `social_groups`
- `social_posts`
- `social_reactions`
- `social_saved_posts`
- `social_stories`
- `social_story_views`
- `user_roles`
- `whatsapp_sessions`

---

## 10. Migrations proposées (NON EXÉCUTÉES)

> ⚠️ Ces propositions sont indicatives. **Aucune ne sera appliquée sans votre validation explicite.**

### 🔴 Priorité haute

#### [RLS_POLICY] `academy_quizzes`

- **Raison :** RLS activé mais aucune politique définie — table inaccessible côté client
- **Action proposée :** Créer politiques SELECT/INSERT/UPDATE adaptées pour academy_quizzes

#### [RLS_POLICY] `social_story_views`

- **Raison :** RLS activé mais aucune politique définie — table inaccessible côté client
- **Action proposée :** Créer politiques SELECT/INSERT/UPDATE adaptées pour social_story_views

### 🟡 Priorité moyenne

#### [CREATE_TABLE] `users`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.users (...) — schéma à définir après validation

#### [CREATE_TABLE] `ambassadors`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.ambassadors (...) — schéma à définir après validation

#### [CREATE_TABLE] `courses`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.courses (...) — schéma à définir après validation

#### [CREATE_TABLE] `lessons`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.lessons (...) — schéma à définir après validation

#### [CREATE_TABLE] `videos`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.videos (...) — schéma à définir après validation

#### [CREATE_TABLE] `quizzes`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.quizzes (...) — schéma à définir après validation

#### [CREATE_TABLE] `quiz_answers`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.quiz_answers (...) — schéma à définir après validation

#### [CREATE_TABLE] `missions`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.missions (...) — schéma à définir après validation

#### [CREATE_TABLE] `certificates`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.certificates (...) — schéma à définir après validation

#### [CREATE_TABLE] `badges`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.badges (...) — schéma à définir après validation

#### [CREATE_TABLE] `levels`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.levels (...) — schéma à définir après validation

#### [CREATE_TABLE] `posts`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.posts (...) — schéma à définir après validation

#### [CREATE_TABLE] `stories`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.stories (...) — schéma à définir après validation

#### [CREATE_TABLE] `comments`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.comments (...) — schéma à définir après validation

#### [CREATE_TABLE] `likes`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.likes (...) — schéma à définir après validation

#### [CREATE_TABLE] `reactions`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.reactions (...) — schéma à définir après validation

#### [CREATE_TABLE] `followers`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.followers (...) — schéma à définir après validation

#### [CREATE_TABLE] `groups`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.groups (...) — schéma à définir après validation

#### [CREATE_TABLE] `group_members`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.group_members (...) — schéma à définir après validation

#### [CREATE_TABLE] `notifications`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.notifications (...) — schéma à définir après validation

#### [CREATE_TABLE] `resources`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.resources (...) — schéma à définir après validation

#### [CREATE_TABLE] `opportunities`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.opportunities (...) — schéma à définir après validation

#### [CREATE_TABLE] `applications`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.applications (...) — schéma à définir après validation

#### [CREATE_TABLE] `leaderboards`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.leaderboards (...) — schéma à définir après validation

#### [CREATE_TABLE] `weekly_challenges`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.weekly_challenges (...) — schéma à définir après validation

#### [CREATE_TABLE] `challenge_progress`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.challenge_progress (...) — schéma à définir après validation

#### [CREATE_TABLE] `xp_history`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.xp_history (...) — schéma à définir après validation

#### [CREATE_TABLE] `activity_logs`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.activity_logs (...) — schéma à définir après validation

#### [CREATE_TABLE] `push_subscriptions`

- **Raison :** Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.
- **Action proposée :** CREATE TABLE public.push_subscriptions (...) — schéma à définir après validation

### ℹ️ Information / réutilisation

#### [REUSE] `academy_activity_logs`

- **Raison :** Table existante probablement réutilisable à la place de « activity_logs »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_badges`

- **Raison :** Table existante probablement réutilisable à la place de « badges »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_certificates`

- **Raison :** Table existante probablement réutilisable à la place de « certificates »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_challenge_progress`

- **Raison :** Table existante probablement réutilisable à la place de « challenge_progress »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_challenges`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_conversations`

- **Raison :** Table existante probablement réutilisable à la place de « conversations »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_course_progress`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_courses`

- **Raison :** Table existante probablement réutilisable à la place de « courses »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_favorites`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_lesson_progress`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_lessons`

- **Raison :** Table existante probablement réutilisable à la place de « lessons »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_messages`

- **Raison :** Table existante probablement réutilisable à la place de « messages »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_notifications`

- **Raison :** Table existante probablement réutilisable à la place de « notifications »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_opportunities`

- **Raison :** Table existante probablement réutilisable à la place de « opportunities »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_opportunity_applications`

- **Raison :** Table existante probablement réutilisable à la place de « applications »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_push_subscriptions`

- **Raison :** Table existante probablement réutilisable à la place de « push_subscriptions »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_quiz_attempts`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_quizzes`

- **Raison :** Table existante probablement réutilisable à la place de « quizzes »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_resources`

- **Raison :** Table existante probablement réutilisable à la place de « resources »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_typing`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_user_badges`

- **Raison :** Table existante probablement réutilisable à la place de « badges »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `academy_xp_history`

- **Raison :** Table existante probablement réutilisable à la place de « xp_history »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `ambassador_applications`

- **Raison :** Table existante probablement réutilisable à la place de « applications »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `ambassador_clicks`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `ambassador_links`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `ambassador_withdrawal_requests`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `bot_config`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `couriers`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `delivery_zones`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `expenses`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `logs`

- **Raison :** Table existante probablement réutilisable à la place de « activity_logs »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `order_items`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `orders`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `product_variants`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `products`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `promo_codes`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `push_outbox`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_comments`

- **Raison :** Table existante probablement réutilisable à la place de « comments »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_followers`

- **Raison :** Table existante probablement réutilisable à la place de « followers »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_group_members`

- **Raison :** Table existante probablement réutilisable à la place de « group_members »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_groups`

- **Raison :** Table existante probablement réutilisable à la place de « groups »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_posts`

- **Raison :** Table existante probablement réutilisable à la place de « posts »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_reactions`

- **Raison :** Table existante probablement réutilisable à la place de « reactions »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_saved_posts`

- **Raison :** Table existante probablement réutilisable à la place de « posts »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_stories`

- **Raison :** Table existante probablement réutilisable à la place de « stories »
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `social_story_views`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `user_roles`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

#### [REUSE] `whatsapp_sessions`

- **Raison :** Table existante du Programme Ambassadeur — à mapper dans l'app Academy
- **Action proposée :** Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)

---

## 11. Recommandations avant intégration

1. **Valider ce rapport** — confirmer quelles tables réutiliser telles quelles.
2. **Ne pas créer de doublons** — enrichir les tables existantes via `ALTER TABLE ADD COLUMN` si besoin.
3. **Auth unifiée** — vérifier que `auth.users` est lié à `ambassadors` / `profiles` via `user_id`.
4. **RLS** — compléter les politiques manquantes avant mise en production client.
5. **Storage** — mapper les buckets existants (avatars, posts, certificats).
6. **RPC login** — créer `resolve_ambassador_login(identifier)` si absent, en SECURITY DEFINER.

---

*Fin du rapport d'audit — VSM Ambassador Academy*
