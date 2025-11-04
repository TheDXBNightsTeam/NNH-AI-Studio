# 🗄️ Supabase Database Structure - NNH AI Studio

## 📊 Tables Summary

### ✅ Active Tables (Contains Data)

| Table | Record Count | Description |
|-------|-------------|-------------|
| `gmb_accounts` | 6 | Google My Business accounts |
| `gmb_locations` | 2 | Business locations |
| `gmb_reviews` | 468 | Customer reviews and ratings |
| `gmb_questions` | 19 | Questions and answers |
| `gmb_media` | 579 | Photos and videos |
| `oauth_tokens` | 2 | OAuth authentication tokens |
| `oauth_states` | 28 | OAuth security states |
| `profiles` | 11 | User profiles |
| `youtube_videos` | 1 | YouTube videos |

### ⚠️ Empty Tables (Exists but no data)

- `gmb_posts` - Google My Business posts
- `gmb_insights` - GMB analytics and insights
- `gmb_attributes` - Location business attributes
- `youtube_drafts` - YouTube video drafts
- `notifications` - User notifications

### ❌ Missing Tables (Referenced but not created)

- `youtube_channels` - YouTube channels
- `ai_generation_history` - AI content generation history
- `user_preferences` - User preferences and settings

---

## 📋 Detailed Column Information

### 1️⃣ `gmb_accounts` (Google My Business Accounts)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `user_id` | UUID | User reference |
| `account_name` | String | Account display name |
| `email` | String | Account email |
| `google_account_id` | String | Google account identifier |
| `access_token` | String | OAuth access token |
| `refresh_token` | String | OAuth refresh token |
| `token_expires_at` | Timestamp | Token expiration date |
| `last_sync` | Timestamp | Last synchronization timestamp |
| `created_at` | Timestamp | Creation timestamp |
| `is_active` | Boolean | Active status flag |
| `updated_at` | Timestamp | Last update timestamp |
| `account_id` | String (null) | Additional account identifier |
| `settings` | JSONB | Account settings |

**Total Columns:** 14  
**Total Records:** 6

---

### 2️⃣ `gmb_locations` (Business Locations)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `gmb_account_id` | UUID | GMB account reference |
| `location_name` | String | Location name |
| `location_id` | String | Google location identifier |
| `address` | String | Physical address |
| `phone` | String | Contact phone number |
| `category` | String | Business category |
| `website` | String | Website URL |
| `is_active` | Boolean | Active status flag |
| `metadata` | JSONB | Additional metadata |
| `created_at` | Timestamp | Creation timestamp |
| `updated_at` | Timestamp | Last update timestamp |
| `business_hours` | JSONB | Operating hours |
| `user_id` | UUID | User reference |
| `rating` | Number (null) | Average rating |
| `normalized_location_id` | String | Normalized location ID |
| `latitude` | Number (null) | Geographic latitude |
| `longitude` | Number (null) | Geographic longitude |
| `type` | String | Location type |

**Total Columns:** 19  
**Total Records:** 2

---

### 3️⃣ `gmb_reviews` (Customer Reviews)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `location_id` | UUID | Location reference |
| `external_review_id` | String | Google review identifier |
| `reviewer_name` | String | Reviewer's name |
| `rating` | Number | Star rating (1-5) |
| `review_text` | String (null) | Review content |
| `review_date` | Timestamp | Review submission date |
| `reply_text` | String | Response text |
| `reply_date` | Timestamp | Response date |
| `has_reply` | Boolean | Reply status flag |
| `created_at` | Timestamp | Creation timestamp |
| `updated_at` | Timestamp | Last update timestamp |
| `user_id` | UUID | User reference |
| `ai_sentiment` | String (null) | AI sentiment analysis |
| `gmb_account_id` | UUID | GMB account reference |
| `ai_generated_response` | String (null) | AI-generated reply |
| `review_id` | String (null) | Review identifier |
| `comment` | String (null) | Additional comment |
| `review_reply` | String (null) | Review response |
| `replied_at` | Timestamp (null) | Reply timestamp |
| `ai_suggested_reply` | String (null) | AI suggested response |
| `status` | String | Review status |

**Total Columns:** 22  
**Total Records:** 468

---

### 4️⃣ `gmb_questions` (Q&A)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `gmb_account_id` | UUID | GMB account reference |
| `location_id` | UUID | Location reference |
| `user_id` | UUID | User reference |
| `external_question_id` | String | Google question identifier |
| `question_text` | String | Question content |
| `author_name` | String | Questioner's name |
| `author_type` | String | Author type |
| `answer_text` | String | Answer content |
| `answered_by` | String (null) | Responder identifier |
| `answered_at` | Timestamp | Answer timestamp |
| `answer_status` | String | Answer status |
| `ai_suggested_answer` | String (null) | AI suggested answer |
| `ai_confidence_score` | Number (null) | AI confidence level |
| `upvote_count` | Number | Upvote count |
| `is_featured` | Boolean | Featured status |
| `is_hidden` | Boolean | Hidden status |
| `language_code` | String | Language code |
| `metadata` | JSONB | Additional metadata |
| `created_at` | Timestamp | Creation timestamp |
| `updated_at` | Timestamp | Last update timestamp |
| `synced_at` | Timestamp | Last sync timestamp |

**Total Columns:** 22  
**Total Records:** 19

