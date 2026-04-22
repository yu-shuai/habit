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

-- ==========================================
-- 行级安全策略 (Row Level Security - RLS)
-- ==========================================

-- 启用 RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

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
