# Habit - 习惯追踪社交应用项目说明书

## 1. 项目概述

### 1.1 项目简介

**Habit** 是一款专注于习惯养成的社交类移动应用，用户可以创建个人或团队习惯挑战，通过每日打卡记录习惯养成过程，并与好友分享进展、互相鼓励。应用融合了游戏化元素（如勋章系统、连续打卡奖励）和社交互动功能（如动态广场、好友系统、点赞评论），让习惯养成不再孤独。

### 1.2 项目类型

- **移动端应用**：支持 Android 系统（通过 Capacitor 打包为 APK）
- **技术栈**：React 19 + TypeScript + Vite + TailwindCSS
- **后端服务**：Supabase（提供数据库、认证、实时订阅功能）
- **目标平台**：Android 手机和平板设备

### 1.3 主要特性

| 特性 | 说明 |
|------|------|
| 习惯创建 | 支持创建个人习惯和团队习惯挑战 |
| 每日打卡 | 记录每日习惯完成情况，支持图片和文字 |
| 勋章系统 | 7/30/90/180/365/500 天完成可获得不同等级勋章 |
| 好友系统 | 好友申请、关注/粉丝、好友动态 |
| 团队挑战 | 团队邀请码、队长管理、一票否决投票机制 |
| 动态广场 | 公开动态、好友动态、关注动态三个信息流 |
| 隐私控制 | 动态可见性设置（公开/好友/仅自己） |
| 外观定制 | 背景颜色、主题模式（浅色/深色/系统） |
| 提醒功能 | 每日提醒时间设置 |

---

## 2. 技术架构

### 2.1 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.0.0 | UI 框架 |
| TypeScript | 5.8.2 | 类型安全 |
| Vite | 6.2.0 | 构建工具 |
| TailwindCSS | 4.1.14 | 样式框架 |
| @supabase/supabase-js | 2.104.0 | 后端通信 |
| @capacitor/core | 8.3.1 | 移动端原生桥接 |
| @capacitor/android | 8.3.1 | Android 平台支持 |
| motion | 12.23.24 | 动画库 |
| lucide-react | 0.546.0 | 图标库 |

### 2.2 后端技术栈

| 技术 | 用途 |
|------|------|
| Supabase | PostgreSQL 数据库、用户认证、实时订阅 |
| Row Level Security (RLS) | 行级安全策略，保护用户数据 |

### 2.3 项目目录结构

