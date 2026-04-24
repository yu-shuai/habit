import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Users, UserPlus } from 'lucide-react';

interface FriendRequestListProps {
  requests: any[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export default function FriendRequestList({ requests, onAccept, onReject }: FriendRequestListProps) {
  return (
    <div className="flex flex-col pb-32">
      {requests.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-200">
            <UserPlus size={28} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-300 italic">
            暂无好友申请
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-5 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 px-1 mb-2">
            待处理申请 · {requests.length}
          </p>
          <AnimatePresence mode="popLayout">
            {requests.map(req => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="bg-white rounded-2xl p-4 border border-neutral-100 flex items-center gap-3 shadow-sm"
              >
                <img
                  src={req.requester?.avatar || `https://picsum.photos/seed/${req.requester_id}/200`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-neutral-900 truncate">
                    {req.requester?.name || '用户'}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    ID: {req.requester?.custom_id || req.requester_id?.substring(0, 8)}
                  </p>
                  {req.message && (
                    <div className="mt-2 bg-neutral-50 px-3 py-2 rounded-xl relative border border-neutral-100/50">
                      <p className="text-[11px] text-neutral-600 font-medium leading-relaxed italic break-all line-clamp-2">
                        “{req.message}”
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAccept(req.id)}
                    className="w-9 h-9 bg-emerald-400 rounded-full flex items-center justify-center shadow-sm"
                  >
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onReject(req.id)}
                    className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center"
                  >
                    <X size={16} className="text-neutral-500" strokeWidth={2.5} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