---

### 5️⃣ `gmb_media` (Photos & Videos)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `gmb_account_id` | UUID | GMB account reference |
| `location_id` | UUID | Location reference |
| `user_id` | UUID | User reference |
| `external_media_id` | String | Google media identifier |
| `type` | String | Media type (photo/video) |
| `url` | String | Media URL |
| `thumbnail_url` | String | Thumbnail URL |
| `created_at` | Timestamp | Creation timestamp |
| `updated_at` | Timestamp (null) | Last update timestamp |
| `metadata` | JSONB | Additional metadata |
| `synced_at` | Timestamp | Last sync timestamp |

**Total Columns:** 12  
**Total Records:** 579

---

### 6️⃣ `oauth_tokens` (Authentication Tokens)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `user_id` | UUID | User reference |
| `access_token` | String | OAuth access token |
| `refresh_token` | String | OAuth refresh token |
| `expires_at` | Timestamp (null) | Expiration timestamp |
| `created_at` | Timestamp | Creation timestamp |
| `provider` | String | Provider (google/youtube) |
| `account_id` | String | Account identifier |
| `metadata` | JSONB | Additional metadata |
| `token_expires_at` | Timestamp | Token expiration |
| `updated_at` | Timestamp | Last update timestamp |

**Total Columns:** 11  
**Total Records:** 2

---

### 7️⃣ `oauth_states` (OAuth Security States)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `state` | String | State token |
| `user_id` | UUID | User reference |
| `expires_at` | Timestamp | Expiration timestamp |
| `used` | Boolean | Usage status |
| `created_at` | Timestamp | Creation timestamp |

**Total Columns:** 6  
**Total Records:** 28

---

### 8️⃣ `profiles` (User Profiles)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `email` | String | Email address |
| `full_name` | String | Full name |
| `avatar_url` | String | Avatar image URL |
| `created_at` | Timestamp | Creation timestamp |
| `updated_at` | Timestamp | Last update timestamp |
| `user_id` | UUID (null) | User reference |
| `provider_sub` | String (null) | Provider subject ID |
| `last_login` | Timestamp (null) | Last login timestamp |
| `phone` | String (null) | Phone number |

**Total Columns:** 10  
**Total Records:** 11

---

### 9️⃣ `youtube_videos` (YouTube Videos)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `user_id` | UUID | User reference |
| `video_id` | String | YouTube video ID |
| `title` | String | Video title |
| `description` | String | Video description |
| `tags` | Array | Video tags |
| `category` | String | Video category |
| `language` | String | Video language |
| `privacy_status` | String | Privacy setting |
| `thumbnail_url` | String | Thumbnail URL |
| `published_at` | Timestamp | Publication date |
| `created_at` | Timestamp | Creation timestamp |
| `updated_at` | Timestamp | Last update timestamp |

**Total Columns:** 13  
**Total Records:** 1

---

## 📊 General Statistics

- **Total Existing Tables:** 14 tables
- **Active Tables (with data):** 9 tables
- **Empty Tables:** 5 tables
- **Missing Tables:** 3 tables
- **Total Records:** 1,116 records

### 📈 Data Distribution

| Table | Percentage |
|-------|-----------|
| gmb_media | 51.9% (579) |
| gmb_reviews | 41.9% (468) |
| oauth_states | 2.5% (28) |
| gmb_questions | 1.7% (19) |
| profiles | 1.0% (11) |
| gmb_accounts | 0.5% (6) |
| gmb_locations | 0.2% (2) |
| oauth_tokens | 0.2% (2) |
| youtube_videos | 0.1% (1) |

---

## 🔗 Table Relationships

```
profiles (Users)
  └── gmb_accounts (GMB Accounts)
        └── gmb_locations (Locations)
              ├── gmb_reviews (Reviews)
              ├── gmb_questions (Q&A)
              ├── gmb_media (Media)
              ├── gmb_posts (Posts)
              ├── gmb_insights (Analytics)
              └── gmb_attributes (Attributes)

profiles (Users)
  ├── oauth_tokens (Auth Tokens)
  ├── oauth_states (OAuth States)
  └── youtube_videos (YouTube Videos)
```

---

## 🔒 Row Level Security (RLS)

All tables are protected by RLS policies that enforce:
- Each user can only access their own data
- Automatic filtering based on `user_id`
- Protection against unauthorized access

---

## 📝 Important Notes

1. **Missing Tables:** These tables should be created if needed:
   - `youtube_channels`
   - `ai_generation_history`
   - `user_preferences`

2. **Empty Tables:** May need to be populated or removed if unused

3. **Suggested Improvements:**
   - Add indexes on frequently used columns
   - Review null columns to ensure they're needed
   - Standardize column naming (e.g., `token_expires_at` vs `expires_at`)

---

## 🛠️ Quick Reference Scripts

### View All Tables
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### Count All Records
```sql
SELECT 
  'gmb_accounts' as table_name, COUNT(*) as count FROM gmb_accounts
UNION ALL
SELECT 'gmb_locations', COUNT(*) FROM gmb_locations
UNION ALL
SELECT 'gmb_reviews', COUNT(*) FROM gmb_reviews
ORDER BY count DESC;
```

### Check Table Structure
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

---

**Last Updated:** November 4, 2025  
**Generated By:** NNH AI Studio Database Inspector
