import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Bell, Clock, Mail, Trash2, KeyRound, UserX, Eye } from 'lucide-react';
import SettingsItem from '../SettingsItem';

interface SettingsSubPagesProps {
  activeSubPage: 'account_security' | 'privacy' | 'feedback' | 'reminders' | null;
  setActiveSubPage: (page: 'account_security' | 'privacy' | 'feedback' | 'reminders' | null) => void;
  defaultVisibility: 'public' | 'friends' | 'private';
  setIsVisibilitySheetOpen: (open: boolean) => void;
  setIsPasswordModalOpen: (open: boolean) => void;
  onDeleteAccount: () => Promise<void>;
  dailyReminder: boolean;
  setDailyReminder: (value: boolean) => void;
  reminderTimes: string[];
  setReminderTimes: (value: string[] | ((prev: string[]) => string[])) => void;
  setEditingTimeIndex: (index: number | null) => void;
  setTimePickerValue: (value: string) => void;
  setIsTimePickerOpen: (open: boolean) => void;
  showToast: (message: string) => void;
}

const slideProps = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: { type: 'spring' as const, damping: 25, stiffness: 200 },
  className: 'fixed inset-0 max-w-lg mx-auto bg-neutral-50 z-[205] p-0 flex flex-col overflow-hidden',
};

export default function SettingsSubPages({
  activeSubPage,
  setActiveSubPage,
  defaultVisibility,
  setIsVisibilitySheetOpen,
  setIsPasswordModalOpen,
  onDeleteAccount,
  dailyReminder,
  setDailyReminder,
  reminderTimes,
  setReminderTimes,
  setEditingTimeIndex,
  setTimePickerValue,
  setIsTimePickerOpen,
  showToast,
}: SettingsSubPagesProps) {
  const headerBack = (label: string) => (
    <div className="bg-white px-8 pt-12 pb-6 flex items-center justify-center relative border-b border-neutral-100">
      <button onClick={() => setActiveSubPage(null)} className="absolute left-6 top-12 p-2 -mt-1 text-neutral-900">
        <ChevronRight className="rotate-180" size={24} strokeWidth={2.5} />
      </button>
      <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter text-neutral-900">{label}</h2>
    </div>
  );

  return (
    <>
      {/* Account security */}
      <AnimatePresence>
        {activeSubPage === 'account_security' && (
          <motion.div {...slideProps}>
            {headerBack('账号与安全')}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm flex flex-col gap-2">
                <SettingsItem 
                  icon={<KeyRound size={20} />} 
                  label="修改密码" 
                  onClick={() => setIsPasswordModalOpen(true)} 
                />
              </div>
              <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm">
                <SettingsItem 
                  icon={<UserX size={20} />} 
                  label="注销账号" 
                  danger 
                  onClick={onDeleteAccount} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy */}
      <AnimatePresence>
        {activeSubPage === 'privacy' && (
          <motion.div {...slideProps}>
            {headerBack('隐私设置')}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm">
                <SettingsItem
                  icon={<Eye size={20} />}
                  label="个人主页可见范围"
                  value={defaultVisibility === 'public' ? '公开' : defaultVisibility === 'friends' ? '仅朋友' : '私密'}
                  onClick={() => setIsVisibilitySheetOpen(true)}
                />
              </div>
              
              <div className="bg-neutral-100 p-8 rounded-[2.5rem]">
                <p className="text-[10px] font-medium text-neutral-400 leading-relaxed uppercase tracking-widest text-center">
                  设置为“仅自己”后，其他用户将无法在广场或好友列表中看到您的动态。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {activeSubPage === 'feedback' && (
          <motion.div {...slideProps}>
            {headerBack('意见反馈')}
            <div className="px-8 py-10 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] italic px-2">联系邮箱</h3>
                <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm flex flex-col gap-2">
                  <SettingsItem 
                    icon={<Mail size={20} />} 
                    label="QQ 邮箱" 
                    value="3232896860@qq.com" 
                  />
                  <SettingsItem 
                    icon={<Mail size={20} />} 
                    label="Gmail" 
                    value="syu52942@gmail.com" 
                  />
                </div>
              </div>
              <div className="bg-neutral-900 p-8 rounded-[2.5rem] text-white">
                <h4 className="text-lg font-headline font-black italic uppercase tracking-tighter mb-2">感谢反馈</h4>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">您的每一条建议都是我前进的动力。</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders */}
      <AnimatePresence>
        {activeSubPage === 'reminders' && (
          <motion.div {...slideProps}>
            {headerBack('通知与提醒')}
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
              <div className="bg-white rounded-[2rem] p-2 border border-neutral-100 shadow-sm">
                <SettingsItem
                  icon={<Bell size={20} />}
                  label="每日打卡提醒"
                  toggle={true}
                  toggleValue={dailyReminder}
                  onToggle={setDailyReminder}
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
                        onClick={() => { setEditingTimeIndex(index); setTimePickerValue(time); setIsTimePickerOpen(true); }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-neutral-900 group-hover:scale-110 transition-transform"><Clock size={20} /></div>
                          <span className="font-sans font-bold text-[14px] text-neutral-800">{time}</span>
                        </div>
                        {reminderTimes.length > 1 && (
                          <button
                            onClick={e => { e.stopPropagation(); setReminderTimes(prev => prev.filter((_, i) => i !== index)); showToast('已删除提醒'); }}
                            className="text-red-400 p-1 hover:scale-110 transition-transform"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {reminderTimes.length < 5 && (
                    <button
                      onClick={() => { setEditingTimeIndex(null); setTimePickerValue('08:00'); setIsTimePickerOpen(true); }}
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
    </>
  );
}