```
habit/
├── src/
│   ├── components/              # React 组件
│   │   ├── tabs/                # 底部导航对应的四个 Tab 页面
│   │   │   ├── HomeTab.tsx      # 首页（广场/团队/关注）
│   │   │   ├── FriendsTab.tsx   # 好友页（动态/申请）
│   │   │   ├── TasksTab.tsx     # 任务页（进行中/已完成）
│   │   │   ├── MeTab.tsx       # 个人中心页
│   │   │   ├── FollowingTab.tsx # 关注动态列表
│   │   │   └── FriendRequestList.tsx  # 好友申请列表
│   │   ├── settings/            # 设置相关组件
│   │   │   ├── SettingsModals.tsx
│   │   │   ├── SettingsSheets.tsx
│   │   │   └── SettingsSubPages.tsx
│   │   ├── AppContent.tsx      # Tab 内容分发
│   │   ├── Auth.tsx            # 登录/注册页
│   │   ├── BottomNav.tsx       # 底部导航栏
│   │   ├── CheckInModal.tsx    # 打卡抽屉
│   │   ├── CompletedHabitCard.tsx  # 已完成任务卡片
│   │   ├── DecisionOverlay.tsx # 决策弹窗（习惯到期处理）
│   │   ├── HabitCard.tsx       # 习惯卡片
│   │   ├── Header.tsx          # 顶部导航栏
│   │   ├── MedalModal.tsx      # 勋章详情弹窗
│   │   ├── MomentItem.tsx      # 动态条目
│   │   ├── MoodModal.tsx       # 心情选择弹窗
│   │   ├── PostDetailOverlay.tsx  # 动态详情弹窗
│   │   ├── SearchOverlay.tsx   # 搜索浮层
│   │   ├── SettingsItem.tsx    # 设置项组件
│   │   ├── SettingsOverlay.tsx # 设置浮层
│   │   ├── TeamVoteModal.tsx   # 团队投票弹窗
│   │   └── UserProfilePage.tsx # 用户资料页
│   ├── hooks/                  # 自定义 React Hooks
│   │   ├── useActivityActions.ts   # 动态操作（点赞/评论/可见性）
│   │   ├── useAppEffects.ts       # 应用副作用（外观/提醒/Session）
│   │   ├── useAppState.ts         # 全局状态管理
│   │   ├── useFollowActions.ts    # 关注操作
│   │   ├── useFriendActions.ts    # 好友操作
│   │   ├── useHabitActions.ts     # 习惯操作（打卡/删除/团队）
│   │   ├── useHabitsData.ts       # 习惯数据获取
│   │   ├── useNotifications.ts    # 通知提醒
│   │   └── useUserActions.ts      # 用户操作
│   ├── lib/
│   │   └── supabase.ts         # Supabase 客户端初始化
│   ├── types/
│   │   └── index.ts            # TypeScript 类型定义
│   ├── utils/
│   │   └── app.ts              # 工具函数
│   ├── constants/
│   │   └── app.ts              # 常量定义
│   ├── App.tsx                 # 应用根组件
│   ├── main.tsx                # 入口文件
│   └── index.css               # 全局样式
├── android/                    # Capacitor Android 项目
├── public/
│   └── sw.js                   # Service Worker（PWA）
├── resources/
│   └── icon.png                # 应用图标
├── supabase_schema.sql         # 数据库 Schema
├── capacitor.config.ts         # Capacitor 配置
└── package.json               # 依赖配置
```

---

## 3. 数据库设计

### 3.1 核心数据表

#### 3.1.1 profiles（用户资料表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键，关联 auth.users |
| custom_id | TEXT | 用户自定义 ID（唯一） |
| name | TEXT | 用户昵称 |
| avatar | TEXT | 头像 URL |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 3.1.2 habits（习惯表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 创建者 ID（外键） |
| name | TEXT | 习惯名称 |
| icon | TEXT | 图标标识 |
| color | TEXT | 颜色配置 |
| total_days | INTEGER | 总天数目标 |
| current_progress | INTEGER | 当前进度 |
| type | TEXT | 'single' 或 'team' |
| status | TEXT | 'normal' 或 'punished' |
| is_completed_today | BOOLEAN | 今日是否已打卡 |
| penalty_mode | BOOLEAN | 是否处于惩罚模式 |
| penalty_days | INTEGER | 惩罚模式连续天数 |
| last_check_date | DATE | 最后打卡日期 |
| is_archived | BOOLEAN | 是否已归档 |
| archived_at | TIMESTAMPTZ | 归档时间 |
| is_failed | BOOLEAN | 是否失败 |
| is_started | BOOLEAN | 团队挑战是否已开始 |
| invite_code | TEXT | 团队邀请码 |
| captain_deleted | BOOLEAN | 队长是否删除 |
| vote_status | JSONB | 投票状态 |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 3.1.3 activities（动态/打卡记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 发布者 ID |
| habit_id | UUID | 关联习惯 ID |
| content | TEXT | 打卡内容/文字 |
| images | TEXT[] | 图片 URL 数组 |
| tag | TEXT | 标签（如 medal:30） |
| visibility | TEXT | 'public'/'friends'/'private' |
| liked_by | JSONB | 点赞用户列表 |
| comments | JSONB | 评论列表 |
| type | TEXT | 'checkin'/'medal' |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 3.1.4 friendships（好友关系表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| requester_id | UUID | 请求者 ID |
| addressee_id | UUID | 被请求者 ID |
| status | TEXT | 'pending'/'accepted'/'rejected' |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 3.1.5 follows（关注关系表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| follower_id | UUID | 关注者 ID |
| following_id | UUID | 被关注者 ID |
| created_at | TIMESTAMPTZ | 创建时间 |

