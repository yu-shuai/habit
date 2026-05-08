import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Post, UserProfile } from '../types';

interface UseUserActionsParams {
  session: any;
  userProfile: UserProfile;
  setUserProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  setUserCheckInDays: (updater: (prev: number) => number) => void;
  setIsLogoutConfirmOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsPasswordModalOpen: (open: boolean) => void;
  setNewPassInput: (value: string) => void;
  newPassInput: string;
  showToast: (message: string) => void;
  setActivities?: (updater: (prev: Post[]) => Post[]) => void;
}

export const useUserActions = ({
  session,
  userProfile,
  setUserProfile,
  setUserCheckInDays,
  setIsLogoutConfirmOpen,
  setIsSettingsOpen,
  setIsPasswordModalOpen,
  setNewPassInput,
  newPassInput,
  showToast,
  setActivities,
}: UseUserActionsParams) => {
  /** Fetch current user profile */
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setUserProfile(() => ({
        id: data.id,
        customId: data.custom_id || '',
        name: data.name || '未命名用户',
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.id}`,
      }));
    } else {
      // Create profile if not exists
      const newProfile = {
        id: session.user.id,
        name: '未命名用户',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
      };
      await supabase.from('profiles').insert(newProfile);
      setUserProfile(() => ({
        ...newProfile,
        customId: '',
      }));
    }

    // Fetch total check-in days
    const { count } = await supabase
      .from('habit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);
    if (count !== null) setUserCheckInDays(() => count);
  }, [session, setUserProfile, setUserCheckInDays]);

  const updateProfile = useCallback(
    async (updates: Partial<{ name: string; avatar: string }>) => {
      if (!session?.user?.id) return;
      const dbUpdates: Record<string, string> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name.trim();
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
      if (Object.keys(dbUpdates).length === 0) return;
      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', session.user.id);
      if (error) { showToast('更新失败，请重试'); return; }
      setUserProfile(prev => ({ ...prev, ...updates }));
      // #7: Sync both name and avatar to existing activities
      if (setActivities && (updates.name !== undefined || updates.avatar !== undefined)) {
        setActivities(prev => prev.map(post =>
          post.user.id === session.user.id
            ? {
                ...post,
                user: {
                  ...post.user,
                  ...(updates.name !== undefined ? { name: updates.name } : {}),
                  ...(updates.avatar !== undefined ? { avatar: updates.avatar } : {}),
                },
              }
            : post
        ));
      }
    },
    [session, setUserProfile, setActivities, showToast]
  );

  /** Update custom ID */
  const updateProfileId = useCallback(
    async (customId: string) => {
      if (!session?.user?.id || !customId.trim()) return;
      const { error } = await supabase
        .from('profiles')
        .update({ custom_id: customId.trim() })
        .eq('id', session.user.id);
      if (error) {
        if (error.code === '23505') showToast('该ID已被使用');
        else showToast('更新失败');
        return;
      }
      setUserProfile(prev => ({ ...prev, customId: customId.trim() }));
      showToast('ID已更新');
    },
    [session, setUserProfile, showToast]
  );

  /** Logout */
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setIsLogoutConfirmOpen(false);
    setIsSettingsOpen(false);
    showToast('已退出登录');
  }, [setIsLogoutConfirmOpen, setIsSettingsOpen, showToast]);

  /** Delete account
   * NOTE (#2): This only deletes user data from public tables and signs out.
   * The auth.users record cannot be deleted from client-side code.
   * To fully remove the auth user, deploy a Supabase Edge Function that calls
   * supabase.auth.admin.deleteUser(userId). */
  const handleDeleteAccount = useCallback(async () => {
    if (!session?.user?.id) return;
    // Delete user data from all public tables
    await supabase.from('activities').delete().eq('user_id', session.user.id);
    await supabase.from('habits').delete().eq('user_id', session.user.id);
    await supabase.from('follows').delete().or(`follower_id.eq.${session.user.id},following_id.eq.${session.user.id}`);
    await supabase.from('friendships').delete().or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);
    await supabase.from('profiles').delete().eq('id', session.user.id);
    await supabase.auth.signOut();
    setIsSettingsOpen(false);
    showToast('账号已注销');
  }, [session, setIsSettingsOpen, showToast]);

  /** Change password */
  const handlePasswordSubmit = useCallback(async () => {
    if (newPassInput.length < 6) {
      showToast('密码长度至少为6位');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassInput });
    if (error) {
      showToast('修改失败：' + error.message);
    } else {
      showToast('密码已修改');
      setIsPasswordModalOpen(false);
      setNewPassInput('');
    }
  }, [newPassInput, setIsPasswordModalOpen, setNewPassInput, showToast]);

  return {
    fetchProfile,
    updateProfile,
    updateProfileId,
    handleLogout,
    handleDeleteAccount,
    handlePasswordSubmit,
  };
};
