import { ChangeEvent, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import imageCompression from 'browser-image-compression';
import Auth from './components/Auth';
import AppContent from './components/AppContent';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MoodModal from './components/MoodModal';
import MedalModal from './components/MedalModal';
import PostDetailOverlay from './components/PostDetailOverlay';
import DecisionOverlay from './components/DecisionOverlay';
import NotificationCenter from './components/NotificationCenter';
import { CheckInDrawer, CreateTaskModal, DeleteConfirmModal, TaskDetailsDrawer } from './components/CheckInModal';
import SearchOverlay from './components/SearchOverlay';
import SettingsOverlay from './components/SettingsOverlay';
import UserProfilePage from './components/UserProfilePage';
import Celebration from './components/Celebration';

import { useAppState } from './hooks/useAppState';
import { useAppearanceEffects, useReminderEffect, useSupabaseSession } from './hooks/useAppEffects';
import { useHabitsData } from './hooks/useHabitsData';
import { useUserActions } from './hooks/useUserActions';
import { useFriendActions } from './hooks/useFriendActions';
import { useActivityActions } from './hooks/useActivityActions';
import { useHabitActions } from './hooks/useHabitActions';
import { useFollowActions } from './hooks/useFollowActions';
import { useNotificationActions } from './hooks/useNotificationActions';
import { useAppUpdate } from './hooks/useAppUpdate';
import { isDarkColor, readImageFileAsDataUrl } from './utils/app';
import { useNotifications } from './hooks/useNotifications';
import { useStorage } from './hooks/useStorage';
import { useNotificationStore } from './store/useNotificationStore';
import { supabase } from './lib/supabase';

export default function App() {
  const state = useAppState();
  const {
    session, setSession,
    activeTab, setActiveTab,
    homeSubTab, setHomeSubTab,
    friendSubTab, setFriendSubTab,
    tasksSubTab, setTasksSubTab,
    tasks, setTasks,
    completedTasks, setCompletedTasks,
    isModalOpen, setIsModalOpen,
    isMoodOpen, setIsMoodOpen,
    isCheckInOpen, setIsCheckInOpen,
    checkInVisibility, setCheckInVisibility,
    checkInHabitId, setCheckInHabitId,
    checkInContent, setCheckInContent,
    checkInImages, setCheckInImages,
    activities, setActivities,
    editingPostId, setEditingPostId,
    confirmDeleteId, setConfirmDeleteId,
    confirmDeleteMeta, setConfirmDeleteMeta,
    confirmFriendDelete, setConfirmFriendDelete,
    selectedTaskDetails, setSelectedTaskDetails,
    currentMood, setCurrentMood,
    decisionHabit, setDecisionHabit,
    isSearching, setIsSearching,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    searchHistory, setSearchHistory,
    isSettingsOpen, setIsSettingsOpen,
    isEditingName, setIsEditingName,
    isEditingId, setIsEditingId,
    userProfile, setUserProfile,
    taskName, setTaskName,
    taskDays, setTaskDays,
    taskType, setTaskType,
    joinCode, setJoinCode,
    settingsCategory, setSettingsCategory,
    activeSubPage, setActiveSubPage,
    appBackground, setAppBackground,
    dailyReminder, setDailyReminder,
    defaultVisibility, setDefaultVisibility,
    isVisibilitySheetOpen, setIsVisibilitySheetOpen,
    appearance, setAppearance,
    isAppearanceSheetOpen, setIsAppearanceSheetOpen,
    cacheSize, setCacheSize,
    reminderTimes, setReminderTimes,
    toast, setToast,
    selectedPost, setSelectedPost,
    selectedMedal, setSelectedMedal,
    isLogoutConfirmOpen, setIsLogoutConfirmOpen,
    isPasswordModalOpen, setIsPasswordModalOpen,
    newPassInput, setNewPassInput,
    isTimePickerOpen, setIsTimePickerOpen,
    timePickerValue, setTimePickerValue,
    editingTimeIndex, setEditingTimeIndex,
    userCheckInDays, setUserCheckInDays,
    friendRequests, setFriendRequests,
    friends, setFriends,
    followings, setFollowings,
    followers, setFollowers,
    viewingProfile, setViewingProfile,
    showFireworks, setShowFireworks,
    fetchStatus, setFetchStatus,
    lastViewedFriendsAt, setLastViewedFriendsAt,
    lastViewedRequestsAt, setLastViewedRequestsAt,
    bgInputRef,
  } = state;



  useSupabaseSession(setSession, setIsPasswordModalOpen);
  useAppearanceEffects({ appearance, appBackground });

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, [setToast]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);
  const pullDistance = useRef(0);
  const pullStartY = useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPullingRef = useRef(false);
  const pullTriggeredRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const PULL_THRESHOLD = 60;
  const DAMPING = 0.5;

  useReminderEffect({ dailyReminder, reminderTimes, showToast });

  const { fetchNotifications, markAsRead, markAllAsRead, createNotification, loadMore, hasMore, getPreferences, savePreferences, updateBadge } = useNotificationActions(session, userProfile);
  const { notifications } = useNotificationStore();
  const unreadCount = useNotificationStore(s => s.unreadCount);

  useEffect(() => {
    updateBadge();
  }, [unreadCount, updateBadge]);

  // Data hooks
  const { fetchHabits, fetchActivities } = useHabitsData({
    userId: session?.user?.id,
    setTasks, setCompletedTasks, setActivities,
    setFetchStatus,
  });

  // Action hooks
  const { uploadAvatar, uploadPostImage, deleteFile, deleteFiles } = useStorage();

  const { fetchProfile, updateProfile, updateProfileId, handleLogout, handleDeleteAccount, handlePasswordSubmit } =
    useUserActions({
      session, userProfile, setUserProfile, setUserCheckInDays,
      setIsLogoutConfirmOpen, setIsSettingsOpen,
      setIsPasswordModalOpen, setNewPassInput, newPassInput, showToast,
      setActivities, deleteFile, deleteFiles
    });

  const friendActions = useFriendActions({
      session, userProfile, setFriendRequests, setFriends,
      setSearchResults, setSearchQuery, setIsSearching, showToast,
      createNotification,
    });

  const { fetchFriendRequests, fetchFriends, handleSearch, handleSendFriendRequest, handleAcceptFriendRequest, handleRejectFriendRequest, handleDeleteFriend } = friendActions;

  const { fetchFollowings, fetchFollowers, handleFollow, isFollowing } = useFollowActions({
    session, followings, setFollowings, setFollowers, showToast,
    createNotification,
  });

  const {
    handleCheck, handleDecision, handleTeamVote,
    handleDelete, confirmDelete, checkAndUpdateStreaks, checkTeamVoteTimeouts,
    handleAddTask, handleJoinTeam, handleStartTeam, handleKickMember,
    handleClaimReward,
  } = useHabitActions({
      session, userProfile, tasks, completedTasks,
      taskName, taskDays, taskType, joinCode, activities,
      setTasks, setCompletedTasks, setActivities,
      setConfirmDeleteId, confirmDeleteId,
      setConfirmDeleteMeta,
      setDecisionHabit, setSelectedMedal,
      setIsModalOpen, setTaskName, setJoinCode,
      setUserCheckInDays, setShowFireworks, showToast,
      setHabitLogs: () => {}, // No-op
      createNotification,
    });

  // 通知 hook
  useNotifications(tasks, reminderTimes);
  
  // 检查版本更新
  useAppUpdate();

  const { handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility, handlePublishCheckIn, handleEditPost, handleDeletePost } =
    useActivityActions({
      session, userProfile, tasks, activities,
      checkInHabitId, checkInContent, checkInImages, checkInVisibility, editingPostId,
      setActivities, setIsCheckInOpen, setCheckInContent,
      setCheckInHabitId, setCheckInImages, setEditingPostId,
      handleCheck, showToast, uploadPostImage, deleteFiles,
      createNotification,
    });

  const handleImageUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>, callback: (url: string, previewUrl?: string) => void) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    let previewUrl = '';
    // 1. 先进行本地预览 (Base64) 提升感知速度
    readImageFileAsDataUrl(file, (url) => {
      previewUrl = url;
      callback(url);
    });

    // 2. 压缩图片 (针对移动端优化)
    showToast('正在优化图片...');
    let compressedFile = file;
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      compressedFile = await imageCompression(file, options);
    } catch (error) {
      console.error('Compression failed:', error);
    }

    // 3. 上传到存储桶
    showToast('正在同步到云端...');
    const publicUrl = await uploadPostImage(session.user.id, compressedFile);
    
    if (publicUrl) {
      // 传入 previewUrl，方便 UI 将预览图替换为正式图
      callback(publicUrl, previewUrl);
      showToast('同步成功');
    } else {
      showToast('上传失败，请重试');
    }
  }, [session, uploadPostImage, showToast]);


  const handleRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchHabits(),
        fetchActivities(),
        fetchFriendRequests(),
        fetchFriends(),
        fetchFollowings(),
        fetchFollowers(),
        fetchProfile(),
        fetchNotifications(),
      ]);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
    showToast('刷新成功');
  }, [fetchHabits, fetchActivities, fetchFriendRequests, fetchFriends, fetchFollowings, fetchFollowers, fetchProfile, fetchNotifications, showToast]);

  const handleLoadMore = useCallback(async () => {
    await fetchActivities(activities.length);
  }, [fetchActivities, activities.length]);



  useEffect(() => {
    if (!session?.user?.id) return;
    fetchProfile();
    fetchHabits().then(() => {
      // 加载后检测断签状态
      checkAndUpdateStreaks(tasks);
    });
    fetchActivities();
    fetchFriendRequests();
    fetchFriends();
    fetchFollowings();
    fetchFollowers();
    fetchNotifications();
    // Realtime subscription for friendships
    const friendChannel = supabase.channel('public:friendships')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'friendships' }, 
        () => {
          fetchFriendRequests();
          fetchFriends();
        }
      )
      .subscribe();

    // Realtime subscription for habits (to see member check-ins)
    const habitChannel = supabase.channel('public:habits')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habits' },
        () => {
          fetchHabits();
        }
      )
      .subscribe();

    // Realtime subscription for activities
    const activityChannel = supabase.channel('public:activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();
    const notificationChannel = supabase.channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendChannel);
      supabase.removeChannel(habitChannel);
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [session?.user?.id]);

  // Team vote timeout check (best-effort client side)
  useEffect(() => {
    if (!tasks.length) return;
    checkTeamVoteTimeouts(tasks);
  }, [tasks, checkTeamVoteTimeouts]);


  // Effect to clear "New Friend Posts" red dot
  useEffect(() => {
    if (activeTab === 'friends' && friendSubTab === 'feed') {
      // Use a slight future timestamp to ensure it clears even if clock is slightly off
      setLastViewedFriendsAt(Date.now() + 500);
    }
  }, [activeTab, friendSubTab, setLastViewedFriendsAt]);

  // Effect to clear "New Friend Requests" red dot
  useEffect(() => {
    if (activeTab === 'friends' && friendSubTab === 'requests') {
      setLastViewedRequestsAt(Date.now() + 500);
    }
  }, [activeTab, friendSubTab, setLastViewedRequestsAt]);


  const friendIds = useMemo(() => new Set(friends.map(f => f.id)), [friends]);
  const latestFriendPostTime = useMemo(() => {
    const times = activities
      .filter(a => (a.visibility === 'public' || a.visibility === 'friends') && friendIds.has(a.user?.id))
      .map(a => a.createdAt);
    return times.length > 0 ? Math.max(...times) : 0;
  }, [activities, friendIds]);
  const hasNewFriendPosts = latestFriendPostTime > lastViewedFriendsAt;

  const hasNewFriendRequests = useMemo(() => {
    return friendRequests.some(r => {
      const createdAt = r.created_at ? new Date(r.created_at).getTime() : 0;
      return createdAt > lastViewedRequestsAt;
    });
  }, [friendRequests, lastViewedRequestsAt]);


  const totalLikes = useMemo(() => {
    if (!userProfile?.id) return 0;
    return activities
      .filter(a => a.user.id === userProfile.id)
      .reduce((sum, post) => sum + (post.likedBy?.length || 0), 0);
  }, [activities, userProfile.id]);

  // View a user profile by UUID
  const handleViewProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setViewingProfile({
        id: data.id,
        customId: data.custom_id,
        name: data.name,
        avatar: data.avatar,
      });
    }
  }, [setViewingProfile]);

  if (!session) return <Auth onLogin={() => {}} />;

  const isDark = isDarkColor(appBackground);

  return (
    <div
      className={`min-h-screen max-w-lg mx-auto flex flex-col font-sans selection:bg-black selection:text-white relative overflow-hidden transition-colors duration-500 ${isDark ? 'text-white' : 'text-neutral-900'}`}
      style={appBackground ? { backgroundColor: appBackground } : { backgroundColor: '#fafafa' }}
    >
      <Header
        isDark={isDark} currentMood={currentMood} activeTab={activeTab}
        setIsMoodOpen={setIsMoodOpen} setIsModalOpen={setIsModalOpen}
        setIsSearching={setIsSearching} setIsSettingsOpen={setIsSettingsOpen}
      />

      {/* Search overlay */}
      <SearchOverlay
        isOpen={isSearching} onClose={() => { setIsSearching(false); setSearchQuery(''); setSearchResults([]); }}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        searchHistory={searchHistory} setSearchHistory={setSearchHistory}
        searchResults={searchResults} isSearching={false}
        onSearch={handleSearch}
        onViewProfile={user => { setIsSearching(false); handleViewProfile(user.id); }}
        currentUserId={userProfile.id}
      />

      {/* Main content */}
      <div className="flex-grow relative overflow-hidden">
        {/* Refresh indicator */}
        <div
          className="absolute top-0 left-0 right-0 z-50 flex justify-center bg-white/90 backdrop-blur-sm pointer-events-none transition-all duration-200"
          style={{
            height: isRefreshing || pullDistance.current > 0 ? 56 : 0,
            opacity: isRefreshing || pullDistance.current > 0 ? 1 : 0,
          }}
        >
          <div className="flex flex-col items-center justify-center gap-1 h-full">
            {isRefreshing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-[2.5px] border-neutral-200 border-t-neutral-700 rounded-full"
                />
                <span className="text-[11px] font-semibold text-neutral-500">刷新中...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: pullDistance.current >= PULL_THRESHOLD ? 180 : 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-5 h-5 border-[2.5px] border-neutral-200 border-t-neutral-700 rounded-full"
                />
                <span className="text-[11px] font-semibold text-neutral-400">
                  {pullDistance.current >= PULL_THRESHOLD ? '松开立即刷新' : '下拉刷新'}
                </span>
              </>
            )}
          </div>
        </div>
        <div
          ref={contentRef}
          className="h-full overflow-y-auto"
          onTouchStart={e => {
            if (isRefreshing) return;
            pullStartY.current = e.touches[0].clientY;
            isPullingRef.current = false;
            pullTriggeredRef.current = false;
          }}
          onTouchMove={e => {
            if (isRefreshing || !contentRef.current) return;
            const scrollTop = contentRef.current.scrollTop;
            if (scrollTop > 0) return;
            const currentY = e.touches[0].clientY;
            const diff = currentY - pullStartY.current;
            if (diff <= 0) {
              if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
              }
              pullDistance.current = 0;
              return;
            }
            e.preventDefault();
            if (animFrameRef.current !== null) {
              cancelAnimationFrame(animFrameRef.current);
            }
            animFrameRef.current = requestAnimationFrame(() => {
              if (!contentRef.current) return;
              const rawDiff = e.touches[0].clientY - pullStartY.current;
              const damped = rawDiff * DAMPING;
              const resistance = 1 - Math.min(damped / 300, 0.7);
              pullDistance.current = Math.max(0, Math.min(damped * resistance, 150));
              isPullingRef.current = pullDistance.current >= PULL_THRESHOLD;
            });
          }}
          onTouchEnd={() => {
            if (animFrameRef.current !== null) {
              cancelAnimationFrame(animFrameRef.current);
              animFrameRef.current = null;
            }
            if (isRefreshing) return;
            if (pullDistance.current >= PULL_THRESHOLD && !pullTriggeredRef.current) {
              pullTriggeredRef.current = true;
              handleRefresh().finally(() => {
                if (contentRef.current) {
                  contentRef.current.style.transition = 'scroll-behavior 400ms ease-out';
                  contentRef.current.scrollTop = 0;
                  setTimeout(() => {
                    if (contentRef.current) contentRef.current.style.transition = '';
                  }, 400);
                }
                pullDistance.current = 0;
              });
            } else {
              pullDistance.current = 0;
            }
            isPullingRef.current = false;
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
            >
            <AppContent
              activeTab={activeTab}
              homeSubTab={homeSubTab} setHomeSubTab={setHomeSubTab}
              friendSubTab={friendSubTab} setFriendSubTab={setFriendSubTab}
              friendRequests={friendRequests}
              onAcceptRequest={handleAcceptFriendRequest} onRejectRequest={handleRejectFriendRequest}
              tasksSubTab={tasksSubTab} setTasksSubTab={setTasksSubTab}
              joinCode={joinCode} setJoinCode={setJoinCode}
              handleJoinTeam={handleJoinTeam} handleStartTeam={handleStartTeam} handleKickMember={handleKickMember}
              handleCheck={handleCheck}
              handleDelete={handleDelete}
              handleTeamVote={handleTeamVote}
              currentUserId={session?.user?.id}
              onDeleteFriend={(friendId: string) => {
                const f = friends.find(x => x.id === friendId);
                setConfirmFriendDelete({ id: friendId, name: f?.name || '该用户' });
              }}
              onClaimReward={handleClaimReward}
              handleLike={handleLike} handleAddComment={handleAddComment}
              handleDeleteComment={handleDeleteComment} handleChangeVisibility={handleChangeVisibility}
              handleDeletePost={handleDeletePost}
              handleEditPost={handleEditPost}
              showToast={showToast}
              handleImageUpload={handleImageUpload}
              updateProfile={updateProfile}
              isEditingName={isEditingName} setIsEditingName={setIsEditingName}
              isEditingId={isEditingId} setIsEditingId={setIsEditingId}
              updateProfileId={updateProfileId}
              setSelectedMedal={setSelectedMedal}
              onViewProfile={handleViewProfile}
              hasNewFriendPosts={hasNewFriendPosts}
              totalLikes={totalLikes}
              fetchStatus={fetchStatus}
              onLoadMore={handleLoadMore}
            />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDark={isDark} 
        setIsCheckInOpen={setIsCheckInOpen} 
        hasNewFriendRequests={hasNewFriendRequests}
        hasNewFriendPosts={hasNewFriendPosts}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />


      {/* ── Modals & Overlays ── */}
      <CreateTaskModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        taskName={taskName} setTaskName={setTaskName}
        taskDays={taskDays} setTaskDays={setTaskDays}
        taskType={taskType} setTaskType={setTaskType}
        onCreate={handleAddTask}
      />

      <DeleteConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => { setConfirmDeleteId(null); setConfirmDeleteMeta(null); }}
        onConfirm={confirmDelete}
        title={confirmDeleteMeta?.isArchived ? '确定删除归档？' : '删除不可逆'}
        description={
          confirmDeleteMeta?.isArchived
            ? `你正在删除已完成任务「${confirmDeleteMeta.name}」。\n为防止误删，请再次确认。\n（已获得的勋章不会被删除）`
            : '该任务下所有的打卡记录与勋章进度将永久消失。\n确定要放弃这个目标吗？'
        }
        confirmText={confirmDeleteMeta?.isArchived ? '确定删除归档' : '彻底删除'}
        cancelText="取消"
      />

      <DeleteConfirmModal
        isOpen={!!confirmFriendDelete}
        onClose={() => setConfirmFriendDelete(null)}
        onConfirm={async () => {
          if (!confirmFriendDelete) return;
          await handleDeleteFriend(confirmFriendDelete.id);
          setConfirmFriendDelete(null);
        }}
        title="确定删除好友？"
        description={confirmFriendDelete ? `你将与「${confirmFriendDelete.name}」解除好友关系。\n此操作不可撤销。` : ''}
        confirmText="确定删除"
        cancelText="取消"
        confirmClassName="bg-red-500"
      />

      <TaskDetailsDrawer
        isOpen={!!selectedTaskDetails} task={selectedTaskDetails}
        onClose={() => setSelectedTaskDetails(null)}
        activities={activities} userProfile={userProfile}
        onLike={handleLike} onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
        onDeletePost={handleDeletePost}
        onEditPost={handleEditPost}
        onViewDetail={setSelectedPost}
        currentScope={selectedTaskDetails?.type === 'team' ? 'team' : 'friends'}
        showScopeSelector={true}
        allowedScopes={selectedTaskDetails?.type === 'team' ? ['public', 'friends', 'team'] : ['public', 'friends']}
        emptyStateText="尚未开始记录"
        showToast={showToast}
      />

      <CheckInDrawer
        isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)}
        tasks={tasks}
        checkInHabitId={checkInHabitId} setCheckInHabitId={setCheckInHabitId}
        checkInContent={checkInContent} setCheckInContent={setCheckInContent}
        checkInImages={checkInImages} setCheckInImages={setCheckInImages}
        checkInVisibility={checkInVisibility} setCheckInVisibility={setCheckInVisibility}
        editingPostId={editingPostId} setEditingPostId={setEditingPostId}
        onPublish={handlePublishCheckIn} onImageUpload={handleImageUpload}
      />

      <AnimatePresence>
        {decisionHabit && (
          <DecisionOverlay
            habit={decisionHabit}
            isTeamCreator={decisionHabit.type === 'team' && decisionHabit.creatorId === session?.user?.id}
            onDecision={(choice, customDays) => {
              if (decisionHabit.type === 'team' && choice === 'continue') {
                handleTeamVote(decisionHabit.id, 'continue', customDays);
                setDecisionHabit(null);
              } else {
                handleDecision(decisionHabit, choice, customDays);
              }
            }}
          />
        )}
      </AnimatePresence>

      <SettingsOverlay
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        settingsCategory={settingsCategory} setSettingsCategory={setSettingsCategory}
        activeSubPage={activeSubPage} setActiveSubPage={setActiveSubPage}
        dailyReminder={dailyReminder} setDailyReminder={setDailyReminder}
        reminderTimes={reminderTimes} setReminderTimes={setReminderTimes}
        appearance={appearance} setAppearance={setAppearance}
        cacheSize={cacheSize} setCacheSize={setCacheSize}
        showToast={showToast} appBackground={appBackground} setAppBackground={setAppBackground}
        defaultVisibility={defaultVisibility} setDefaultVisibility={setDefaultVisibility}
        isLogoutConfirmOpen={isLogoutConfirmOpen} setIsLogoutConfirmOpen={setIsLogoutConfirmOpen}
        isPasswordModalOpen={isPasswordModalOpen} setIsPasswordModalOpen={setIsPasswordModalOpen}
        newPassInput={newPassInput} setNewPassInput={setNewPassInput}
        onPasswordSubmit={handlePasswordSubmit}
        isTimePickerOpen={isTimePickerOpen} setIsTimePickerOpen={setIsTimePickerOpen}
        timePickerValue={timePickerValue} setTimePickerValue={setTimePickerValue}
        editingTimeIndex={editingTimeIndex} setEditingTimeIndex={setEditingTimeIndex}
        isAppearanceSheetOpen={isAppearanceSheetOpen} setIsAppearanceSheetOpen={setIsAppearanceSheetOpen}
        isVisibilitySheetOpen={isVisibilitySheetOpen} setIsVisibilitySheetOpen={setIsVisibilitySheetOpen}
        onLogout={handleLogout} onDeleteAccount={handleDeleteAccount}
      />

      <MoodModal isOpen={isMoodOpen} onClose={() => setIsMoodOpen(false)} currentMood={currentMood} setCurrentMood={setCurrentMood} />
      <MedalModal medal={selectedMedal} onClose={() => setSelectedMedal(null)} />

      {state.showFireworks && <Celebration onComplete={() => state.setShowFireworks(false)} />}

      <PostDetailOverlay
        post={selectedPost} onClose={() => setSelectedPost(null)}
        onLike={handleLike} onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
        onDeletePost={handleDeletePost}
        onEditPost={handleEditPost}
        currentUserProfile={userProfile}
      />

      {/* User profile page */}
      <UserProfilePage
        profile={viewingProfile}
        isOpen={!!viewingProfile}
        onClose={() => setViewingProfile(null)}
        activities={activities}
        isFollowing={viewingProfile ? isFollowing(viewingProfile.id) : false}
        isFriend={viewingProfile ? friends.some(f => f.id === viewingProfile.id) : false}
        onFollow={handleFollow}
        onLike={handleLike} onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
        onDeletePost={handleDeletePost}
        onEditPost={handleEditPost}
        onViewDetail={setSelectedPost}
        currentUserProfile={userProfile}
        onSendFriendRequest={handleSendFriendRequest}
      />

      {/* Notification center */}
      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onLoadMore={loadMore}
        hasMore={hasMore}
        onViewProfile={(userId) => { setIsNotificationOpen(false); handleViewProfile(userId); }}
        onViewPost={(postId) => {
          setIsNotificationOpen(false);
          const post = activities.find(a => a.id === postId);
          if (post) setSelectedPost(post);
        }}
        getPreferences={getPreferences}
        savePreferences={savePreferences}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1000] bg-neutral-900 text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl tracking-widest uppercase border border-white/10 whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
