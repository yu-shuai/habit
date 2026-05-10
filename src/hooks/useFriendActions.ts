import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface UseFriendActionsParams {
  session: any;
  userProfile: UserProfile;
  setFriendRequests: (updater: (prev: any[]) => any[]) => void;
  setFriends: (updater: any[] | ((prev: any[]) => any[])) => void;
  setSearchResults: (results: any[]) => void;
  setSearchQuery: (query: string) => void;
  setIsSearching: (searching: boolean) => void;
  showToast: (message: string) => void;
  createNotification?: (targetUserId: string, type: any, postId?: string, commentId?: string, content?: string, postContentPreview?: string, postType?: string) => Promise<void>;
}

export const useFriendActions = ({
  session,
  userProfile,
  setFriendRequests,
  setFriends,
  setSearchResults,
  setSearchQuery,
  setIsSearching,
  showToast,
  createNotification,
}: UseFriendActionsParams) => {
  const fetchFriendRequests = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .eq('receiver_id', session.user.id)
      .eq('status', 'pending');

    if (data && data.length > 0) {
      // Batch query profiles instead of N+1 individual queries
      const requesterIds = [...new Set(data.map((r: any) => r.requester_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', requesterIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const requestsWithProfiles = data.map((r: any) => ({
        ...r,
        requester: profileMap.get(r.requester_id) || null,
      }));
      setFriendRequests(() => requestsWithProfiles);
    } else {
      setFriendRequests(() => []);
    }
  }, [session, setFriendRequests]);

  const fetchFriends = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`)
      .eq('status', 'accepted');

    if (data) {
      const friendIds = data.map((d: any) =>
        d.requester_id === session.user.id ? d.receiver_id : d.requester_id
      );
      const uniqueFriendIds = [...new Set(friendIds)];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueFriendIds);
      if (profiles) setFriends(profiles);
    }
  }, [session, setFriends]);

  /** Search by custom_id or name */
  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) { setSearchResults([]); return; }
      // Sanitize query: escape PostgREST special characters to prevent filter manipulation
      const sanitized = query.trim().replace(/[,.()\\/"'%_]/g, '');
      if (!sanitized) { setSearchResults([]); return; }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .or(`custom_id.ilike.%${sanitized}%,name.ilike.%${sanitized}%`)
        .limit(10);

      if (data) {
        setSearchResults(data.filter((p: any) => p.id !== session?.user?.id));
      }
    },
    [session, setSearchQuery, setSearchResults, setIsSearching]
  );

  const handleSendFriendRequest = useCallback(
    async (receiverId: string, message?: string) => {
      if (!session?.user?.id) return;
      const { data: existing } = await supabase
        .from('friendships')
        .select('id, status')
        .or(
          `and(requester_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${session.user.id})`
        )
        .maybeSingle();

      if (existing) {
        if (existing.status === 'pending') {
          showToast('已发送过申请');
          return;
        } else if (existing.status === 'accepted') {
          showToast('已经是好友');
          return;
        }
        
        // 如果状态是 rejected，则更新记录重新发起申请
        const { error } = await supabase
          .from('friendships')
          .update({
            requester_id: session.user.id,
            receiver_id: receiverId,
            status: 'pending',
            message: message?.trim() || null,
          })
          .eq('id', existing.id);
          
        if (error) showToast('发送失败，请重试');
        else showToast('好友申请发送成功');
        return;
      }

      const { error } = await supabase.from('friendships').insert({
        requester_id: session.user.id,
        receiver_id: receiverId,
        status: 'pending',
        message: message?.trim() || null,
      });
      if (error) showToast('发送失败，请重试');
      else {
        showToast('好友申请发送成功');
        createNotification?.(receiverId, 'friend_request', undefined, undefined, message);
      }
    },
    [session, showToast, createNotification]
  );

  const handleAcceptFriendRequest = useCallback(
    async (requestId: string) => {
      // 先获取请求信息，以便知道要通知谁
      const { data: request } = await supabase
        .from('friendships')
        .select('requester_id')
        .eq('id', requestId)
        .single();

      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        showToast('操作失败，请重试');
        return;
      }

      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      showToast('已同意好友请求');

      if (request?.requester_id) {
        createNotification?.(request.requester_id, 'friend_accept');
      }
    },
    [setFriendRequests, showToast, createNotification]
  );

  const handleRejectFriendRequest = useCallback(
    async (requestId: string) => {
      await supabase
        .from('friendships')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      showToast('已拒绝好友请求');
    },
    [setFriendRequests, showToast]
  );

  const handleDeleteFriend = useCallback(
    async (friendId: string) => {
      if (!session?.user?.id) return;
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${session.user.id},receiver_id.eq.${friendId}),and(requester_id.eq.${friendId},receiver_id.eq.${session.user.id})`);
      if (error) {
        showToast('删除好友失败');
      } else {
        setFriends((prev: any[]) => prev.filter((f: any) => f.id !== friendId));
        showToast('已删除好友');
      }
    },
    [session, setFriends, showToast]
  );

  return {
    fetchFriendRequests,
    fetchFriends,
    handleSearch,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleDeleteFriend,
  };
};
