import { motion, AnimatePresence } from 'motion/react';
import { SetStateAction } from 'react';
import {
  ChevronRight,
  Shield,
  Lock,
  Bell,
  Palette,
  Trash2,
  Headphones,
  Smile,
  Info,
  FileText,
  ShieldCheck,
  Mail,
  Clock,
  Check,
  X,
  Flame
} from 'lucide-react';
import SettingsItem from './SettingsItem';
import { Visibility } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settingsCategory: 'root' | 'account' | 'general' | 'about' | 'background';
  setSettingsCategory: (category: 'root' | 'account' | 'general' | 'about' | 'background') => void;
  appearance: 'system' | 'light' | 'dark';
  setAppearance: (appearance: 'system' | 'light' | 'dark') => void;
  appBackground: string | null;
  setAppBackground: (color: string | null) => void;
  cacheSize: string;
  setCacheSize: (size: string) => void;
  dailyReminder: boolean;
  setDailyReminder: (value: boolean) => void;
  reminderTimes: string[];
  setReminderTimes: (times: SetStateAction<string[]>) => void;
  defaultVisibility: Visibility;
  showToast: (message: string) => void;
  onLogout: () => void;
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  settingsCategory,
  setSettingsCategory,
  appearance,
  setAppearance,
  appBackground,
  setAppBackground,
  cacheSize,
  setCacheSize,
  dailyReminder,
  setDailyReminder,
  reminderTimes,
  setReminderTimes,
  defaultVisibility,
  showToast,
  onLogout
}: SettingsPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[204] p-0 flex flex-col overflow-hidden"
          >
            <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
              <button
                onClick={() => {
                  if (settingsCategory === 'root') onClose();
                  else setSettingsCategory('root');
                }}
                className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900"
              >
                <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
              </button>
              <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">
                {settingsCategory === 'root' ? '设置' :
                  settingsCategory === 'background' ? '背景设置' :
                    settingsCategory === 'account' ? '账号安全' :
                      settingsCategory === 'general' ? '通用设置' : '关于'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pb-12">
              {settingsCategory === 'root' ? (
                <div className="px-6 py-8 flex flex-col gap-10">
                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">账号</h3>
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                      <SettingsItem icon={<Shield size={20} />} label="账号与安全" onClick={() => setSettingsCategory('account')} />
                      <SettingsItem icon={<Lock size={20} />} label="隐私设置" isLast onClick={() => setSettingsCategory('general')} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">通知与提醒</h3>
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                      <SettingsItem
                        icon={<Bell size={20} />}
                        label="打卡提醒设置"
                        statusText={dailyReminder ? `${reminderTimes.length} 个提醒` : '已关闭'}
                        onClick={() => setSettingsCategory('general')}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">通用</h3>
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                      <SettingsItem
                        icon={<Palette size={20} />}
                        label="外观设置"
                        statusText={appearance === 'system' ? '跟随系统' : appearance === 'light' ? '浅色模式' : '深色模式'}
                        onClick={() => setSettingsCategory('general')}
                      />
                      <SettingsItem
                        icon={<Trash2 size={20} />}
                        label="清除缓存"
                        statusText={cacheSize}
                        showArrow={false}
                        onClick={() => {
                          localStorage.clear();
                          setCacheSize('0 B');
                          showToast('缓存已清理');
                        }}
                        isLast
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="px-2 text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">支持与反馈</h3>
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                      <SettingsItem icon={<Headphones size={20} />} label="意见反馈" />
                      <SettingsItem icon={<Smile size={20} />} label="加入官方社群" />
                      <SettingsItem icon={<Info size={20} />} label="关于 Habit" isLast onClick={() => setSettingsCategory('about')} />
                    </div>
                  </div>

                  <div className="pb-24">
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm">
                      <SettingsItem
                        label="退出登录"
                        isCentered
                        isDanger
                        isLast
                        onClick={onLogout}
                      />
                    </div>
                  </div>
                </div>
              ) : settingsCategory === 'background' ? (
                <div className="px-8 py-10 flex flex-col gap-10">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">背景预设</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: '默认', color: '#ffffff' },
                        { name: '薄雾', color: '#f8f9fa' },
                        { name: '陶土', color: '#faf7f2' },
                        { name: '宁静', color: '#f0f4f8' },
                        { name: '森林', color: '#f1f5f0' },
                        { name: '淡雅', color: '#fff9f9' },
                        { name: '极简', color: '#f0f0f0' },
                        { name: '复古', color: '#fdfcf0' },
                        { name: '暗影', color: '#1a1a1a' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setAppBackground(preset.color === '#ffffff' ? null : preset.color)}
                          className={`
                            flex flex-col gap-3 p-4 rounded-[2rem] border-2 transition-all active:scale-95
                            ${(appBackground === preset.color || (preset.color === '#ffffff' && !appBackground)) ? 'border-neutral-900 bg-white shadow-xl' : 'border-neutral-100 bg-white hover:border-neutral-200'}
                          `}
                        >
                          <div
                            className="w-full aspect-square rounded-2xl border border-neutral-100 shadow-inner"
                            style={{ backgroundColor: preset.color }}
                          />
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
              ) : settingsCategory === 'about' ? (
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
                    © 2026 Habit Studio. All rights reserved. <br />
                    致力于让自律成为一种生活方式。
                  </p>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center gap-6">
                  <div className="w-20 h-20 bg-neutral-100 rounded-[2.5rem] flex items-center justify-center text-neutral-300">
                    <Info size={40} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-headline font-black italic uppercase tracking-tighter">功能暂未开放</h3>
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">工程师正在玩命开发中...</p>
                  </div>
                  <button
                    onClick={() => setSettingsCategory('root')}
                    className="mt-4 px-8 py-3 bg-black text-white rounded-full font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    返回设置
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface AccountSecurityProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPasswordModal: () => void;
  onDeleteAccount: () => void;
}

export const AccountSecurity = ({ isOpen, onClose, onOpenPasswordModal, onDeleteAccount }: AccountSecurityProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
        >
          <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
            <button onClick={onClose} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
              <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
            </button>
            <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">账号与安全</h2>
          </div>
          <div className="px-6 py-8 flex flex-col gap-10">
            <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
              <SettingsItem
                label="修改密码"
                onClick={onOpenPasswordModal}
                isLast
              />
            </div>
            <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm">
              <SettingsItem
                label="注销账号"
                isCentered
                isDanger
                isLast
                onClick={onDeleteAccount}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackPanel = ({ isOpen, onClose }: FeedbackPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
        >
          <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
            <button onClick={onClose} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
              <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
            </button>
            <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">意见反馈</h2>
          </div>
          <div className="px-8 py-10 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">联系邮箱</h3>
              <div className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">QQ 邮箱</span>
                    <span className="text-sm font-bold">3232896860@qq.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Gmail</span>
                    <span className="text-sm font-bold">syu52942@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white">
              <h4 className="text-lg font-headline font-black italic uppercase tracking-tighter mb-2">感谢反馈</h4>
              <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
                您的每一条建议都是我前进的动力。
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface RemindersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  dailyReminder: boolean;
  setDailyReminder: (value: boolean) => void;
  reminderTimes: string[];
  setReminderTimes: (times: SetStateAction<string[]>) => void;
  setEditingTimeIndex: (index: number | null) => void;
  setTimePickerValue: (value: string) => void;
  setIsTimePickerOpen: (value: boolean) => void;
  showToast: (message: string) => void;
}

export const RemindersPanel = ({
  isOpen,
  onClose,
  dailyReminder,
  setDailyReminder,
  reminderTimes,
  setReminderTimes,
  setEditingTimeIndex,
  setTimePickerValue,
  setIsTimePickerOpen,
  showToast
}: RemindersPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
        >
          <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
            <button onClick={onClose} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
              <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
            </button>
            <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">通知与提醒</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
            <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm">
              <SettingsItem
                icon={<Bell size={20} />}
                label="每日打卡提醒"
                showArrow={false}
                showToggle={true}
                isToggled={dailyReminder}
                onToggle={setDailyReminder}
                isLast
              />
            </div>

            {dailyReminder && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-baseline px-2">
                  <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic">提醒时间列表</h3>
                  <span className="text-[10px] font-bold text-neutral-300">{reminderTimes.length}/5</span>
                </div>
                <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
                  {reminderTimes.map((time, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-5 hover:bg-neutral-50 transition-colors cursor-pointer group"
                      onClick={() => {
                        setEditingTimeIndex(index);
                        setTimePickerValue(time);
                        setIsTimePickerOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-neutral-900 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                        <span className="font-sans font-bold text-[14px] text-neutral-800">{time}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        {reminderTimes.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReminderTimes(prev => prev.filter((_, i) => i !== index));
                              showToast('已删除提醒');
                            }}
                            className="text-red-400 p-1 hover:scale-110 transition-transform"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {reminderTimes.length < 5 && (
                  <button
                    onClick={() => {
                      setEditingTimeIndex(null);
                      setTimePickerValue('08:00');
                      setIsTimePickerOpen(true);
                    }}
                    className="w-full py-5 bg-neutral-900 text-white rounded-[2rem] font-headline font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-transform mt-2"
                  >
                    添加提醒时间
                  </button>
                )}
              </div>
            )}

            <div className="bg-neutral-100 p-8 rounded-[2.5rem]">
              <p className="text-[10px] font-medium text-neutral-400 leading-relaxed uppercase tracking-widest text-center">
                开启提醒后，我们将在设定的时间点为您推送打卡通知。为了确保收到通知，请在系统设置中允许 Habit 发送通知。
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PrivacyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVisibility: Visibility;
  onOpenVisibilitySheet: () => void;
}

export const PrivacyPanel = ({ isOpen, onClose, defaultVisibility, onOpenVisibilitySheet }: PrivacyPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden"
        >
          <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
            <button onClick={onClose} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
              <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
            </button>
            <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">隐私设置</h2>
          </div>
          <div className="px-6 py-8 flex flex-col gap-10">
            <div className="bg-white rounded-[2rem] overflow-hidden border border-neutral-100 shadow-sm divide-y divide-neutral-50">
              <SettingsItem
                label="个人主页可见范围"
                statusText={defaultVisibility === 'public' ? '公开' : defaultVisibility === 'friends' ? '仅朋友' : '私密'}
                onClick={onOpenVisibilitySheet}
                isLast
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPassInput: string;
  setNewPassInput: (value: string) => void;
  onSubmit: () => void;
  showToast: (message: string) => void;
}

export const PasswordModal = ({ isOpen, onClose, newPassInput, setNewPassInput, onSubmit, showToast }: PasswordModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center mb-8 text-neutral-900">
              <Lock size={28} />
            </div>
            <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">修改登录密码</h3>
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
              请输入新的登录密码，长度至少为 6 位。
            </p>
            <div className="flex flex-col gap-6">
              <div className="relative">
                <input
                  autoFocus
                  type="password"
                  placeholder="输入新密码"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={onSubmit}
                  className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                >
                  确认修改
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeValue: string;
  setTimeValue: (value: string) => void;
  onConfirm: () => void;
}

export const TimePickerModal = ({ isOpen, onClose, timeValue, setTimeValue, onConfirm }: TimePickerModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow text-center"
          >
            <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-neutral-900">
              <Clock size={28} />
            </div>
            <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">
              添加提醒时间
            </h3>
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
              请选择您希望接收打卡提醒的时间。
            </p>
            <div className="flex flex-col gap-8">
              <div className="flex justify-center items-center gap-4">
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  className="bg-neutral-100 px-8 py-6 rounded-3xl text-3xl font-headline font-black italic border-none focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                >
                  确认
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                >
                  取消
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface AppearanceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  appearance: 'system' | 'light' | 'dark';
  setAppearance: (appearance: 'system' | 'light' | 'dark') => void;
}

export const AppearanceSheet = ({ isOpen, onClose, appearance, setAppearance }: AppearanceSheetProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[210] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative bg-white w-full max-w-lg rounded-t-[3rem] p-8 pb-12 editorial-shadow"
          >
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-8" />
            <h3 className="font-headline font-black text-xl text-center mb-8 italic uppercase tracking-tighter">外观设置</h3>
            <div className="flex flex-col gap-2">
              {[
                { id: 'system', label: '跟随系统' },
                { id: 'light', label: '浅色模式' },
                { id: 'dark', label: '深色模式' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setAppearance(option.id as any);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-sans font-bold text-[14px] text-neutral-800 tracking-tight">{option.label}</span>
                  {appearance === option.id && <Check size={20} className="text-black" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface VisibilitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  defaultVisibility: Visibility;
  setDefaultVisibility: (visibility: Visibility) => void;
}

export const VisibilitySheet = ({ isOpen, onClose, defaultVisibility, setDefaultVisibility }: VisibilitySheetProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[210] flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative bg-white w-full max-w-lg rounded-t-[3rem] p-8 pb-12 editorial-shadow"
          >
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-8" />
            <h3 className="font-headline font-black text-xl text-center mb-8 italic uppercase tracking-tighter">可见范围</h3>
            <div className="flex flex-col gap-2">
              {[
                { id: 'public', label: '公开' },
                { id: 'friends', label: '仅朋友' },
                { id: 'private', label: '仅自己' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setDefaultVisibility(option.id as Visibility);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-6 py-5 rounded-2xl hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-sans font-bold text-[14px] text-neutral-800 tracking-tight">{option.label}</span>
                  {defaultVisibility === option.id && <Check size={20} className="text-black" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface MedalModalProps {
  isOpen: boolean;
  medal: { days: number; taskName: string } | null;
  onClose: () => void;
}

export const MedalModal = ({ isOpen, medal, onClose }: MedalModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && medal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 editorial-shadow text-center flex flex-col items-center gap-6"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center relative shadow-xl ${
              medal.days <= 30 ? 'bg-amber-100 text-amber-500' :
                medal.days <= 180 ? 'bg-emerald-100 text-emerald-500' :
                  'bg-blue-100 text-blue-500'
            }`}>
              {medal.days <= 30 ? <Flame size={48} fill="currentColor" /> :
                medal.days <= 180 ? <ShieldCheck size={48} fill="currentColor" /> :
                  <Check size={48} fill="currentColor" />}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter">已解锁 {medal.days} 天勋章</h3>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-relaxed px-4">
                恭喜你在任务 <span className="text-neutral-900">"{medal.taskName}"</span> 中坚持不懈，获得了这枚珍贵的勋章。
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-black text-white rounded-2xl font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
            >
              太棒了
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMood: string;
  setCurrentMood: (mood: string) => void;
}

export const MoodModal = ({ isOpen, onClose, currentMood, setCurrentMood }: MoodModalProps) => {
  const emojis = ['🤪', '😆', '🥰', '😎', '🥳', '💪', '👍', '🧐', '😴', '🥱', '😫', '😭', '🤒', '😷', '💔', '😒', '🤯', '🤡', '💩', '👻', '🎸', '📖', '🏀', '⚽', '🌛', '🧡', '👀', '🦥', '😤', '😬', '🌹', '☕', '😊'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 editorial-shadow"
          >
            <h3 className="font-headline font-black text-xl text-center mb-8">今日心情</h3>
            <div className="grid grid-cols-4 gap-4">
              {emojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setCurrentMood(emoji);
                    onClose();
                  }}
                  className={`
                    text-3xl p-3 rounded-2xl transition-all aspect-square flex items-center justify-center
                    ${currentMood === emoji
                      ? 'shadow-[0_10px_30px_rgba(0,0,0,0.15)] ring-2 ring-neutral-900 ring-offset-4 scale-110 z-10'
                      : 'hover:bg-neutral-50'}
                  `}
                  animate={currentMood === emoji ? {
                    y: [0, -4, 0],
                  } : {}}
                  transition={{
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-10 w-full py-4 bg-neutral-100 text-neutral-900 font-bold rounded-2xl"
            >
              关闭
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default {
  SettingsPanel,
  AccountSecurity,
  FeedbackPanel,
  RemindersPanel,
  PrivacyPanel,
  PasswordModal,
  TimePickerModal,
  AppearanceSheet,
  VisibilitySheet,
  MedalModal,
  MoodModal
};