#### 3.1.6 habit_members（团队习惯成员表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| habit_id | UUID | 习惯 ID（外键） |
| user_id | UUID | 用户 ID（外键） |
| joined_at | TIMESTAMPTZ | 加入时间 |

### 3.2 行级安全策略（RLS）

所有用户数据表均启用 RLS，确保用户只能访问自己的数据：
- **habits**: 仅创建者可以 CRUD
- **habit_logs**: 仅创建者可以 CRUD
- **activities**: 根据 visibility 字段控制可见性
- **friendships**: 仅当事双方可以访问
- **follows**: 公开可读，写入需认证

---

## 4. 功能模块说明

### 4.1 认证模块（Auth）

**文件位置**：`src/components/Auth.tsx`

**功能描述**：
- 邮箱密码登录
- 邮箱密码注册（支持邮箱验证）
- 忘记密码（发送重置邮件）
- 登录状态持久化（Supabase Session）

**验证规则**：
- 邮箱格式验证
- 密码最少 6 位

### 4.2 首页模块（HomeTab）

**文件位置**：`src/components/tabs/HomeTab.tsx`

**子 Tab 页面**：
1. **广场（Discovery）**：展示所有公开动态
2. **团队（Team）**：展示团队习惯挑战
3. **关注（Following）**：展示关注用户的动态

**团队功能**：
- 输入 6 位邀请码加入团队
- 队长可复制邀请码分享
- 队长可踢除未开始成员
- 队长可发起加码投票（延长目标天数）
- 队员可投票决定是否接受加码（一票否决）
- 24 小时未投票视为拒绝

### 4.3 好友模块（FriendsTab）

**文件位置**：`src/components/tabs/FriendsTab.tsx`

**子 Tab 页面**：
1. **动态（Feed）**：好友的公开动态和好友圈动态
2. **申请（Requests）**：好友申请列表

**好友申请处理**：
- 查看申请者资料
- 接受或拒绝申请
- 新申请红点提示

### 4.4 任务模块（TasksTab）

**文件位置**：`src/components/tabs/TasksTab.tsx`

**功能描述**：
- 展示所有进行中的习惯
- 点击打卡按钮完成当日打卡
- 长按删除习惯
- 支持惩罚模式（连续打卡中断后进入）
- 支持结算/领取奖励

**卡片状态**：
| 状态 | 背景色 | 说明 |
|------|--------|------|
| 正常进行中 | 深灰黑色 | 显示打卡按钮 |
| 今日已打卡 | 绿色高亮 | 显示 ✓ |
| 已完成目标 | 金黄色渐变 | 可领取奖励 |
| 惩罚模式 | 红色渐变 | 需连续打卡 3 天 |
| 挑战失败 | 灰色 | 显示 💀 |
| 队长已删除 | 浅灰色 | 需手动移除 |

### 4.5 个人中心模块（MeTab）

**文件位置**：`src/components/tabs/MeTab.tsx`

**功能描述**：
- 头像上传（点击编辑）
- 昵称编辑（点击编辑）
- 自定义 ID 设置
- 好友数、关注数、获赞数统计
- 勋章墙展示（6 个等级）
- 进行中/已完成任务切换
- 好友列表弹窗
- 关注者列表弹窗

**勋章等级**：
| 天数 | 图标 | 名称 |
|------|------|------|
| 7 天 | 🔥 | 初级勋章 |
| 30 天 | ⚡ | 中级勋章 |
| 90 天 | 🌟 | 高级勋章 |
| 180 天 | 💎 | 钻石勋章 |
| 365 天 | 🏆 | 冠军勋章 |
| 500 天 | 👑 | 传奇勋章 |

