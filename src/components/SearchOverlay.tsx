import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Search, X } from 'lucide-react';
import { UserProfile } from '../types';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchHistory: string[];
  setSearchHistory: (history: string[] | ((prev: string[]) => string[])) => void;
  searchResults: UserProfile[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onViewProfile: (user: UserProfile) => void;
  currentUserId: string;
}

export default function SearchOverlay({
  isOpen, onClose,
  searchQuery, setSearchQuery,
  searchHistory, setSearchHistory,
  searchResults, isSearching,
  onSearch, onViewProfile, currentUserId,
}: SearchOverlayProps) {
  const addHistory = (v: string) => {
    if (!v.trim() || searchHistory.includes(v)) return;
    setSearchHistory(prev => [v, ...prev.slice(0, 7)]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 z-[100] bg-white flex flex-col max-w-lg mx-auto left-0 right-0"
        >
          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
            <button onClick={onClose} className="p-2 -ml-2">
              <ChevronRight className="rotate-180" size={24} />
            </button>
            <div className="flex-1 relative">
              <input
                autoFocus
                type="text"
                placeholder="搜索用户ID或用户名..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); onSearch(e.target.value); }}
                className="w-full bg-neutral-100 px-10 py-2.5 rounded-full text-sm outline-none font-medium"
                onKeyDown={e => { if (e.key === 'Enter') addHistory(searchQuery); }}
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); onSearch(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
                  <X size={14} />
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => addHistory(searchQuery)}
              className="px-4 py-2 bg-neutral-900 text-white rounded-full text-sm font-bold shadow-md active:bg-black transition-colors"
            >
              搜索
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8">
            {/* History */}
            {!searchQuery && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">最近搜索</h4>
                  {searchHistory.length > 0 && (
                    <button onClick={() => setSearchHistory([])} className="text-[#576b95] text-[10px] font-bold">清除</button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(item => (
                    <button
                      key={item}
                      onClick={() => { setSearchQuery(item); onSearch(item); }}
                      className="px-4 py-2 bg-neutral-50 rounded-full text-xs font-medium text-neutral-600 border border-neutral-100"
                    >
                      {item}
                    </button>
                  ))}
                  {searchHistory.length === 0 && <p className="text-xs text-neutral-300 italic">暂无历史记录</p>}
                </div>
              </div>
            )}

            {/* Results */}
            {searchQuery && (
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  用户 {isSearching ? '搜索中...' : searchResults.length > 0 ? `· ${searchResults.length}` : ''}
                </h4>
                {searchResults.length > 0 ? searchResults.map((user: any) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => { addHistory(searchQuery); onViewProfile(user); }}
                    className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl cursor-pointer active:bg-neutral-100 transition-colors"
                  >
                    <img
                      src={user.avatar || `https://picsum.photos/seed/${user.id}/200`}
                      className="w-11 h-11 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-neutral-900 truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        ID: {user.custom_id || user.id.substring(0, 8)}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-neutral-300" />
                  </motion.div>
                )) : !isSearching && (
                  <p className="text-xs text-neutral-300 italic">未找到匹配用户</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
