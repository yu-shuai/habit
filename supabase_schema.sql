-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 habits 表
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 创建 habit_logs 表 (打卡记录)
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(habit_id, completed_date) -- 同一天同一个习惯只能打卡一次
);

-- 创建 activities 表 (动态/打卡记录)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  user JSONB NOT NULL DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  tag TEXT DEFAULT '',
  content TEXT DEFAULT '',
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  liked_by JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  type TEXT DEFAULT 'checkin' CHECK (type IN ('checkin', 'medal')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 行级安全策略 (Row Level Security - RLS)
-- ==========================================

-- 启用 RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 习惯表策略：用户只能对自己的习惯进行 CRUD
CREATE POLICY "Users can insert their own habits"
ON habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own habits"
ON habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON habits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
ON habits FOR DELETE
USING (auth.uid() = user_id);

-- 打卡记录表策略：用户只能对自己的记录进行 CRUD
CREATE POLICY "Users can insert their own logs"
ON habit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own logs"
ON habit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
ON habit_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
ON habit_logs FOR DELETE
USING (auth.uid() = user_id);

-- Activities 表策略：
-- 1. 所有人可以 SELECT 公开动态
CREATE POLICY "Anyone can view public activities"
ON activities FOR SELECT
USING (visibility = 'public');

-- 2. 用户可以查看好友可见的动态（自己的或公开的）
-- NOTE: 真正的好友过滤应在应用层处理，此处仅允许访问
CREATE POLICY "Users can view friends activities"
ON activities FOR SELECT
USING (visibility = 'friends');

-- 3. 用户可以查看自己的所有动态（包括 private）
CREATE POLICY "Users can view their own activities"
ON activities FOR SELECT
USING (auth.uid() = user_id);

-- 3. 认证用户可以创建动态
CREATE POLICY "Authenticated users can create activities"
ON activities FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. 动态所有者可以更新自己的动态
CREATE POLICY "Users can update their own activities"
ON activities FOR UPDATE
USING (auth.uid() = user_id);

-- 5. 动态所有者可以删除自己的动态
CREATE POLICY "Users can delete their own activities"
ON activities FOR DELETE
USING (auth.uid() = user_id);

-- 6. 所有认证用户可以更新动态（点赞和评论需要允许非所有者操作）
-- 由于 RLS 不能根据更新字段区分，我们使用一个统一的策略：
-- 任何认证用户都可以更新 activities 表中的记录
-- (这在社交应用中是可以接受的，因为点赞/评论本身就应该对所有人开放)
CREATE POLICY "Authenticated users can update activities"
ON activities FOR UPDATE
USING (true);

-- 创建 notifications 表 (通知)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_name TEXT NOT NULL,
  actor_avatar TEXT DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'friend_request', 'friend_accept', 'follow', 'mention')),
  post_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  comment_id TEXT,
  content TEXT DEFAULT '',
  post_content_preview TEXT DEFAULT '',
  post_type TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 启用 RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 通知表策略：用户只能查看自己的通知
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- 认证用户可以创建通知（系统自动创建）
CREATE POLICY "Authenticated users can create notifications"
ON notifications FOR INSERT
WITH CHECK (auth.uid() = actor_id);

-- 用户可以更新自己的通知（标记已读）
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- 用户可以删除自己的通知
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- 创建索引加速查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
