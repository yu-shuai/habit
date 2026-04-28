import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post, Visibility, InteractionScope, UserProfile } from '../types';
import { getTodayString } from '../utils/app';

interface UseActivityActionsParams {
  session: any;
  userProfile: UserProfile;
  tasks: any[];
  activities: Post[];
  checkInHabitId: string;
  checkInContent: string;
  checkInImages: string[];
  checkInVisibility: Visibility;
  editingPostId: string | null;
  setActivities: (updater: (prev: Post[]) => Post[]) => void;
  setIsCheckInOpen: (open: boolean) => void;
  setCheckInContent: (content: string) => void;
  setCheckInHabitId: (id: string) => void;
  setCheckInImages: (images: string[]) => void;
  setEditingPostId: (id: string | null) => void;
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  showToast: (message: string) => void;
}

export const useActivityActions = ({
  session,
  userProfile,
  tasks,
  activities,
  checkInHabitId,
  checkInContent,
  checkInImages,
  checkInVisibility,
  editingPostId,
  setActivities,
  setIsCheckInOpen,
  setCheckInContent,
  setCheckInHabitId,
  setCheckInImages,
  setEditingPostId,
  handleCheck,
  showToast,
}: UseActivityActionsParams) => {
  /** Like / unlike a post */
  const handleLike = useCallback(
    async (postId: string, scope?: InteractionScope) => {
      if (!session?.user?.id) return;
      const post = activities.find(a => a.id === postId);
      if (!post) return;

      const currentScope = scope || 'public';
      const alreadyLiked = post.likedBy.some(
        l => l.userId === session.user.id && l.scope === currentScope
      );

      let newLikedBy;
      if (alreadyLiked) {
        newLikedBy = post.likedBy.filter(
          l => !(l.userId === session.user.id && l.scope === currentScope)
        );
      } else {
        newLikedBy = [
          ...post.likedBy,
          { name: userProfile.name, userId: session.user.id, scope: currentScope },
        ];
      }

      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, likedBy: newLikedBy } : a))
      );

      await supabase
        .from('activities')
        .update({ liked_by: newLikedBy })
        .eq('id', postId);
    },
    [session, userProfile, activities, setActivities]
  );

  /** Add a comment */
  const handleAddComment = useCallback(
    async (postId: string, text: string, scope?: InteractionScope) => {
      if (!text.trim()) return;
      const newComment = {
        id: `c-${Date.now()}`,
        user: userProfile.name,
        userId: session?.user?.id,
        text: text.trim(),
        createdAt: Date.now(),
        scope: scope || 'public',
      };

      const post = activities.find(a => a.id === postId);
      if (!post) return;
      const newComments = [...post.comments, newComment];

      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, comments: newComments } : a))
      );

      await supabase
        .from('activities')
        .update({ comments: newComments })
        .eq('id', postId);
    },
    [session, userProfile, activities, setActivities]
  );

  /** Delete a comment */
  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      const newComments = post.comments.filter(c => c.id !== commentId);

      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, comments: newComments } : a))
      );

      await supabase
        .from('activities')
        .update({ comments: newComments })
        .eq('id', postId);
    },
    [activities, setActivities]
  );

  /** Change post visibility */
  const handleChangeVisibility = useCallback(
    async (postId: string, visibility: Visibility) => {
      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, visibility } : a))
      );
      await supabase
        .from('activities')
        .update({ visibility })
        .eq('id', postId);
      showToast('可见范围已修改');
    },
    [setActivities, showToast]
  );

  /** Publish a check-in post */
  const handlePublishCheckIn = useCallback(async () => {
    if (!checkInHabitId) { showToast('请选择打卡任务'); return; }
    const habit = tasks.find(t => t.id === checkInHabitId);
    if (!habit) return;

    const todayStr = getTodayString();
    const existingAutoPostId = `auto-${checkInHabitId}-${todayStr}`;
    const isAlreadyCheckedIn = habit.isCompletedToday;
    const dayNumber = habit ? (isAlreadyCheckedIn ? habit.currentProgress : (habit.currentProgress + 1)) : null;

    // Check if user already posted today (not editing mode)
    if (!editingPostId) {
      const todayPosts = activities.filter(a => {
        const postDate = new Date(a.createdAt).toISOString().split('T')[0];
        const isToday = postDate === todayStr;
        const isUserPost = a.user?.id === session?.user?.id;
        const isNotAutoPost = !a.id.startsWith('auto-');
        return isToday && isUserPost && isNotAutoPost;
      });
      if (todayPosts.length > 0) {
        showToast('今天已经发布过动态了');
        return;
      }
    }

    if (editingPostId) {
      const post: Post = {
        id: editingPostId,
        habitId: checkInHabitId,
        user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
        images: checkInImages,
        tag: habit ? `${habit.name}${dayNumber ? ` · 第${dayNumber}天` : ''}` : checkInContent.substring(0, 20),
        likedBy: activities.find(a => a.id === editingPostId)?.likedBy || [],
        comments: activities.find(a => a.id === editingPostId)?.comments || [],
        visibility: checkInVisibility,
        content: checkInContent || (dayNumber ? `✅ 打卡完成！第 ${dayNumber} 天` : '✅ 打卡完成！'),
        createdAt: activities.find(a => a.id === editingPostId)?.createdAt || Date.now(),
      };
      setActivities(prev => prev.map(a => (a.id === editingPostId ? post : a)));
      await supabase.from('activities').update({
        content: post.content,
        images: post.images,
        visibility: post.visibility,
        tag: post.tag,
      }).eq('id', editingPostId);
    } else if (isAlreadyCheckedIn) {
      const existingPost = activities.find(a => a.id === existingAutoPostId);
      const post: Post = {
        id: existingAutoPostId,
        habitId: checkInHabitId,
        user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
        images: checkInImages,
        tag: habit ? `${habit.name}${dayNumber ? ` · 第${dayNumber}天` : ''}` : checkInContent.substring(0, 20),
        likedBy: existingPost?.likedBy || [],
        comments: existingPost?.comments || [],
        visibility: checkInVisibility,
        content: checkInContent || (dayNumber ? `✅ 打卡完成！第 ${dayNumber} 天` : '✅ 打卡完成！'),
        createdAt: existingPost?.createdAt || Date.now(),
      };
      setActivities(prev => prev.map(a => (a.id === existingAutoPostId ? post : a)));
      await supabase.from('activities').update({
        content: post.content,
        images: post.images,
        visibility: post.visibility,
        tag: post.tag,
      }).eq('id', existingAutoPostId);
    } else {
      const postId = `post-${Date.now()}`;
      const post: Post = {
        id: postId,
        habitId: checkInHabitId,
        user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
        images: checkInImages,
        tag: habit ? `${habit.name}${dayNumber ? ` · 第${dayNumber}天` : ''}` : checkInContent.substring(0, 20),
        likedBy: [],
        comments: [],
        visibility: checkInVisibility,
        content: checkInContent || (dayNumber ? `✅ 打卡完成！第 ${dayNumber} 天` : '✅ 打卡完成！'),
        createdAt: Date.now(),
      };
      setActivities(prev => [post, ...prev]);
      await supabase.from('activities').insert({
        id: post.id,
        habit_id: post.habitId,
        user_id: session?.user?.id,
        user: post.user,
        images: post.images,
        tag: post.tag,
        content: post.content,
        visibility: post.visibility,
        liked_by: [],
        comments: [],
      });
      handleCheck(checkInHabitId, true);
    }

    setIsCheckInOpen(false);
    setCheckInContent('');
    setCheckInHabitId('');
    setCheckInImages([]);
    setEditingPostId(null);
    showToast(editingPostId ? '已更新' : isAlreadyCheckedIn ? '打卡内容已更新！' : '打卡成功！');
  }, [
    session, userProfile, tasks, activities,
    checkInHabitId, checkInContent, checkInImages, checkInVisibility, editingPostId,
    setActivities, setIsCheckInOpen, setCheckInContent, setCheckInHabitId,
    setCheckInImages, setEditingPostId, handleCheck, showToast,
  ]);

  return {
    handleLike,
    handleAddComment,
    handleDeleteComment,
    handleChangeVisibility,
    handlePublishCheckIn,
  };
};
