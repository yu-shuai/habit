import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface UseFollowActionsParams {
  session: any;
  followings: string[];
  setFollowings: (updater: (prev: string[]) => string[]) => void;
  setFollowers: (followers: any[]) => void;
  showToast: (message: string) => void;
  createNotification?: (targetUserId: string, type: any) => Promise<void>;
}

export const useFollowActions = ({
  session,
  followings,
  setFollowings,
  setFollowers,
  showToast,
  createNotification,
}: UseFollowActionsParams) => {
  /** Fetch all users the current user follows */
  const fetchFollowings = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', session.user.id);

    if (data) {
      setFollowings(() => data.map((d: any) => d.following_id));
    }
  }, [session, setFollowings]);

  /** Fetch all users following the current user */
  const fetchFollowers = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', session.user.id);

    if (data) {
      const followerIds = data.map((d: any) => d.follower_id);
      if (followerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', followerIds);
        if (profiles) setFollowers(profiles);
      } else {
        setFollowers([]);
      }
    }
  }, [session, setFollowers]);

  /** Check if the current user is following a given user */
  const isFollowing = useCallback(
    (userId: string) => followings.includes(userId),
    [followings]
  );

  /** Toggle follow / unfollow */
  const handleFollow = useCallback(
    async (userId: string) => {
      if (!session?.user?.id) return;
      if (followings.includes(userId)) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);
        setFollowings(prev => prev.filter(id => id !== userId));
        showToast('已取消关注');
      } else {
        // Follow
        await supabase.from('follows').insert({
          follower_id: session.user.id,
          following_id: userId,
        });
        setFollowings(prev => [...prev, userId]);
        showToast('已关注');
        createNotification?.(userId, 'follow');
      }
    },
    [session, followings, setFollowings, showToast, createNotification]
  );

  return { fetchFollowings, fetchFollowers, handleFollow, isFollowing };
};
