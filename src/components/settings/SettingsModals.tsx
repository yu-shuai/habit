import { AnimatePresence, motion } from 'motion/react';
import { Lock, LogOut, Clock } from 'lucide-react';

interface SettingsModalsProps {
  isLogoutConfirmOpen: boolean;
  setIsLogoutConfirmOpen: (open: boolean) => void;
  onLogout: () => Promise<void>;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (open: boolean) => void;
  newPassInput: string;
  setNewPassInput: (value: string) => void;
  onPasswordSubmit: () => Promise<void>;
  isTimePickerOpen: boolean;
  setIsTimePickerOpen: (open: boolean) => void;
  timePickerValue: string;
  setTimePickerValue: (value: string) => void;
  editingTimeIndex: number | null;
  onSaveReminderTime: () => void;
}

export default function SettingsModals({
  isLogoutConfirmOpen,
  setIsLogoutConfirmOpen,
  onLogout,
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  newPassInput,
  setNewPassInput,
  onPasswordSubmit,
  isTimePickerOpen,
  setIsTimePickerOpen,
  timePickerValue,
  setTimePickerValue,
  editingTimeIndex,
  onSaveReminderTime,
}: SettingsModalsProps) {
  const backdropClass = 'absolute inset-0 bg-black/60 backdrop-blur-md';

  return (
    <>
      {/* Logout confirm */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLogoutConfirmOpen(false)} className={backdropClass} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow text-center">
              <div className="w-20 h-20 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-red-500">
                <LogOut size={32} />
              </div>
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-4">确定退出登录？</h3>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-10">
                退出后您将无法接收到即时提醒，<br />需要重新登录才能同步数据。
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={onLogout} className="w-full py-4 bg-red-500 text-white rounded-[2rem] font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-red-500/30 hover:bg-red-600">
                  确定退出
                </button>
                <button onClick={() => setIsLogoutConfirmOpen(false)} className="w-full py-4 bg-neutral-100 text-neutral-900 rounded-[2rem] font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-all hover:bg-neutral-200">
                  暂不退出
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setIsPasswordModalOpen(false); setNewPassInput(''); }} className={backdropClass} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow">
              <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center mb-8 text-neutral-900">
                <Lock size={28} />
              </div>
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">修改登录密码</h3>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
                请输入新的登录密码，长度至少为 6 位。
              </p>
              <div className="flex flex-col gap-6">
                <input
                  autoFocus type="password" placeholder="输入新密码"
                  value={newPassInput}
                  onChange={e => setNewPassInput(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black transition-all"
                />
                <div className="flex flex-col gap-3">
                  <button onClick={onPasswordSubmit} className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">
                    确认修改
                  </button>
                  <button onClick={() => { setIsPasswordModalOpen(false); setNewPassInput(''); }}
                    className="w-full py-2 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Time picker */}
      <AnimatePresence>
        {isTimePickerOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTimePickerOpen(false)} className={backdropClass} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[3.5rem] p-10 editorial-shadow text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-neutral-900">
                <Clock size={28} />
              </div>
              <h3 className="font-headline font-black text-2xl italic uppercase tracking-tighter mb-2">
                {editingTimeIndex !== null ? '修改提醒时间' : '添加提醒时间'}
              </h3>
              <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest leading-relaxed mb-8">
                请选择您希望接收打卡提醒的时间。
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex justify-center items-center gap-3">
                  <input
                    type="number" min={0} max={23}
                    value={timePickerValue.split(':')[0] ?? '08'}
                    onChange={e => {
                      const h = String(Math.min(23, Math.max(0, Number(e.target.value)))).padStart(2, '0');
                      setTimePickerValue(`${h}:${timePickerValue.split(':')[1] ?? '00'}`);
                    }}
                    className="w-24 bg-neutral-100 px-4 py-5 rounded-3xl text-4xl font-headline font-black italic border-none focus:ring-2 focus:ring-black outline-none text-center"
                  />
                  <span className="text-4xl font-black text-neutral-400">:</span>
                  <input
                    type="number" min={0} max={59}
                    value={timePickerValue.split(':')[1] ?? '00'}
                    onChange={e => {
                      const m = String(Math.min(59, Math.max(0, Number(e.target.value)))).padStart(2, '0');
                      setTimePickerValue(`${timePickerValue.split(':')[0] ?? '08'}:${m}`);
                    }}
                    className="w-24 bg-neutral-100 px-4 py-5 rounded-3xl text-4xl font-headline font-black italic border-none focus:ring-2 focus:ring-black outline-none text-center"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest text-center">
                  24 小时制 · 00:00 ~ 23:59
                </p>
                <div className="flex flex-col gap-3">
                  <button onClick={onSaveReminderTime} className="w-full py-5 bg-black text-white rounded-2xl font-headline font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">
                    确认
                  </button>
                  <button onClick={() => setIsTimePickerOpen(false)}
                    className="w-full py-2 text-neutral-400 font-headline font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform">
                    取消
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
