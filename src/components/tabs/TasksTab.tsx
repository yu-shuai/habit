import { AnimatePresence } from 'motion/react';
import HabitCard from '../HabitCard';
import { CheckSquare } from 'lucide-react';
import { Habit } from '../../types';

interface TasksTabProps {
  tasks: Habit[];
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  handleDelete: (id: string) => void;
  handleTeamVote?: (habitId: string, choice: 'continue' | 'cashout', newDays?: number) => void;
  currentUserId?: string;
}

export default function TasksTab({
  tasks,
  handleCheck,
  handleDelete,
  handleTeamVote,
  currentUserId,
}: TasksTabProps) {
  return (
    <main className="flex-grow pt-8 pb-32 px-5">
      <div className="mb-8">
        <h2 className="font-headline font-black text-xl tracking-tighter italic border-b-4 border-black pb-1 inline-block">
          进行中
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {tasks.map(habit => (
            <HabitCard key={habit.id} habit={habit} onCheck={handleCheck} onDelete={handleDelete} onTeamVote={handleTeamVote} currentUserId={currentUserId} />
          ))}
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
