import { AnimatePresence, motion } from 'motion/react';
import {
  Bell, ChevronRight, FileText, Flame, Headphones, Info, Lock,
  Palette, Shield, ShieldCheck, Smile, Trash2, LogOut,
} from 'lucide-react';
import SettingsItem from './SettingsItem';
import SettingsSubPages from './settings/SettingsSubPages';
import SettingsSheets from './settings/SettingsSheets';
import SettingsModals from './settings/SettingsModals';
import { APPEARANCE_OPTIONS, VISIBILITY_OPTIONS } from '../constants/app';

const BACKGROUND_PRESETS = [
  { name: '默认', color: '#ffffff' },
  { name: '薄雾', color: '#f8f9fa' },
  { name: '陶土', color: '#faf7f2' },
  { name: '宁静', color: '#f0f4f8' },
  { name: '森林', color: '#f1f5f0' },
  { name: '淡雅', color: '#fff9f9' },
  { name: '极简', color: '#f0f0f0' },
  { name: '复古', color: '#fdfcf0' },
  { name: '暗影', color: '#1a1a1a' },
] as const;

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  settingsCategory: 'root' | 'account' | 'general' | 'about' | 'background';
  setSettingsCategory: (category: 'root' | 'account' | 'general' | 'about' | 'background') => void;
  activeSubPage: 'account_security' | 'privacy' | 'feedback' | 'reminders' | null;
  setActiveSubPage: (page: 'account_security' | 'privacy' | 'feedback' | 'reminders' | null) => void;
  dailyReminder: boolean;
  setDailyReminder: (value: boolean) => void;
  reminderTimes: string[];
  setReminderTimes: (value: string[] | ((prev: string[]) => string[])) => void;
  appearance: 'system' | 'light' | 'dark';
  setAppearance: (value: 'system' | 'light' | 'dark') => void;
  cacheSize: string;
  setCacheSize: (value: string) => void;
  showToast: (message: string) => void;
  appBackground: string | null;
  setAppBackground: (value: string | null) => void;
  defaultVisibility: 'public' | 'friends' | 'private';
  setDefaultVisibility: (value: 'public' | 'friends' | 'private') => void;
  isLogoutConfirmOpen: boolean;
  setIsLogoutConfirmOpen: (value: boolean) => void;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (value: boolean) => void;
  newPassInput: string;
  setNewPassInput: (value: string) => void;
  onPasswordSubmit: () => Promise<void>;
  isTimePickerOpen: boolean;
  setIsTimePickerOpen: (value: boolean) => void;
  timePickerValue: string;
  setTimePickerValue: (value: string) => void;
  editingTimeIndex: number | null;
  setEditingTimeIndex: (value: number | null) => void;
  isAppearanceSheetOpen: boolean;
  setIsAppearanceSheetOpen: (value: boolean) => void;
  isVisibilitySheetOpen: boolean;
  setIsVisibilitySheetOpen: (value: boolean) => void;
  onLogout: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export default function SettingsOverlay({
  isOpen, onClose,
  settingsCategory, setSettingsCategory,
  activeSubPage, setActiveSubPage,
  dailyReminder, setDailyReminder,
  reminderTimes, setReminderTimes,
  appearance, setAppearance,
  cacheSize, setCacheSize,
  showToast, appBackground, setAppBackground,
  defaultVisibility, setDefaultVisibility,
  isLogoutConfirmOpen, setIsLogoutConfirmOpen,
  isPasswordModalOpen, setIsPasswordModalOpen,
  newPassInput, setNewPassInput, onPasswordSubmit,
  isTimePickerOpen, setIsTimePickerOpen,
  timePickerValue, setTimePickerValue,
  editingTimeIndex, setEditingTimeIndex,
  isAppearanceSheetOpen, setIsAppearanceSheetOpen,
  isVisibilitySheetOpen, setIsVisibilitySheetOpen,
  onLogout, onDeleteAccount,
}: SettingsOverlayProps) {
  const settingsTitle =
    settingsCategory === 'root' ? '设置'
      : settingsCategory === 'background' ? '背景设置'
        : settingsCategory === 'account' ? '账号安全'
          : settingsCategory === 'general' ? '通用设置'
            : '关于';

  const saveReminderTime = () => {
    if (editingTimeIndex !== null) {
      const newTimes = [...reminderTimes];
      newTimes[editingTimeIndex] = timePickerValue;
      setReminderTimes(newTimes);
      showToast('时间已更新');
    } else {
      setReminderTimes(prev => [...prev, timePickerValue].sort());
      showToast('提醒已添加');
    }
    setIsTimePickerOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[204] p-0 flex flex-col overflow-hidden"
          >
            <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
              <button
                onClick={() => { if (settingsCategory === 'root') onClose(); else setSettingsCategory('root'); }}
                className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900"
              >
                <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">
                {settingsTitle}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-12">
              {settingsCategory === 'root' && (
                <div className="px-6 py-8 flex flex-col gap-10">
                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">账号</h3>
                    <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm flex flex-col gap-2">
                      <SettingsItem icon={<Shield size={20} />} label="账号与安全" onClick={() => setActiveSubPage('account_security')} />
                      <SettingsItem icon={<Lock size={20} />} label="隐私设置" onClick={() => setActiveSubPage('privacy')} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">通知与提醒</h3>
                    <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm">
                      <SettingsItem
                        icon={<Bell size={20} />}
                        label="打卡提醒设置"
                        value={dailyReminder ? `${reminderTimes.length} 个提醒` : '已关闭'}
                        onClick={() => setActiveSubPage('reminders')}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">通用</h3>
                    <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm flex flex-col gap-2">
                      <SettingsItem
                        icon={<Palette size={20} />}
                        label="外观设置"
                        value={appearance === 'system' ? '跟随系统' : appearance === 'light' ? '浅色模式' : '深色模式'}
                        onClick={() => setIsAppearanceSheetOpen(true)}
                      />
                      <SettingsItem
                        icon={<Trash2 size={20} />}
                        label="清除缓存"
                        value={cacheSize}
                        onClick={() => { localStorage.clear(); setCacheSize('0 B'); showToast('缓存已清理'); }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">支持与反馈</h3>
                    <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm flex flex-col gap-2">
                      <SettingsItem icon={<Headphones size={20} />} label="意见反馈" onClick={() => setActiveSubPage('feedback')} />
                      <SettingsItem icon={<Smile size={20} />} label="加入官方社群" />
                      <SettingsItem icon={<Info size={20} />} label="关于 Habit" onClick={() => setSettingsCategory('about')} />
                    </div>
                  </div>

                  <div className="pb-24">
                    <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm">
                      <SettingsItem 
                        icon={<LogOut size={20} />} 
                        label="退出登录" 
                        danger 
                        onClick={() => setIsLogoutConfirmOpen(true)} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {settingsCategory === 'background' && (
                <div className="px-8 py-10 flex flex-col gap-10">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">背景预设</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {BACKGROUND_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => setAppBackground(preset.color === '#ffffff' ? null : preset.color)}
                          className={`flex flex-col gap-3 p-4 rounded-[2rem] border-2 transition-all active:scale-95 ${(appBackground === preset.color || (preset.color === '#ffffff' && !appBackground)) ? 'border-neutral-900 bg-white shadow-xl' : 'border-neutral-100 bg-white hover:border-neutral-200'}`}
                        >
                          <div className="w-full aspect-square rounded-2xl border border-neutral-100 shadow-inner" style={{ backgroundColor: preset.color }} />
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-neutral-50 p-6 rounded-[2rem] border border-neutral-100 mt-4">
                    <p className="text-[10px] font-bold text-neutral-400 leading-relaxed italic">
                      提示: 选择纯色背景可以让界面更简洁，阅读体验更专注。深色背景下文字将自动适配。
                    </p>
                  </div>
                </div>
              )}

              {settingsCategory === 'about' && (
                <div className="px-6 py-8 flex flex-col gap-10">
                  <div className="flex flex-col items-center gap-4 py-10">
                    <div className="w-20 h-20 bg-black rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                      <Flame size={40} className="text-white fill-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter">Habit</h3>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] mt-1">Version 1.0.4 (Build 2026)</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                    <SettingsItem icon={<FileText size={20} />} label="用户协议" />
                    <SettingsItem icon={<ShieldCheck size={20} />} label="隐私政策" />
                    <SettingsItem icon={<Info size={20} />} label="官方网站" isLast />
                  </div>
                  <p className="text-center text-[10px] font-medium text-neutral-300 px-10 leading-relaxed">
                    © 2026 Habit Studio. All rights reserved. <br />致力于让自律成为一种生活方式。
                  </p>
                </div>
              )}

              {settingsCategory !== 'root' && settingsCategory !== 'background' && settingsCategory !== 'about' && (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-6">
                  <div className="w-20 h-20 bg-neutral-100 rounded-[2.5rem] flex items-center justify-center text-neutral-300">
                    <Info size={40} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-headline font-black italic uppercase tracking-tighter">功能暂未开放</h3>
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">工程师正在玩命开发中...</p>
                  </div>
                  <button onClick={() => setSettingsCategory('root')}
                    className="mt-4 px-8 py-3 bg-black text-white rounded-full font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
                    返回设置
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsSubPages
        activeSubPage={activeSubPage}
        setActiveSubPage={setActiveSubPage}
        defaultVisibility={defaultVisibility}
        setIsVisibilitySheetOpen={setIsVisibilitySheetOpen}
        setIsPasswordModalOpen={setIsPasswordModalOpen}
        onDeleteAccount={onDeleteAccount}
        dailyReminder={dailyReminder}
        setDailyReminder={setDailyReminder}
        reminderTimes={reminderTimes}
        setReminderTimes={setReminderTimes}
        setEditingTimeIndex={setEditingTimeIndex}
        setTimePickerValue={setTimePickerValue}
        setIsTimePickerOpen={setIsTimePickerOpen}
        showToast={showToast}
      />

      <SettingsSheets
        isAppearanceSheetOpen={isAppearanceSheetOpen}
        setIsAppearanceSheetOpen={setIsAppearanceSheetOpen}
        appearance={appearance}
        setAppearance={setAppearance}
        isVisibilitySheetOpen={isVisibilitySheetOpen}
        setIsVisibilitySheetOpen={setIsVisibilitySheetOpen}
        defaultVisibility={defaultVisibility}
        setDefaultVisibility={setDefaultVisibility}
      />

      <SettingsModals
        isLogoutConfirmOpen={isLogoutConfirmOpen}
        setIsLogoutConfirmOpen={setIsLogoutConfirmOpen}
        onLogout={onLogout}
        isPasswordModalOpen={isPasswordModalOpen}
        setIsPasswordModalOpen={setIsPasswordModalOpen}
        newPassInput={newPassInput}
        setNewPassInput={setNewPassInput}
        onPasswordSubmit={onPasswordSubmit}
        isTimePickerOpen={isTimePickerOpen}
        setIsTimePickerOpen={setIsTimePickerOpen}
        timePickerValue={timePickerValue}
        setTimePickerValue={setTimePickerValue}
        editingTimeIndex={editingTimeIndex}
        onSaveReminderTime={saveReminderTime}
      />
    </>
  );
}