### 4.6 打卡模块（CheckInModal）

**文件位置**：`src/components/CheckInModal.tsx`

**功能描述**：
- 选择习惯（进行中的非团队任务）
- 填写打卡内容
- 上传最多 9 张图片
- 设置可见性（公开/好友/仅自己）
- 编辑已发布的打卡

### 4.7 创建任务模块（CreateTaskModal）

**文件位置**：`src/components/CheckInModal.tsx`

**功能描述**：
- 输入任务名称
- 选择目标天数（默认 30 天）
- 选择任务类型（个人/团队）
- 创建习惯并跳转到任务列表

### 4.8 勋章详情模块（MedalModal）

**文件位置**：`src/components/MedalModal.tsx`

**功能描述**：
- 点击勋章墙查看具体获得记录
- 显示获得该勋章的任务名称
- 显示获得时间

### 4.9 心情模块（MoodModal）

**文件位置**：`src/components/MoodModal.tsx`

**功能描述**：
- 选择心情 emoji
- 心情显示在顶部 Header

### 4.10 动态详情模块（PostDetailOverlay）

**文件位置**：`src/components/PostDetailOverlay.tsx`

**功能描述**：
- 查看动态完整内容
- 点赞和评论列表
- 评论输入
- 删除评论
- 修改可见性

### 4.11 决策弹窗模块（DecisionOverlay）

**文件位置**：`src/components/DecisionOverlay.tsx`

**功能描述**：
习惯到期后弹出：
- **继续挑战**：可自定义延长时间
- **领取奖励**：结算并获得勋章
- **放弃**：习惯失败

### 4.12 用户资料页（UserProfilePage）

**文件位置**：`src/components/UserProfilePage.tsx`

**功能描述**：
- 查看他人用户资料
- 关注/取消关注
- 发送好友申请
- 查看该用户的公开动态

### 4.13 设置模块（SettingsOverlay）

**文件位置**：`src/components/SettingsOverlay.tsx`

**子页面**：
1. **账户与安全**：修改密码、注销账户
2. **通用设置**：外观主题、默认可见性
3. **提醒设置**：每日提醒开关、提醒时间
4. **背景设置**：自定义背景颜色
5. **关于**：版本信息

**功能描述**：
- 深色/浅色/系统主题切换
- 每日提醒开关和时间设置
- 清理缓存
- 账户登出
- 注销账户

### 4.14 搜索模块（SearchOverlay）

**文件位置**：`src/components/SearchOverlay.tsx`

**功能描述**：
- 搜索用户（按昵称或 ID）
- 查看搜索结果
- 访问用户资料页
- 搜索历史记录

---

## 5. 全局状态管理

### 5.1 useAppState Hook

**文件位置**：`src/hooks/useAppState.ts`

集中管理所有全局状态，包括：

| 状态 | 类型 | 说明 |
|------|------|------|
| session | any | Supabase 会话 |
| activeTab | Tab | 当前激活的 Tab |
| homeSubTab | HomeSubTab | 首页子 Tab |
| friendSubTab | FriendSubTab | 好友子 Tab |
| tasksSubTab | 'ongoing'/'completed' | 任务子 Tab |
| tasks | Habit[] | 进行中的习惯 |
| completedTasks | Habit[] | 已完成的习惯 |
| activities | Post[] | 动态列表 |
| userProfile | UserProfile | 当前用户资料 |
| friends | any[] | 好友列表 |
| followings | string[] | 关注列表 |
| followers | any[] | 粉丝列表 |
| friendRequests | any[] | 好友申请列表 |
| appBackground | string | 背景颜色 |
| appearance | 'system'/'light'/'dark' | 主题模式 |
| dailyReminder | boolean | 每日提醒开关 |
| reminderTimes | string[] | 提醒时间列表 |
| defaultVisibility | Visibility | 默认可见性 |
| toast | string | 提示消息 |

