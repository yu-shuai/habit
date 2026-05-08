import { AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { useHabitStore, useActivityStore } from '../../store/useContentStore';
import HabitCard from '../HabitCard';
import { CheckSquare } from 'lucide-react';
import { InteractionScope, Visibility } from '../../types';
import { HabitCardSkeleton } from '../Skeleton';

interface TasksTabProps {
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  handleDelete: (id: string) => void;
  handleTeamVote?: (habitId: string, choice: 'continue' | 'cashout', newDays?: number) => void;
  currentUserId?: string;
  handleLike: (id: string, scope?: InteractionScope) => void;
  handleAddComment: (postId: string, text: string, scope?: InteractionScope) => void;
  handleDeleteComment: (postId: string, commentId: string) => void;
  handleChangeVisibility: (postId: string, visibility: Visibility) => void;
  handleDeletePost?: (postId: string) => void;
  handleEditPost?: (postId: string) => void;
  fetchStatus?: string;
}


export default function TasksTab({
  handleCheck,
  handleDelete,
  handleTeamVote,
  currentUserId,
  handleLike,
  handleAddComment,
  handleDeleteComment,
  handleChangeVisibility,
  handleDeletePost,
  handleEditPost,
  fetchStatus,
}: TasksTabProps) {

  const { userProfile } = useAppStore();
  const { tasks, setSelectedTaskDetails } = useHabitStore();
  const { activities, setSelectedPost } = useActivityStore();
  return (
    <main className="flex-grow pt-8 pb-32 px-5">
      <div className="mb-8">
        <h2 className="font-headline font-black text-xl tracking-tighter italic border-b-4 border-black pb-1 inline-block">
          进行中
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {fetchStatus === 'fetching...' ? (
            Array(3).fill(0).map((_, i) => <HabitCardSkeleton key={i} />)
          ) : (
            tasks.map(habit => (
              <HabitCard
                habit={habit}
                onCheck={handleCheck}
                onDelete={handleDelete}
                onTeamVote={handleTeamVote}
                currentUserId={currentUserId}
                activities={activities}
                userProfile={userProfile}
                onOpenDetails={() => setSelectedTaskDetails(habit)}
                onLike={handleLike}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onChangeVisibility={handleChangeVisibility}
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
                onViewDetail={setSelectedPost}
              />
            ))
          )}

        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
              <CheckSquare size={32} />
            </div>
            <p className="text-neutral-400 font-medium font-headline tracking-wide uppercase text-sm">
              暂无进行中任务
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
