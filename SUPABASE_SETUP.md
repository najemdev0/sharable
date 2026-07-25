# Supabase Database Schema Setup

This document outlines the database schema created for the Sharable application with all necessary tables, relationships, and security policies.

## Database Tables

### 1. **Profiles**
Stores user profile information.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users (one-to-one relationship)
- `username` - Unique username
- `full_name` - User's full name
- `avatar_url` - Profile picture URL
- `bio` - User bio/description
- `location` - User location
- `website` - User website
- `is_public` - Profile visibility flag
- `followers_count` - Total followers
- `following_count` - Total following
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### 2. **Communities**
Stores community/group information.

**Columns:**
- `id` - UUID primary key
- `created_by` - Foreign key to profiles
- `name` - Community name
- `slug` - URL-friendly community identifier
- `description` - Community description
- `avatar_url` - Community avatar
- `cover_url` - Community cover image
- `members_count` - Total members
- `is_private` - Privacy setting
- `rules` - Community rules
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 3. **Community Members**
Tracks community membership and roles.

**Columns:**
- `id` - UUID primary key
- `community_id` - Foreign key to communities
- `profile_id` - Foreign key to profiles
- `role` - Role type ('admin', 'moderator', 'member')
- `joined_at` - Join timestamp
- **Unique Constraint:** (community_id, profile_id)

### 4. **Posts**
Stores user-generated posts.

**Columns:**
- `id` - UUID primary key
- `author_id` - Foreign key to profiles
- `community_id` - Foreign key to communities (optional)
- `title` - Post title
- `content` - Post content
- `image_url` - Post image URL
- `likes_count` - Total likes
- `comments_count` - Total comments
- `shares_count` - Total shares
- `is_pinned` - Pinned status
- `is_archived` - Archive status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 5. **Comments**
Stores comments on posts.

**Columns:**
- `id` - UUID primary key
- `post_id` - Foreign key to posts
- `author_id` - Foreign key to profiles
- `parent_comment_id` - Foreign key to comments (for nested comments)
- `content` - Comment text
- `likes_count` - Total likes
- `is_edited` - Edit flag
- `is_deleted` - Soft delete flag
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### 6. **Likes**
Tracks likes on posts and comments.

**Columns:**
- `id` - UUID primary key
- `profile_id` - Foreign key to profiles
- `post_id` - Foreign key to posts (nullable)
- `comment_id` - Foreign key to comments (nullable)
- `created_at` - Like timestamp
- **Check Constraint:** Ensures a like is either on a post or comment (not both)

### 7. **Followers**
Tracks follow relationships between users.

**Columns:**
- `id` - UUID primary key
- `follower_id` - Foreign key to profiles (the person following)
- `following_id` - Foreign key to profiles (the person being followed)
- `created_at` - Follow timestamp
- **Check Constraint:** Prevents self-follows

### 8. **Shares**
Tracks post shares and sharing activity.

**Columns:**
- `id` - UUID primary key
- `post_id` - Foreign key to posts
- `shared_by` - Foreign key to profiles
- `share_type` - Type of share ('direct', 'community', 'public')
- `shared_with` - Foreign key to profiles (optional)
- `created_at` - Share timestamp

### 9. **Notifications**
Stores user notifications.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to profiles (notification recipient)
- `triggered_by` - Foreign key to profiles (who triggered it)
- `type` - Notification type ('like', 'comment', 'follow', 'share', 'mention')
- `post_id` - Foreign key to posts (optional)
- `comment_id` - Foreign key to comments (optional)
- `message` - Notification message
- `is_read` - Read status
- `created_at` - Timestamp

### 10. **Messages**
Stores direct messages between users.

**Columns:**
- `id` - UUID primary key
- `sender_id` - Foreign key to profiles
- `recipient_id` - Foreign key to profiles
- `content` - Message text
- `is_read` - Read status
- `created_at` - Send timestamp
- `updated_at` - Last update timestamp

## Setup Instructions

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Login to your project
3. Navigate to the SQL Editor section

### Step 2: Run Migration 1 - Create Tables
1. Click "New Query"
2. Copy the entire content from `supabase/migrations/001_create_tables.sql`
3. Paste it into the SQL editor
4. Click "Run"
5. Wait for the query to complete successfully

### Step 3: Run Migration 2 - Set Up RLS Policies
1. Click "New Query"
2. Copy the entire content from `supabase/migrations/002_rls_policies.sql`
3. Paste it into the SQL editor
4. Click "Run"
5. Wait for the query to complete successfully

### Step 4: Verify Setup
1. Go to the "Table Editor" section in Supabase
2. You should see all 10 tables listed:
   - profiles
   - communities
   - community_members
   - posts
   - comments
   - likes
   - followers
   - shares
   - notifications
   - messages

### Step 5: Enable Real-time (Optional)
If you want real-time updates, enable real-time on relevant tables:
1. In Table Editor, select a table
2. Click "Replication" settings
3. Enable real-time for tables like `posts`, `comments`, `notifications`, and `messages`

## Key Features

### Security
- **Row Level Security (RLS)** enabled on all tables
- Each user can only access their own data (except public profiles and posts)
- Authenticated users can perform allowed operations based on their data ownership

### Performance
- **Indexes** created on foreign keys and frequently queried columns
- Optimal query performance for common operations
- Indexed sorting by creation date for feeds

### Data Integrity
- **Foreign Key Constraints** maintain referential integrity
- **Unique Constraints** prevent duplicates
- **Check Constraints** enforce business logic (e.g., can't like same post twice)

### Relationships
- **One-to-Many:** Users can have multiple posts, comments, likes, etc.
- **Many-to-Many:** Communities have many members, users follow multiple users
- **Self-Referential:** Comments can have parent comments (nested threads)

## Usage Examples

### Create a Profile
```sql
INSERT INTO profiles (user_id, username, full_name, avatar_url, bio)
VALUES ('user-uuid', 'john_doe', 'John Doe', 'https://...', 'Hello, world!');
```

### Create a Post
```sql
INSERT INTO posts (author_id, community_id, title, content)
VALUES ('profile-uuid', 'community-uuid', 'My First Post', 'This is amazing!');
```

### Get User Posts with Comments Count
```sql
SELECT 
  p.id, p.title, p.content, p.likes_count, p.comments_count,
  pr.username, pr.avatar_url
FROM posts p
JOIN profiles pr ON p.author_id = pr.id
WHERE p.author_id = 'profile-uuid'
ORDER BY p.created_at DESC;
```

### Follow a User
```sql
INSERT INTO followers (follower_id, following_id)
VALUES ('your-profile-id', 'target-profile-id');
```

### Like a Post
```sql
INSERT INTO likes (profile_id, post_id)
VALUES ('your-profile-id', 'post-id');
```

## Next Steps

1. Run the migration SQL files in Supabase
2. Test the schema with sample data
3. Implement API routes to interact with the database
4. Build UI components to display and manage the data
5. Set up real-time subscriptions for live updates

## Support

For more information about Supabase:
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
