# Habit 项目说明文档

Habit 是一个面向移动端的习惯养成与社交打卡应用。用户可以创建个人习惯或团队挑战，按天打卡、发布动态、上传图片、获得阶段性勋章，并通过好友、关注、点赞、评论、通知等功能形成轻量社交反馈。

项目当前采用 Web 前端加原生容器的形态：前端使用 React、TypeScript、Vite 和 Tailwind CSS 构建，移动端通过 Capacitor 同步到 Android/iOS 工程，后端使用 Supabase 提供认证、PostgreSQL 数据库、Storage、Realtime 和通知相关数据能力。

## 目录

- [项目定位](#项目定位)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [目录结构](#目录结构)
- [运行环境](#运行环境)
- [本地启动](#本地启动)
- [环境变量](#环境变量)
- [Supabase 后端说明](#supabase-后端说明)
- [业务模块](#业务模块)
- [前端架构](#前端架构)
- [数据模型](#数据模型)
- [关键业务流程](#关键业务流程)
- [移动端构建](#移动端构建)
- [部署与发布](#部署与发布)
- [开发规范](#开发规范)
- [常见问题](#常见问题)

## 项目定位

Habit 的产品目标是把“一个人坚持习惯”变成“有记录、有反馈、有陪伴的挑战过程”。

主要使用场景包括：

- 用户创建一个持续若干天的个人目标，例如阅读、运动、早睡、背单词。
- 用户每天完成后打卡，系统记录连续进度并可生成动态。
- 用户可以上传图片和文字，让打卡记录更有现场感。
- 用户在完成 7、30、90、180、365、500 天等目标时获得勋章。
- 用户可以添加好友、关注他人、浏览动态、点赞和评论。
- 用户可以创建团队习惯，通过邀请码邀请成员一起完成。
- 团队习惯支持开始前成员管理，开始后需要全员共同打卡推进进度。
- 团队目标完成后，队长可选择结算或发起加码投票。

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 邮箱认证 | 使用 Supabase Auth 实现登录、注册、忘记密码、修改密码、登出 |
| 用户资料 | 支持昵称、头像、自定义 ID、个人主页、统计数据 |
| 个人习惯 | 创建目标天数、每日打卡、断签惩罚、完成结算 |
| 团队习惯 | 邀请码加入、队长开始挑战、移除成员、全员打卡推进 |
| 打卡动态 | 自动或手动发布文字、图片、习惯标签、可见范围 |
| 动态互动 | 点赞、评论、回复、删除评论、修改可见性、删除动态 |
| 好友系统 | 搜索用户、发送好友申请、接受/拒绝申请、删除好友 |
| 关注系统 | 关注/取消关注、粉丝列表、关注动态流 |
| 通知中心 | 点赞、评论、回复、好友、关注、系统通知，支持未读状态 |
| 勋章系统 | 完成指定天数后生成私密勋章动态，并弹出勋章展示 |
| 外观设置 | 背景色、浅色/深色/跟随系统、默认动态可见范围 |
| 提醒设置 | 每日提醒开关、提醒时间、本地通知/声音/震动偏好 |
| 移动端能力 | Capacitor Android/iOS 工程、App 信息读取、更新检查 |

## 技术栈

### 前端

| 技术 | 当前版本 | 用途 |
| --- | --- | --- |
| React | 19.0.0 | 页面和组件渲染 |
| React DOM | 19.0.0 | Web 端挂载 |
| TypeScript | 5.8.2 | 类型约束 |
| Vite | 6.2.0 | 开发服务器和生产构建 |
| Tailwind CSS | 4.1.14 | 原子化样式 |
| @tailwindcss/vite | 4.1.14 | Tailwind Vite 插件 |
| motion | 12.23.24 | 动画与过渡 |
| lucide-react | 0.546.0 | 图标 |
| zustand | 5.0.13 | 通知、更新等局部 Store |
| browser-image-compression | 2.0.2 | 图片上传前压缩 |

### 移动端

| 技术 | 当前版本 | 用途 |
| --- | --- | --- |
| Capacitor Core | 8.3.1 | Web 与原生平台桥接 |
| @capacitor/android | 8.3.1 | Android 工程 |
| @capacitor/ios | 8.3.1 | iOS 工程 |
| @capacitor/app | 8.1.0 | 原生 App 信息、生命周期 |
| @capacitor/local-notifications | 8.1.0 | 本地提醒 |
| @capacitor/assets | 3.0.5 | 图标、启动图资源生成 |

### 后端

| 技术 | 用途 |
| --- | --- |
| Supabase Auth | 邮箱密码认证、Session 管理 |
| Supabase Database | PostgreSQL 数据存储 |
| Supabase Realtime | 订阅好友、习惯、动态、通知变化 |
| Supabase Storage | 头像和打卡图片上传 |
| PostgreSQL RLS | 行级权限控制 |
| PostgreSQL RPC | 点赞、评论等 JSONB 原子更新 |

## 目录结构

```text
habit/
├── android/                         # Capacitor Android 原生工程
├── ios/                             # Capacitor iOS 原生工程
├── icons/                           # Web/PWA 图标资源
├── public/
│   ├── manifest.webmanifest         # PWA manifest
│   └── sw.js                        # Service Worker
├── resources/                       # Capacitor 图标资源
├── src/
│   ├── components/                  # UI 组件
│   │   ├── settings/                # 设置页相关弹窗、抽屉、子页面
│   │   └── tabs/                    # 首页、好友、任务、我的四个主 Tab
│   ├── constants/                   # 应用常量
│   ├── hooks/                       # 数据加载、业务动作和副作用 Hook
│   ├── lib/                         # 外部服务初始化
│   ├── store/                       # Zustand Store
│   ├── types/                       # TypeScript 类型定义
│   ├── utils/                       # 通用工具函数
│   ├── App.tsx                      # 应用根组件
│   ├── main.tsx                     # React 入口
│   └── index.css                    # 全局样式
├── appflow.config.json              # Ionic Appflow 配置
├── capacitor.config.ts              # Capacitor 配置
├── codemagic.yaml                   # Codemagic CI 配置
├── CODEMAGIC_GUIDE.md               # Codemagic 构建指南
├── package.json                     # npm 脚本和依赖
├── PROJECT_SPEC.md                  # 早期/补充项目规格说明
├── supabase_schema.sql              # Supabase 数据库基线脚本
├── tsconfig.json                    # TypeScript 配置
└── vite.config.ts                   # Vite 配置
```

## 运行环境

建议环境：

- Node.js 20 或更高版本
- npm 10 或更高版本
- Supabase 项目
- Android Studio，构建 Android 包时需要
- Xcode，构建 iOS 包时需要，仅 macOS

当前 npm 脚本：

```json
{
  "dev": "vite --port=3000 --host=0.0.0.0",
  "build": "vite build",
  "preview": "vite preview",
  "clean": "rm -rf dist",
  "lint": "tsc --noEmit"
}
```

注意：`clean` 使用的是类 Unix 命令 `rm -rf dist`。如果在 Windows PowerShell 中运行失败，可以直接手动删除 `dist/`，或临时使用 PowerShell 等价命令：

```powershell
Remove-Item -Recurse -Force dist
```

## 本地启动

1. 安装依赖：

```bash
npm install
```

2. 配置环境变量：

```bash
cp .env.example .env
```

然后补充 Supabase 相关变量。当前 `.env.example` 仍保留 AI Studio/Gemini 模板内容，实际运行本项目必须配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。

3. 启动开发服务器：

```bash
npm run dev
```

默认监听：

```text
http://localhost:3000
```

4. 类型检查：

```bash
npm run lint
```

5. 生产构建：

```bash
npm run build
```

6. 预览构建结果：

```bash
npm run preview
```

## 环境变量

前端代码通过 `import.meta.env` 读取 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

`src/lib/supabase.ts` 中如果缺少变量会打印错误，并使用 placeholder 初始化客户端。placeholder 只用于避免应用启动崩溃，不能完成真实登录、读写数据或上传文件。

`vite.config.ts` 里还会读取 `GEMINI_API_KEY` 并注入到 `process.env.GEMINI_API_KEY`，但当前主业务代码没有围绕 Gemini API 形成完整功能链路。除非后续恢复 AI 相关功能，否则本地运行 Habit 的核心功能不依赖它。

## Supabase 后端说明

### 当前代码实际依赖

前端代码会访问以下 Supabase 表或对象：

| 对象 | 用途 |
| --- | --- |
| `profiles` | 用户资料、昵称、头像、自定义 ID、搜索用户 |
| `habits` | 个人/团队习惯、进度、成员、投票、归档、失败状态 |
| `habit_logs` | 每日打卡记录，防止同一用户同一习惯同一天重复打卡 |
| `activities` | 动态、打卡内容、图片、点赞、评论、勋章记录 |
| `friendships` | 好友申请、好友关系、删除好友 |
| `follows` | 关注、粉丝关系 |
| `notifications` | 通知中心、未读数量 |
| `app_releases` | 原生 App 更新检查 |
| Storage bucket `habit` | 头像、打卡图片上传和删除 |
| RPC `add_like` | 原子添加点赞 |
| RPC `remove_like` | 原子移除点赞 |
| RPC `add_comment` | 原子添加评论 |
| RPC `remove_comment` | 原子移除评论 |

### 关于 `supabase_schema.sql`

仓库中的 `supabase_schema.sql` 提供了部分数据库基线，包括：

- `habits`
- `habit_logs`
- `activities`
- `notifications`
- 部分 RLS 策略
- 部分索引

但当前前端代码还依赖更多表字段和对象，例如：

- `profiles`
- `friendships`
- `follows`
- `app_releases`
- `habits.total_days`
- `habits.current_progress`
- `habits.type`
- `habits.status`
- `habits.is_completed_today`
- `habits.penalty_mode`
- `habits.penalty_days`
- `habits.last_check_date`
- `habits.is_archived`
- `habits.archived_at`
- `habits.is_failed`
- `habits.creator_id`
- `habits.invite_code`
- `habits.members`
- `habits.is_started`
- `habits.vote_status`
- `habits.captain_deleted`
- RPC 函数 `add_like`、`remove_like`、`add_comment`、`remove_comment`

因此，部署新 Supabase 项目时，不能只执行当前 `supabase_schema.sql` 后就认为后端完整可用。需要补齐实际业务依赖的表、字段、RLS、Storage policy 和 RPC。

### 推荐的 Supabase 配置

1. 开启邮箱密码 Auth。
2. 创建公开 bucket：`habit`。
3. 为 `habit` bucket 配置认证用户上传策略。
4. 为用户头像路径使用：

```text
{userId}/avatar.{ext}
```

5. 为打卡图片路径使用：

```text
{userId}/posts/{timestamp}-{random}.{ext}
```

6. 所有暴露在 `public` schema 中的业务表都应启用 RLS。
7. `service_role` key 只能用于服务端或 Edge Function，不能放进前端环境变量。
8. 点赞和评论目前存储在 `activities.liked_by`、`activities.comments` JSONB 字段中，建议通过 RPC 原子更新，避免并发覆盖。

## 业务模块

### 认证模块

相关文件：

- `src/components/Auth.tsx`
- `src/hooks/useAppEffects.ts`
- `src/hooks/useUserActions.ts`
- `src/lib/supabase.ts`

能力：

- 邮箱密码登录
- 邮箱密码注册
- 忘记密码
- 修改密码
- Session 初始化和监听
- 登出
- 注销账号的前端数据清理

注销账号目前会删除 public 表中的用户相关数据并退出登录，但不能从前端直接删除 `auth.users` 记录。如果需要彻底删除认证用户，应通过 Supabase Edge Function 使用 Admin API 实现。

### 用户资料模块

相关文件：

- `src/components/UserProfilePage.tsx`
- `src/components/tabs/MeTab.tsx`
- `src/hooks/useUserActions.ts`
- `src/hooks/useStorage.ts`

能力：

- 获取当前用户资料
- 首次登录自动创建默认资料
- 编辑昵称
- 设置自定义 ID
- 上传头像
- 同步更新历史动态中的用户快照
- 查看他人主页
- 展示用户公开动态
- 发起关注或好友申请

### 习惯任务模块

相关文件：

- `src/components/HabitCard.tsx`
- `src/components/CompletedHabitCard.tsx`
- `src/components/CheckInModal.tsx`
- `src/components/DecisionOverlay.tsx`
- `src/components/tabs/TasksTab.tsx`
- `src/hooks/useHabitsData.ts`
- `src/hooks/useHabitActions.ts`

能力：

- 创建个人任务
- 创建团队任务
- 指定目标天数
- 每日打卡
- 防重复打卡
- 展示进行中任务
- 展示已归档任务
- 删除任务
- 任务完成后选择领取奖励或继续挑战
- 已完成任务可补领奖励

个人任务的进度由当前用户每日打卡推进。团队任务的进度由成员共同推进，只有当所有成员当天都打卡时，团队任务进度才会加一。

### 断签与惩罚模块

相关文件：

- `src/hooks/useHabitActions.ts`
- `src/utils/app.ts`

规则：

- 如果普通个人任务断签，会进入惩罚模式。
- 惩罚模式下需要连续打卡 3 天。
- 惩罚模式打卡不会立即正常推进，满 3 天后解除惩罚并补进度。
- 惩罚模式再次断签，任务会失败并归档。

该检查目前由客户端在加载任务后执行，属于 best-effort 逻辑。对于严肃生产环境，建议补充服务端定时任务或数据库任务，避免用户长时间不打开应用导致状态延迟更新。

### 团队挑战模块

相关文件：

- `src/components/TeamVoteModal.tsx`
- `src/components/tabs/HomeTab.tsx`
- `src/hooks/useHabitActions.ts`

能力：

- 创建团队任务生成 6 位邀请码
- 其他用户通过邀请码加入
- 开始前可以移除成员或退出
- 队长开始挑战后邀请码失效
- 开始后成员列表锁定
- 开始后需要全员每日打卡才能推进进度
- 团队完成目标后，由队长发起结算或加码
- 加码投票需要全员同意
- 任一成员拒绝或 24 小时超时，按结算处理

团队成员数据当前存储在 `habits.members` JSONB 字段中，适合快速开发和小团队场景。如果未来需要复杂权限、成员历史、统计报表或大规模团队，建议拆分为独立 `habit_members` 表。

### 动态与打卡模块

相关文件：

- `src/components/CheckInModal.tsx`
- `src/components/MomentItem.tsx`
- `src/components/PostDetailOverlay.tsx`
- `src/hooks/useActivityActions.ts`
- `src/hooks/useStorage.ts`

能力：

- 打卡时自动创建动态
- 手动发布打卡内容
- 上传多张图片
- 图片上传前压缩
- 本地 Base64 预览
- 上传完成后替换为 Supabase Storage URL
- 编辑自己的动态
- 删除自己的动态
- 删除动态时清理关联图片
- 修改动态可见范围

可见范围：

| 值 | 含义 |
| --- | --- |
| `public` | 公开 |
| `friends` | 仅朋友 |
| `private` | 仅自己 |

评论和点赞支持 `scope` 字段，用于区分公开、好友、团队等互动场景。

### 好友与关注模块

相关文件：

- `src/components/SearchOverlay.tsx`
- `src/components/tabs/FriendsTab.tsx`
- `src/components/tabs/FriendRequestList.tsx`
- `src/hooks/useFriendActions.ts`
- `src/hooks/useFollowActions.ts`

好友能力：

- 按昵称或自定义 ID 搜索用户
- 发送好友申请
- 防止重复申请
- 接受好友申请
- 拒绝好友申请
- 删除好友
- 好友申请红点提醒

关注能力：

- 关注用户
- 取消关注
- 获取关注列表
- 获取粉丝列表
- 关注动态流

### 通知模块

相关文件：

- `src/components/NotificationCenter.tsx`
- `src/hooks/useNotificationActions.ts`
- `src/store/useNotificationStore.ts`
- `src/utils/notificationSound.ts`

通知类型：

- `like`
- `comment`
- `reply`
- `friend_request`
- `friend_accept`
- `follow`
- `mention`
- `system`

能力：

- 分页加载通知
- 未读数量统计
- 标记单条已读
- 全部标记已读
- Realtime 收到新通知后刷新
- 根据偏好播放声音和震动
- 原生环境中尝试更新 App badge

### 设置模块

相关文件：

- `src/components/SettingsOverlay.tsx`
- `src/components/settings/SettingsModals.tsx`
- `src/components/settings/SettingsSheets.tsx`
- `src/components/settings/SettingsSubPages.tsx`
- `src/components/SettingsItem.tsx`
- `src/hooks/useAppEffects.ts`

能力：

- 账户与安全
- 修改密码
- 注销账号
- 外观主题：浅色、深色、跟随系统
- 背景颜色
- 默认动态可见范围
- 每日提醒
- 多提醒时间
- 缓存显示和清理
- 关于应用

### 更新检查模块

相关文件：

- `src/hooks/useAppUpdate.ts`
- `src/store/useAppStore.ts`

逻辑：

- Web 预览环境直接标记为 `Web Preview`。
- 原生环境通过 `@capacitor/app` 读取当前版本和 build。
- 从 Supabase `app_releases` 表读取最新 release。
- 如果最新 `build_number` 大于当前 build，则写入更新状态供 UI 展示。

## 前端架构

### 根组件

`src/App.tsx` 是应用组合层，主要职责是：

- 初始化全局 UI 状态。
- 初始化 Supabase Session。
- 应用外观和提醒副作用。
- 加载习惯、动态、好友、关注、资料、通知数据。
- 注册 Supabase Realtime 订阅。
- 组合各类业务 Hook。
- 处理图片上传和压缩。
- 处理下拉刷新。
- 统一挂载全局弹窗、抽屉、Toast、通知中心和个人主页。

### 页面结构

```text
App
├── Auth                         # 未登录时显示
└── 已登录主界面
    ├── Header                   # 顶部栏：心情、搜索、创建任务、设置
    ├── AppContent               # 根据 activeTab 渲染主体
    │   ├── HomeTab              # 广场、团队、关注
    │   ├── FriendsTab           # 好友动态、好友申请
    │   ├── TasksTab             # 进行中、已完成
    │   └── MeTab                # 个人中心、勋章、好友/粉丝
    ├── BottomNav                # 底部导航和通知入口
    └── Overlays/Drawers/Modals  # 搜索、设置、打卡、详情、勋章等
```

### Hook 分层

| Hook | 职责 |
| --- | --- |
| `useAppState` | 集中声明页面状态、表单状态、弹窗状态、业务数据状态 |
| `useAppEffects` | Session、外观、提醒等副作用 |
| `useHabitsData` | 获取习惯和动态列表 |
| `useHabitActions` | 创建任务、打卡、删除、团队操作、奖励结算 |
| `useActivityActions` | 点赞、评论、发布/编辑/删除动态、修改可见性 |
| `useFriendActions` | 好友申请、好友列表、搜索用户 |
| `useFollowActions` | 关注、取消关注、粉丝/关注列表 |
| `useUserActions` | 用户资料、头像、密码、登出、注销 |
| `useNotificationActions` | 通知加载、创建、已读状态、偏好、声音和 badge |
| `useStorage` | Supabase Storage 上传/删除 |
| `useAppUpdate` | 原生 App 更新检查 |
| `useNotifications` | 本地提醒相关逻辑 |

### 状态管理

项目使用两类状态：

- React `useState`/自定义 Hook：主业务和 UI 状态。
- Zustand：通知列表、未读数量、App 更新信息等局部全局状态。

这种结构适合当前规模，但 `useAppState` 中状态较多。后续如果继续扩展，可以按业务域拆分为更小的 store，例如 `habitStore`、`socialStore`、`settingsStore`。

## 数据模型

### TypeScript 类型

核心类型定义在 `src/types/index.ts`。

#### `UserProfile`

```ts
interface UserProfile {
  id: string;
  customId?: string;
  name: string;
  avatar: string;
}
```

#### `Habit`

```ts
interface Habit {
  id: string;
  name: string;
  totalDays: number;
  currentProgress: number;
  type: 'single' | 'team';
  status: 'normal' | 'punished';
  isCompletedToday: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  isFailed?: boolean;
  penaltyMode?: boolean;
  penaltyDays?: number;
  lastCheckDate?: string;
  creatorId?: string;
  inviteCode?: string;
  members?: TeamMember[];
  isStarted?: boolean;
  voteStatus?: VoteEntry[];
  captainDeleted?: boolean;
}
```

#### `Post`

```ts
interface Post {
  id: string;
  habitId: string;
  user: UserProfile;
  images: string[];
  tag: string;
  likedBy: LikeEntry[];
  comments: Comment[];
  visibility: 'public' | 'friends' | 'private';
  content?: string;
  createdAt: number;
  type?: string;
}
```

#### `AppNotification`

```ts
interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  content: string;
  postContentPreview?: string;
  postType?: string;
  isRead: boolean;
  createdAt: string;
}
```

### 数据库表概览

#### `profiles`

用户资料表。代码期望字段包括：

| 字段 | 说明 |
| --- | --- |
| `id` | 用户 UUID，对应 `auth.users.id` |
| `custom_id` | 用户自定义 ID，建议唯一 |
| `name` | 昵称 |
| `avatar` | 头像 URL |

#### `habits`

习惯任务表。代码期望字段包括：

| 字段 | 说明 |
| --- | --- |
| `id` | 习惯 ID |
| `user_id` | 创建者/所属用户 |
| `name` | 习惯名称 |
| `total_days` | 目标天数 |
| `current_progress` | 当前完成进度 |
| `type` | `single` 或 `team` |
| `status` | `normal` 或 `punished` |
| `is_completed_today` | 是否今日已打卡 |
| `penalty_mode` | 是否处于惩罚期 |
| `penalty_days` | 惩罚期连续打卡天数 |
| `last_check_date` | 最近一次有效打卡日期 |
| `is_archived` | 是否归档 |
| `archived_at` | 归档时间 |
| `is_failed` | 是否失败 |
| `creator_id` | 团队创建者/队长 |
| `invite_code` | 团队邀请码 |
| `members` | 团队成员 JSONB |
| `is_started` | 团队是否已开始 |
| `vote_status` | 团队加码投票 JSONB |
| `captain_deleted` | 队长是否标记删除团队 |

#### `habit_logs`

每日打卡记录表。建议通过唯一约束保证同一习惯同一用户同一天只能打一次。

| 字段 | 说明 |
| --- | --- |
| `id` | 记录 ID |
| `habit_id` | 习惯 ID |
| `user_id` | 打卡用户 |
| `completed_date` | 打卡日期 |
| `created_at` | 创建时间 |

#### `activities`

动态表，同时保存打卡动态和勋章记录。

| 字段 | 说明 |
| --- | --- |
| `id` | 动态 ID |
| `user_id` | 发布者 ID |
| `habit_id` | 关联习惯 ID |
| `user` | 发布者资料快照 JSONB |
| `images` | 图片 URL 数组 |
| `tag` | 标签，例如 `跑步 · 第3天` 或 `medal:30` |
| `content` | 正文 |
| `visibility` | `public`、`friends`、`private` |
| `liked_by` | 点赞列表 JSONB |
| `comments` | 评论列表 JSONB |
| `type` | `checkin` 或 `medal` |
| `created_at` | 创建时间 |

#### `friendships`

好友关系表。代码使用 `receiver_id` 字段表示被申请人。

| 字段 | 说明 |
| --- | --- |
| `id` | 关系 ID |
| `requester_id` | 申请人 |
| `receiver_id` | 接收人 |
| `status` | `pending`、`accepted`、`rejected` |
| `message` | 申请留言 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |

注意：部分旧文档可能写作 `addressee_id`，但当前代码使用的是 `receiver_id`。

#### `follows`

关注关系表。

| 字段 | 说明 |
| --- | --- |
| `id` | 关系 ID |
| `follower_id` | 关注者 |
| `following_id` | 被关注者 |
| `created_at` | 创建时间 |

#### `notifications`

通知表。`supabase_schema.sql` 已包含该表的定义。

| 字段 | 说明 |
| --- | --- |
| `id` | 通知 ID |
| `user_id` | 通知接收人 |
| `actor_id` | 触发通知的人 |
| `actor_name` | 触发者昵称快照 |
| `actor_avatar` | 触发者头像快照 |
| `type` | 通知类型 |
| `post_id` | 关联动态 |
| `comment_id` | 关联评论 |
| `content` | 通知正文 |
| `post_content_preview` | 动态预览 |
| `post_type` | 动态类型 |
| `is_read` | 是否已读 |
| `created_at` | 创建时间 |

#### `app_releases`

用于移动端更新检查。代码期望字段包括：

| 字段 | 说明 |
| --- | --- |
| `version` | 版本号 |
| `build_number` | 构建号，数字越大越新 |
| `release_notes` | 更新说明 |
| `download_url` | 下载地址 |
| `is_mandatory` | 是否强制更新 |

## 关键业务流程

### 登录和资料初始化

1. `useSupabaseSession` 获取当前 Supabase Session。
2. 未登录时渲染 `Auth`。
3. 登录成功后进入主界面。
4. `fetchProfile` 查询 `profiles`。
5. 如果没有资料，自动创建默认昵称和 DiceBear 头像。
6. 同时统计 `habit_logs` 中当前用户总打卡天数。

### 创建个人任务

1. 用户点击 Header 中的创建入口。
2. `CreateTaskModal` 收集任务名称、目标天数、任务类型。
3. `handleAddTask` 生成本地任务对象并乐观插入 UI。
4. 向 `habits` 写入任务。
5. 如果数据库失败，回滚本地任务并提示用户。

### 创建团队任务

1. 用户选择团队任务。
2. 系统生成 6 位邀请码。
3. 创建者作为第一个成员写入 `members`。
4. `is_started` 初始为 `false`。
5. 其他用户通过邀请码加入。
6. 队长点击开始后，`is_started` 变为 `true`，`invite_code` 清空。

### 每日打卡

1. 用户选择任务并发布打卡。
2. `handlePublishCheckIn` 上传图片并 upsert 当日动态。
3. 非编辑模式下调用 `handleCheck`。
4. `handleCheck` 查询 `habit_logs` 防重复。
5. 插入新的打卡记录。
6. 更新本地任务状态。
7. 根据任务类型更新 `habits`。
8. 如达到目标，提示用户进行结算。

### 自动动态和手动动态

自动打卡动态使用确定性 ID：

```text
auto-{habitId}-{userId}-{YYYY-MM-DD}
```

这样同一天同一任务可以被更新而不是无限新增。编辑已有动态时保留原动态 ID、原点赞、原评论和原创建时间。

### 完成任务和领取奖励

1. 当 `currentProgress >= totalDays`，打卡会触发结算逻辑。
2. 用户可以领取奖励或继续挑战。
3. 领取奖励时任务归档。
4. 根据目标天数计算可获得的最高勋章。
5. 勋章以 `activities.type = 'medal'` 的私密动态保存。
6. 删除任务时，勋章动态不会被删除。

勋章层级：

| 天数 | 含义 |
| --- | --- |
| 7 | 7 天勋章 |
| 30 | 30 天勋章 |
| 90 | 90 天勋章 |
| 180 | 180 天勋章 |
| 365 | 365 天勋章 |
| 500 | 500 天勋章 |

### 点赞和评论

1. 用户点击点赞或提交评论。
2. 前端先进行乐观更新，提升反馈速度。
3. 通过 Supabase RPC 写入 JSONB 字段。
4. 如果 RPC 失败，回滚本地状态并提示。
5. 成功后为动态作者或被回复者创建通知。

需要 RPC 的原因是 `liked_by` 和 `comments` 是数组型 JSONB 数据。直接从前端读取、修改、写回容易出现并发覆盖；RPC 可以在数据库侧完成原子更新。

### Realtime 同步

登录后，`App.tsx` 会订阅：

- `public:friendships`
- `public:habits`
- `public:activities`
- `public:notifications`

相关表变化后，应用会重新拉取对应数据。当前实现偏向简单可靠，但在数据量增大后可能需要按用户、习惯或动态 ID 进一步收窄订阅范围。

## 移动端构建

### Capacitor 配置

`capacitor.config.ts`：

```ts
const config = {
  appId: 'com.ycy.habit',
  appName: 'Habit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};
```

### 同步 Web 构建到原生工程

```bash
npm run build
npx cap sync
```

只同步 Android：

```bash
npx cap sync android
```

只同步 iOS：

```bash
npx cap sync ios
```

### 打开原生工程

Android：

```bash
npx cap open android
```

iOS：

```bash
npx cap open ios
```

### Android Debug APK

```bash
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

生成位置通常为：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

在 macOS/Linux 或 Git Bash 中也可以使用：

```bash
./gradlew assembleDebug
```

## 部署与发布

### Web 构建

```bash
npm run build
```

构建产物在：

```text
dist/
```

由于 `vite.config.ts` 设置了：

```ts
base: './'
```

构建产物更适合被 Capacitor 或静态文件服务器以相对路径加载。

### Codemagic

仓库包含：

- `codemagic.yaml`
- `CODEMAGIC_GUIDE.md`

用于移动端云构建。具体签名、证书、环境变量和构建流水线说明请查看 `CODEMAGIC_GUIDE.md`。

### Ionic Appflow

仓库包含 `appflow.config.json`。如果使用 Appflow，需要在对应平台配置应用、证书和构建环境。

## 开发规范

### 代码风格

- 使用 TypeScript 编写业务逻辑。
- 组件文件使用 PascalCase，例如 `HabitCard.tsx`。
- Hook 文件使用 `useXxx.ts` 命名。
- 业务逻辑优先放入 Hook，UI 组件保持展示和交互职责。
- Supabase 访问集中在 Hook 或 `lib` 中，不建议散落到纯展示组件。

### 状态更新

- 对用户操作优先使用乐观更新，但必须在失败时回滚。
- 重要数据以数据库为最终来源。
- Realtime 回调中只做轻量触发，避免复杂计算。

### 图片处理

- 上传前压缩到较小尺寸。
- 本地先显示 Base64 预览。
- 上传成功后保存 Supabase Storage 公共 URL。
- 删除动态或注销账号时尽量清理对应 Storage 文件。

### 安全建议

- 前端只能使用 Supabase anon key。
- 不要在 `.env` 中放入 `service_role` key。
- 所有 `public` schema 中暴露给前端的表都应启用 RLS。
- `profiles.custom_id` 建议加唯一约束。
- `friendships` 建议加双方唯一约束，防止重复好友关系。
- `habit_logs` 建议唯一约束包含 `habit_id`、`user_id`、`completed_date`。
- 对 `activities` 的更新策略需要谨慎。当前代码允许非作者通过 RPC 更新点赞和评论，生产环境建议使用受限 RPC 或更细粒度策略，而不是允许任意字段更新。

## 常见问题

### 1. 页面能打开，但登录或数据加载失败

优先检查：

- `.env` 是否包含 `VITE_SUPABASE_URL`
- `.env` 是否包含 `VITE_SUPABASE_ANON_KEY`
- Supabase Auth 是否开启邮箱登录
- 浏览器控制台是否提示缺少环境变量
- Supabase 表和 RLS 是否已经创建

### 2. 创建任务失败

可能原因：

- `habits` 表缺少当前代码需要的字段。
- RLS 未允许当前用户 insert。
- `user_id` 没有正确等于 `auth.uid()`。
- Supabase URL/key 配置错误。

### 3. 点赞或评论失败

可能原因：

- 没有创建 RPC：`add_like`、`remove_like`、`add_comment`、`remove_comment`。
- RPC 参数名和前端调用不一致。
- RPC 没有足够权限更新 `activities`。
- RLS 阻止了相关更新。

### 4. 图片上传失败

可能原因：

- 没有创建 `habit` bucket。
- bucket 不是 public，但前端尝试读取 public URL。
- Storage policy 不允许当前用户上传或覆盖文件。
- 文件过大或网络中断。

### 5. 好友申请没有显示

可能原因：

- `friendships` 表字段名和代码不一致。当前代码使用 `receiver_id`，不是 `addressee_id`。
- RLS 没有允许接收人读取 pending 请求。
- Realtime 没有开启，或表未加入 publication。

### 6. 团队邀请码无效

可能原因：

- 队长已经开始挑战，`invite_code` 被清空。
- 输入的邀请码大小写或空格未处理。
- 当前用户已在该团队中。
- 团队人数达到上限。
- `habits` 表缺少 `invite_code`、`members` 或 `is_started` 字段。

### 7. 原生 App 更新检查总是失败

可能原因：

- 当前在 Web 环境，更新检查会直接返回 `Web Preview`。
- Supabase 中没有 `app_releases` 表。
- `app_releases` 表缺少 `build_number` 等字段。
- RLS 没有允许客户端读取最新发布记录。

## 维护建议

当前项目功能已经比较完整，但有几个后续值得优先整理的点：

- 补齐并版本化完整 Supabase migration，而不是只维护部分 `supabase_schema.sql`。
- 更新 `.env.example`，移除无关 Gemini 模板，加入 Supabase 必需变量。
- 将 `useAppState` 拆分为更细的业务状态模块。
- 将团队成员从 `habits.members` JSONB 逐步迁移到关系表，便于查询和权限控制。
- 将断签检查、团队投票超时检查迁移到服务端定时任务。
- 为 RPC、RLS、Storage policy 增加部署说明和测试脚本。
- 为核心 Hook 增加单元测试或集成测试，尤其是打卡、结算、团队投票、点赞评论。
