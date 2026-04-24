import { ChangeEvent, useCallback, useEffect, useState, useMemo } from 'react';
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
    });

  const { fetchFriendRequests, fetchFriends, handleSearch, handleSendFriendRequest, handleAcceptFriendRequest, handleRejectFriendRequest } =
    useFriendActions({
      session, userProfile, setFriendRequests, setFriends,
      setSearchResults, setSearchQuery, setIsSearching, showToast,
    });

  const { fetchFollowings, fetchFollowers, handleFollow, isFollowing } = useFollowActions({
    session, followings, setFollowings, setFollowers, showToast,
  });

  const {
    handleCheck, handleDecision, handleTeamVote,
    handleDelete, confirmDelete, checkAndUpdateStreaks,
    handleAddTask, handleJoinTeam, handleStartTeam, handleKickMember,
  } = useHabitActions({
      session, userProfile, tasks, completedTasks,
      taskName, taskDays, taskType, joinCode, activities,
      setTasks, setCompletedTasks, setActivities,
      setConfirmDeleteId, confirmDeleteId,
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

    return () => {
      supabase.removeChannel(friendChannel);
      supabase.removeChannel(habitChannel);
    };
  }, [session?.user?.id, fetchFriendRequests, fetchFriends]);

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
      <div className="flex-grow">
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
              handleCheck={handleCheck} handleDelete={handleDelete}
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
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={confirmDelete}
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
            onDecision={(choice, customDays) => handleDecision(decisionHabit, choice, customDays)}
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
