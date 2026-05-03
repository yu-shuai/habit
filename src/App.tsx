import { ChangeEvent, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Auth from './components/Auth';
import AppContent from './components/AppContent';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MoodModal from './components/MoodModal';
import MedalModal from './components/MedalModal';
import PostDetailOverlay from './components/PostDetailOverlay';
import DecisionOverlay from './components/DecisionOverlay';
import { CheckInDrawer, CreateTaskModal, DeleteConfirmModal, TaskDetailsDrawer } from './components/CheckInModal';
import SearchOverlay from './components/SearchOverlay';
import SettingsOverlay from './components/SettingsOverlay';
import UserProfilePage from './components/UserProfilePage';

import { useAppState } from './hooks/useAppState';
import { useAppearanceEffects, useReminderEffect, useSupabaseSession } from './hooks/useAppEffects';
import { useHabitsData } from './hooks/useHabitsData';
import { useUserActions } from './hooks/useUserActions';
import { useFriendActions } from './hooks/useFriendActions';
import { useActivityActions } from './hooks/useActivityActions';
import { useHabitActions } from './hooks/useHabitActions';
import { useFollowActions } from './hooks/useFollowActions';
import { isDarkColor, readImageFileAsDataUrl } from './utils/app';
import { supabase } from './lib/supabase';
import { useNotifications } from './hooks/useNotifications';

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
  } = state;

  useSupabaseSession(setSession, setIsPasswordModalOpen);
  useAppearanceEffects({ appearance, appBackground });

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }, [setToast]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pullStartY = useRef<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 60;
  const RELEASE_THRESHOLD = 80;

  useReminderEffect({ dailyReminder, reminderTimes, showToast });

  // Data hooks
  const { fetchHabits, fetchActivities } = useHabitsData({
    userId: session?.user?.id,
    setTasks, setCompletedTasks, setActivities,
  });

  // Action hooks
  const { fetchProfile, updateProfile, updateProfileId, handleLogout, handleDeleteAccount, handlePasswordSubmit } =
    useUserActions({
      session, userProfile, setUserProfile, setUserCheckInDays,
      setIsLogoutConfirmOpen, setIsSettingsOpen,
      setIsPasswordModalOpen, setNewPassInput, newPassInput, showToast,
      setActivities,
    });

  const friendActions = useFriendActions({
      session, userProfile, setFriendRequests, setFriends,
      setSearchResults, setSearchQuery, setIsSearching, showToast,
    });

  const { fetchFriendRequests, fetchFriends, handleSearch, handleSendFriendRequest, handleAcceptFriendRequest, handleRejectFriendRequest, handleDeleteFriend } = friendActions;

  const { fetchFollowings, fetchFollowers, handleFollow, isFollowing } = useFollowActions({
    session, followings, setFollowings, setFollowers, showToast,
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
    });

  // 通知 hook
  useNotifications(tasks, reminderTimes);

  const { handleLike, handleAddComment, handleDeleteComment, handleChangeVisibility, handlePublishCheckIn } =
    useActivityActions({
      session, userProfile, tasks, activities,
      checkInHabitId, checkInContent, checkInImages, checkInVisibility, editingPostId,
      setActivities, setIsCheckInOpen, setCheckInContent,
      setCheckInHabitId, setCheckInImages, setEditingPostId,
      handleCheck, showToast,
    });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchHabits(), fetchActivities(), fetchFriends(), fetchFollowings(), fetchFollowers()]);
    setIsRefreshing(false);
    showToast('刷新成功');
  }, [fetchHabits, fetchActivities, fetchFriends, fetchFollowings, fetchFollowers, showToast]);

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

    // Realtime subscription for activities (likes/comments/visibility updates)
    const activityChannel = supabase.channel('public:activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendChannel);
      supabase.removeChannel(habitChannel);
      supabase.removeChannel(activityChannel);
    };
  }, [session?.user?.id, fetchFriendRequests, fetchFriends]);

  // Team vote timeout check (best-effort client side)
  useEffect(() => {
    if (!tasks.length) return;
    checkTeamVoteTimeouts(tasks);
  }, [tasks, checkTeamVoteTimeouts]);

  const [lastViewedFriendsAt, setLastViewedFriendsAt] = useState(() => Number(localStorage.getItem('lastViewedFriendsAt')) || 0);

  useEffect(() => {
    if (activeTab === 'friends' && friendSubTab === 'feed') {
      const now = Date.now();
      setLastViewedFriendsAt(now);
      localStorage.setItem('lastViewedFriendsAt', now.toString());
    }
  }, [activeTab, friendSubTab]);

  const friendIds = useMemo(() => new Set(friends.map(f => f.id)), [friends]);
  const latestFriendPostTime = useMemo(() => {
    const times = activities
      .filter(a => (a.visibility === 'public' || a.visibility === 'friends') && friendIds.has(a.user?.id))
      .map(a => a.createdAt);
    return times.length > 0 ? Math.max(...times) : 0;
  }, [activities, friendIds]);
  const hasNewFriendPosts = latestFriendPostTime > lastViewedFriendsAt;

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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFileAsDataUrl(file, callback);
  };

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
        {isRefreshing && (
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-center py-3 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full"
              />
              刷新中...
            </div>
          </div>
        )}
        {!isRefreshing && pullDistance > 0 && (
          <div className="absolute top-0 left-0 right-0 z-50 flex justify-center py-3 bg-white/80 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ rotate: pullDistance >= PULL_THRESHOLD ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full"
              />
              <span className="text-xs text-neutral-400">
                {pullDistance >= PULL_THRESHOLD ? '释放刷新' : '下拉刷新'}
              </span>
            </div>
          </div>
        )}
        <div
          ref={contentRef}
          className="h-full overflow-y-auto"
          style={{ paddingTop: isRefreshing || pullDistance > 0 ? 44 : 0 }}
          onTouchStart={e => {
            if (isRefreshing) return;
            pullStartY.current = e.touches[0].clientY;
            isPullingRef.current = false;
          }}
          onTouchMove={e => {
            if (isRefreshing || !contentRef.current) return;
            const scrollTop = contentRef.current.scrollTop;
            const currentY = e.touches[0].clientY;
            const diff = currentY - pullStartY.current;
            if (diff > 0 && scrollTop === 0) {
              e.preventDefault();
              const distance = Math.min(diff * 0.5, RELEASE_THRESHOLD + 40);
              setPullDistance(distance);
              isPullingRef.current = distance >= PULL_THRESHOLD;
            }
          }}
          onTouchEnd={() => {
            if (isRefreshing) return;
            if (isPullingRef.current && contentRef.current && contentRef.current.scrollTop === 0) {
              handleRefresh();
            }
            setPullDistance(0);
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
              homeSubTab={homeSubTab} setHomeSubTab={setHomeSubTab} followings={followings}
              friendSubTab={friendSubTab} setFriendSubTab={setFriendSubTab}
              friendRequests={friendRequests}
              onAcceptRequest={handleAcceptFriendRequest} onRejectRequest={handleRejectFriendRequest}
              tasksSubTab={tasksSubTab} setTasksSubTab={setTasksSubTab}
              tasks={tasks} completedTasks={completedTasks} activities={activities} friends={friends}
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
              setSelectedPost={setSelectedPost} setSelectedTaskDetails={setSelectedTaskDetails}
              userProfile={userProfile} showToast={showToast}
              handleImageUpload={handleImageUpload}
              setUserProfile={setUserProfile} updateProfile={updateProfile}
              isEditingName={isEditingName} setIsEditingName={setIsEditingName}
              isEditingId={isEditingId} setIsEditingId={setIsEditingId}
              updateProfileId={updateProfileId}
              userCheckInDays={userCheckInDays} setSelectedMedal={setSelectedMedal}
              onViewProfile={handleViewProfile}
              hasNewFriendPosts={hasNewFriendPosts}
              followers={followers}
              totalLikes={totalLikes}
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
        hasNewFriendRequests={friendRequests.length > 0}
        hasNewFriendPosts={hasNewFriendPosts}
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

      <PostDetailOverlay
        post={selectedPost} onClose={() => setSelectedPost(null)}
        onLike={handleLike} onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
        currentUserProfile={userProfile}
      />

      {/* User profile page */}
      <UserProfilePage
        profile={viewingProfile}
        isOpen={!!viewingProfile}
        onClose={() => setViewingProfile(null)}
        activities={activities}
        isFollowing={viewingProfile ? isFollowing(viewingProfile.id) : false}
        onFollow={handleFollow}
        onLike={handleLike} onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment} onChangeVisibility={handleChangeVisibility}
        onViewDetail={setSelectedPost}
        currentUserProfile={userProfile}
        onSendFriendRequest={handleSendFriendRequest}
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