---

## 6. API 与数据操作

### 6.1 Supabase 实时订阅

应用通过 Supabase 的实时功能订阅以下表的变化：

```typescript
// 好友关系变化
supabase.channel('public:friendships')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, callback)

// 习惯变化
supabase.channel('public:habits')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, callback)

// 动态变化
supabase.channel('public:activities')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, callback)
```

### 6.2 主要数据操作

| 操作 | 描述 |
|------|------|
| fetchHabits | 获取用户所有习惯 |
| fetchActivities | 获取动态流 |
| handleCheck | 打卡（创建 habit_log） |
| handleDelete | 删除习惯 |
| handleLike | 点赞/取消点赞 |
| handleAddComment | 添加评论 |
| handleFollow | 关注/取消关注 |
| handleSendFriendRequest | 发送好友申请 |
| handleAcceptFriendRequest | 接受好友申请 |
| updateProfile | 更新用户资料 |

---

## 7. 页面导航结构

```
App
├── Auth（未登录）
│   └── 登录/注册表单
│       └── 忘记密码表单
└── MainApp（已登录）
    ├── Header（顶部栏）
    │   ├── 心情按钮
    │   ├── 搜索按钮
    │   ├── 创建任务按钮
    │   └── 设置按钮
    ├── AppContent（主内容区）
    │   ├── HomeTab
    │   │   ├── Discovery（广场）
    │   │   ├── Team（团队）
    │   │   └── Following（关注）
    │   ├── FriendsTab
    │   │   ├── Feed（好友动态）
    │   │   └── Requests（好友申请）
    │   ├── TasksTab
    │   │   └── HabitCard 列表
    │   └── MeTab
    │       ├── 头像/昵称/ID
    │       ├── 勋章墙
    │       ├── 任务列表
    │       ├── 好友列表弹窗
    │       └── 关注者列表弹窗
    └── BottomNav（底部导航）
        ├── 首页
        ├── 好友
        ├── 任务
        └── 我的
```

---

## 8. 环境变量配置

### 8.1 必需的环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 9. 构建与部署

### 9.1 开发环境运行

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev
```

### 9.2 构建生产版本

```bash
# 构建 Web 应用
npm run build

# 同步到 Android 项目
npx cap sync android
```

### 9.3 Android APK 构建

```bash
# 进入 Android 目录
cd android

# 构建 APK
./gradlew assembleDebug
```

APK 文件位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 10. 关键业务逻辑

### 10.1 打卡流程

1. 用户在 TasksTab 点击打卡按钮
2. 如果是完成任务（currentProgress >= totalDays），弹出决策弹窗
3. 否则创建 habit_log 记录，更新习惯进度
4. 自动发布动态到 activities 表
5. 更新用户的连续打卡天数

### 10.2 团队挑战流程

1. 创建者创建团队习惯，获得 6 位邀请码
2. 其他用户输入邀请码加入
3. 创建者点击"开始挑战"正式启动
4. 开始后队长可发起"加码"投票（延长目标天数）
5. 队员投票：一票否决；24 小时未投视为拒绝
6. 所有成员完成目标或队长删除时结束

### 10.3 惩罚模式

当用户在习惯进行中中断打卡一天：
- 进入惩罚模式（penaltyMode = true）
- 需连续打卡 3 天才能退出惩罚模式
- 惩罚期间卡片显示红色警示

### 10.4 勋章获得

当习惯完成（currentProgress >= totalDays）且用户选择"领取奖励"时：
- 在 activities 表创建 type='medal' 的记录
- tag 格式为 'medal:{天数}'
- content 包含任务名称信息

---

## 11. 应用图标与命名

| 项目 | 值 |
|------|------|
| 应用名称 | Habit |
| 包名 | com.ycy.habit |
| 应用 ID | com.ycy.habit |
