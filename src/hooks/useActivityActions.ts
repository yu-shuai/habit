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
  uploadPostImage?: (userId: string, file: File | Blob) => Promise<string | null>;
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
  uploadPostImage,
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

      // Optimistic: compute new likedBy from local state for instant UI feedback
      let optimisticLikedBy;
      if (alreadyLiked) {
        optimisticLikedBy = post.likedBy.filter(
          l => !(l.userId === session.user.id && l.scope === currentScope)
        );
      } else {
        optimisticLikedBy = [
          ...post.likedBy,
          { name: userProfile.name, userId: session.user.id, scope: currentScope },
        ];
      }

      const previousLikedBy = post.likedBy;
      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, likedBy: optimisticLikedBy } : a))
      );

      // Fetch latest from DB to avoid overwriting other users' concurrent likes
      const { data: latest } = await supabase
        .from('activities')
        .select('liked_by')
        .eq('id', postId)
        .single();

      const dbLikedBy: any[] = latest?.liked_by || [];
      let newLikedBy;
      if (alreadyLiked) {
        newLikedBy = dbLikedBy.filter(
          (l: any) => !(l.userId === session.user.id && l.scope === currentScope)
        );
      } else {
        // Remove any existing entry first (in case of duplicates), then add
        newLikedBy = [
          ...dbLikedBy.filter(
            (l: any) => !(l.userId === session.user.id && l.scope === currentScope)
          ),
          { name: userProfile.name, userId: session.user.id, scope: currentScope },
        ];
      }

      const { error } = await supabase
        .from('activities')
        .update({ liked_by: newLikedBy })
        .eq('id', postId);

      if (error) {
        console.error('handleLike failed:', error.message);
        // Rollback optimistic update
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, likedBy: previousLikedBy } : a))
        );
        showToast('点赞失败，请重试');
      } else {
        // Sync local state with what was actually written
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, likedBy: newLikedBy } : a))
        );
      }
    },
    [session, userProfile, activities, setActivities, showToast]
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
      const previousComments = post.comments;
      const optimisticComments = [...post.comments, newComment];

      // Optimistic update
      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, comments: optimisticComments } : a))
      );

      // Fetch latest comments from DB to avoid overwriting other users' concurrent comments
      const { data: latest } = await supabase
        .from('activities')
        .select('comments')
        .eq('id', postId)
        .single();

      const dbComments: any[] = latest?.comments || [];
      const mergedComments = [...dbComments, newComment];

      const { error } = await supabase
        .from('activities')
        .update({ comments: mergedComments })
        .eq('id', postId);

      if (error) {
        console.error('handleAddComment failed:', error.message);
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, comments: previousComments } : a))
        );
        showToast('评论失败，请重试');
      } else {
        // Sync local with actual DB state
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, comments: mergedComments } : a))
        );
      }
    },
    [session, userProfile, activities, setActivities, showToast]
  );

  /** Delete a comment */
  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      const previousComments = post.comments;
      const optimisticComments = post.comments.filter(c => c.id !== commentId);

      setActivities(prev =>
        prev.map(a => (a.id === postId ? { ...a, comments: optimisticComments } : a))
      );

      // Fetch latest from DB, then remove the target comment
      const { data: latest } = await supabase
        .from('activities')
        .select('comments')
        .eq('id', postId)
        .single();

      const dbComments: any[] = latest?.comments || [];
      const newComments = dbComments.filter((c: any) => c.id !== commentId);

      const { error } = await supabase
        .from('activities')
        .update({ comments: newComments })
        .eq('id', postId);

      if (error) {
        console.error('handleDeleteComment failed:', error.message);
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, comments: previousComments } : a))
        );
        showToast('删除评论失败，请重试');
      } else {
        setActivities(prev =>
          prev.map(a => (a.id === postId ? { ...a, comments: newComments } : a))
        );
      }
    },
    [activities, setActivities, showToast]
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

  /** Publish a check-in post (or update an existing one) */
  const handlePublishCheckIn = useCallback(async () => {
    if (!checkInHabitId) { showToast('请选择打卡任务'); return; }
    const habit = tasks.find(t => t.id === checkInHabitId);
    if (!habit && !editingPostId) return;

    showToast('正在发布...');
    const todayStr = getTodayString();
    
    const deterministicId = editingPostId || `auto-${checkInHabitId}-${userProfile.id}-${todayStr}`;
    const existingPost = activities.find(a => a.id === deterministicId);

    const finalImages: string[] = [];
    for (const img of checkInImages) {
      if (img.startsWith('data:') && uploadPostImage && session?.user?.id) {
        try {
          const res = await fetch(img);
          const blob = await res.blob();
          const uploadedUrl = await uploadPostImage(session.user.id, blob);
          if (uploadedUrl) finalImages.push(uploadedUrl);
        } catch (err) {
          console.error('Image upload failed, skipping base64 image:', err);
        }
      } else if (!img.startsWith('data:')) {
        finalImages.push(img);
      }
    }

    let dayNumber = 1;
    if (editingPostId && existingPost) {
      // 编辑模式：保留原有的打卡天数，防止天数被意外更新
      const match = existingPost.tag.match(/第(\d+)天/);
      dayNumber = match ? parseInt(match[1]) : 1;
    } else if (habit) {
      // 新打卡：使用与 CheckInModal.tsx 一致的逻辑
      dayNumber = habit.isCompletedToday ? habit.currentProgress : habit.currentProgress + 1;
    } else if (existingPost?.tag) {
      const match = existingPost.tag.match(/第(\d+)天/);
      dayNumber = match ? parseInt(match[1]) : 1;
    }

    const post: Post = {
      id: deterministicId,
      habitId: checkInHabitId,
      user: { id: userProfile.id, name: userProfile.name, avatar: userProfile.avatar },
      images: finalImages,
      tag: habit ? `${habit.name} · 第${dayNumber}天` : (existingPost?.tag || ''),
      likedBy: existingPost?.likedBy || [],
      comments: existingPost?.comments || [],
      visibility: checkInVisibility,
      content: checkInContent || (habit ? `✅ 打卡完成！第 ${dayNumber} 天` : (existingPost?.content || '')),
      createdAt: existingPost?.createdAt || Date.now(),
    };

    const { error: dbError } = await supabase.from('activities').upsert({
      id: deterministicId,
      habit_id: checkInHabitId,
      user_id: userProfile.id,
      user: post.user,
      images: post.images,
      tag: post.tag,
      content: post.content,
      visibility: post.visibility,
      liked_by: post.likedBy,
      comments: post.comments,
      created_at: new Date(post.createdAt).toISOString()
    });

    if (dbError) {
      console.error('Publish check-in error:', dbError.message);
      showToast('发布失败，请检查网络');
      return;
    }

    if (!editingPostId) {
      handleCheck(checkInHabitId, true);
    }

    // 4. 更新本地 Store
    setActivities(prev => {
      const idx = prev.findIndex(a => a.id === deterministicId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = post;
        return next;
      }
      return [post, ...prev];
    });

    setIsCheckInOpen(false);
    setCheckInContent('');
    setCheckInHabitId('');
    setCheckInImages([]);
    setEditingPostId(null);
    showToast(editingPostId ? '已修改打卡内容' : existingPost ? '已更新今日打卡' : '打卡成功！');
  }, [
    session, userProfile, tasks, activities,
    checkInHabitId, checkInContent, checkInImages, checkInVisibility, editingPostId,
    setActivities, setIsCheckInOpen, setCheckInContent, setCheckInHabitId,
    setCheckInImages, setEditingPostId, handleCheck, showToast, uploadPostImage,
  ]);

  /** Edit a post - open CheckInDrawer with pre-filled data */
  const handleEditPost = useCallback(
    async (postId: string) => {
      if (!session?.user?.id) return;
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      if (post.user.id !== session.user.id) {
        showToast('只能修改自己的动态');
        return;
      }

      setEditingPostId(postId);
      setCheckInHabitId(post.habitId);
      setCheckInContent(post.content || '');
      setCheckInImages(post.images || []);
      setIsCheckInOpen(true);
    },
    [session, activities, setEditingPostId, setCheckInHabitId, setCheckInContent, setCheckInImages, setIsCheckInOpen, showToast]
  );

  /** Delete a post (#23) */
  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!session?.user?.id) return;
      const post = activities.find(a => a.id === postId);
      if (!post) return;
      // Only allow owner to delete
      if (post.user.id !== session.user.id) {
        showToast('只能删除自己的动态');
        return;
      }

      // Optimistic removal
      setActivities(prev => prev.filter(a => a.id !== postId));

      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', postId)
        .eq('user_id', session.user.id);

      if (error) {
        // Rollback
        setActivities(prev => [post, ...prev]);
        showToast('删除失败，请重试');
      } else {
        showToast('动态已删除');
      }
    },
    [session, activities, setActivities, showToast]
  );

  return {
    handleLike,
    handleAddComment,
    handleDeleteComment,
    handleChangeVisibility,
    handlePublishCheckIn,
    handleEditPost,
    handleDeletePost,
  };
};
