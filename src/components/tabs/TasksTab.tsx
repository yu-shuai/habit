import { AnimatePresence } from 'motion/react';
import HabitCard from '../HabitCard';
import CompletedHabitCard from '../CompletedHabitCard';
import { CheckSquare } from 'lucide-react';
import { Habit } from '../../types';

interface TasksTabProps {
  tasksSubTab: 'ongoing' | 'completed';
  setTasksSubTab: (tab: 'ongoing' | 'completed') => void;
  tasks: Habit[];
  completedTasks: Habit[];
  handleCheck: (id: string, skipAutoPost?: boolean) => void;
  handleDelete: (id: string) => void;
}

export default function TasksTab({
  tasksSubTab,
  setTasksSubTab,
  tasks,
  completedTasks,
  handleCheck,
  handleDelete,
}: TasksTabProps) {
  const isOngoing = tasksSubTab === 'ongoing';
  const currentList = isOngoing ? tasks : completedTasks;

  return (
    <main className="flex-grow pt-8 pb-32 px-5">
      <div className="flex gap-6 mb-8">
        {(['ongoing', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTasksSubTab(tab)}
            className={`font-headline font-black text-xl tracking-tighter italic transition-all flex-shrink-0 ${tasksSubTab === tab ? 'border-b-4 border-black text-black' : 'text-neutral-300'}`}
          >
            {tab === 'ongoing' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {currentList.map(habit =>
            isOngoing ? (
              <HabitCard key={habit.id} habit={habit} onCheck={handleCheck} onDelete={handleDelete} />
            ) : (
              <CompletedHabitCard key={habit.id} habit={habit} onDelete={handleDelete} />
            )
          )}
        </AnimatePresence>

        {currentList.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
              <CheckSquare size={32} />
            </div>
            <p className="text-neutral-400 font-medium font-headline tracking-wide uppercase text-sm">
              {isOngoing ? '暂无进行中任务' : '暂无已完成任务'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
