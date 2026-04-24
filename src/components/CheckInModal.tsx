import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Lock, Users } from 'lucide-react';
import { ChangeEvent, SetStateAction } from 'react';
import { Visibility, Habit } from '../types';

interface CheckInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Habit[];
  checkInHabitId: string;
  setCheckInHabitId: (id: string) => void;
  checkInContent: string;
  setCheckInContent: (content: string) => void;
  checkInImages: string[];
  setCheckInImages: (images: SetStateAction<string[]>) => void;
  checkInVisibility: Visibility;
  setCheckInVisibility: (visibility: Visibility) => void;
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;
  onPublish: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => void;
}

export const CheckInDrawer = ({
  isOpen,
  onClose,
  tasks,
  checkInHabitId,
  setCheckInHabitId,
  checkInContent,
  setCheckInContent,
  checkInImages,
  setCheckInImages,
  checkInVisibility,
  setCheckInVisibility,
  editingPostId,
  setEditingPostId,
  onPublish,
  onImageUpload
}: CheckInDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              setEditingPostId(null);
            }}
            className="fixed inset-0 bg-black/60 z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[3.5rem] z-[110] p-10 flex flex-col gap-10 editorial-shadow h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <button onClick={() => {
                onClose();
                setEditingPostId(null);
              }} className="text-neutral-400 font-bold uppercase text-xs tracking-widest">取消</button>
              <h2 className="font-headline font-black text-xl italic uppercase tracking-tighter">
                {editingPostId ? '修改瞬间' : '今日打卡'}
              </h2>
              <button
                onClick={onPublish}
                className="bg-black text-white px-6 py-2 rounded-full font-headline font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
              >
                {editingPostId ? '保存' : '发布'}
              </button>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">{editingPostId ? '对应任务' : '选择任务'}</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {tasks.map(t => {
                    const isTeamReady = t.type === 'single' || t.isStarted;
                    return (
                      <button
                        key={t.id}
                        disabled={!!editingPostId || !isTeamReady}
                        onClick={() => setCheckInHabitId(t.id)}
                        className={`flex-shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${checkInHabitId === t.id ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-400 border-2 border-transparent hover:border-neutral-200'} ${editingPostId && checkInHabitId !== t.id ? 'opacity-30' : ''} ${t.isCompletedToday ? 'relative' : ''} ${!isTeamReady ? 'opacity-20 cursor-not-allowed' : ''}`}
                      >
                        {t.name}
                        {!isTeamReady && <Lock size={8} className="absolute top-1 right-1" />}
                        {t.isCompletedToday && (
                          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                        )}
                      </button>
                    )
                  })}
                  {tasks.length === 0 && <p className="text-xs font-bold text-neutral-300 italic">暂无进行中的任务</p>}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">分享瞬间</label>
                <textarea
                  placeholder="分享此刻的自律感..."
                  value={checkInContent}
                  onChange={(e) => setCheckInContent(e.target.value)}
                  className="w-full h-32 bg-neutral-50 p-6 rounded-[2rem] text-lg font-medium outline-none resize-none border-2 border-transparent focus:border-neutral-100 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">上传图片</label>
                <div className="grid grid-cols-4 gap-2">
                  {checkInImages.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group">
                      <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        onClick={() => setCheckInImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {checkInImages.length < 9 && (
                    <label className="aspect-square bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center text-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer">
                      <Camera size={20} />
                      <span className="text-[8px] font-black uppercase mt-1 text-neutral-400">本地上传</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            onImageUpload({ target: { files: [file] } } as any, (url: string) => setCheckInImages(prev => [...prev, url]));
                          });
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em]">权限设置</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'public', label: '公开', icon: <Users size={14} /> },
                    { id: 'friends', label: '仅好友', icon: <Users size={14} className="text-emerald-500" /> },
                    { id: 'private', label: '仅自己', icon: <Lock size={14} /> }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCheckInVisibility(opt.id as Visibility)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] transition-all border-2 ${checkInVisibility === opt.id ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg' : 'border-neutral-50 bg-neutral-50 text-neutral-400 hover:border-neutral-200'}`}
                    >
                      {opt.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskName: string;
  setTaskName: (name: string) => void;
  taskDays: number;
  setTaskDays: (days: number) => void;
  taskType: 'single' | 'team';
  setTaskType: (type: 'single' | 'team') => void;
  onCreate: () => void;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  taskName,
  setTaskName,
  taskDays,
  setTaskDays,
  taskType,
  setTaskType,
  onCreate
}: CreateTaskModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose()}
            className="fixed inset-0 bg-black/40 z-[50]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[3rem] z-[120] p-8 pb-12 flex flex-col gap-10 editorial-shadow overflow-y-auto"
          >
            <div className="flex justify-between items-center">
              <button onClick={() => onClose()} className="text-neutral-400 font-medium">取消</button>
              <h2 className="font-headline font-extrabold text-lg">新建任务</h2>
              <div className="w-8" />
            </div>

            <div className="flex flex-col gap-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="输入任务名称"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full text-2xl font-headline font-bold border-b-2 border-neutral-100 py-4 focus:border-black outline-none transition-colors rounded-none bg-transparent"
                />
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-900">目标天数</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={taskDays}
                      onChange={(e) => setTaskDays(Number(e.target.value))}
                      className="w-12 text-right font-bold text-xl outline-none bg-transparent"
                    />
                    <span className="text-neutral-400 font-medium">天</span>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">* 任务一旦创建，目标天数不可修改</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setTaskType('single')}
                  className={`flex-1 py-4 rounded-full font-bold transition-all ${taskType === 'single' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}
                >
                  单人任务
                </button>
                <button
                  onClick={() => setTaskType('team')}
                  className={`flex-1 py-4 rounded-full font-bold transition-all ${taskType === 'team' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-500'}`}
                >
                  团队任务
                </button>
              </div>

              <button
                onClick={onCreate}
                className="w-full py-5 bg-black text-white rounded-full font-headline font-black text-lg shadow-2xl active:scale-95 transition-transform"
              >
                确定创建
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[201]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-white rounded-[2.5rem] p-10 z-[202] text-center editorial-shadow"
          >
            <h3 className="font-headline font-black text-xl italic uppercase tracking-tighter mb-4">删除不可逆</h3>
            <p className="text-sm text-neutral-500 font-medium leading-relaxed mb-8">
              该任务下所有的打卡记录与勋章进度将永久消失。<br />确定要放弃这个目标吗？
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={onConfirm} className="w-full py-4 bg-red-500 text-white rounded-full font-bold uppercase tracking-widest text-xs">彻底删除</button>
              <button onClick={onClose} className="w-full py-4 bg-neutral-100 text-neutral-400 rounded-full font-bold uppercase tracking-widest text-xs">点错了</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

interface TaskDetailsDrawerProps {
  isOpen: boolean;
  task: Habit | null;
  onClose: () => void;
  activities: any[];
  userProfile: { id: string; name: string; avatar: string };
  onLike: (id: string, scope: any) => void;
  onAddComment: (postId: string, text: string, scope: any) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onChangeVisibility: (postId: string, visibility: Visibility) => void;
}

export const TaskDetailsDrawer = ({
  isOpen,
  task,
  onClose,
  activities,
  userProfile,
  onLike,
  onAddComment,
  onDeleteComment,
  onChangeVisibility
}: TaskDetailsDrawerProps) => {
  const MomentItem = require('./MomentItem').default;

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[150]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[3.5rem] z-[160] p-0 flex flex-col h-[80vh] editorial-shadow overflow-hidden"
          >
            <div className="p-8 border-b border-neutral-50 flex justify-between items-center bg-neutral-900 text-white">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">任务归档</span>
                <h2 className="font-headline font-black text-2xl italic uppercase tracking-tighter leading-none mt-1">{task.name}</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white footer-safe">
              {(() => {
                const habitActivities = activities.filter((a: any) => a.habitId === task.id);
                const sortedActivities = [...habitActivities].sort((a: any, b: any) => b.createdAt - a.createdAt);

                return sortedActivities.map((act: any) => (
                  <MomentItem
                    key={act.id}
                    post={act}
                    onLike={onLike}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    onChangeVisibility={onChangeVisibility}
                    currentUserProfile={userProfile}
                  />
                ));
              })()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default { CheckInDrawer, CreateTaskModal, DeleteConfirmModal, TaskDetailsDrawer };