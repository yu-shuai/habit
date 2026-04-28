import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsItemProps {
  icon: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export default function SettingsItem({
  icon, label, value, onClick, toggle, toggleValue, onToggle, danger,
}: SettingsItemProps) {
  return (
    <button
      onClick={() => {
        if (toggle && onToggle) onToggle(!toggleValue);
        else if (onClick) onClick();
      }}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-colors ${
        danger ? 'hover:bg-red-50 active:bg-red-100' : 'hover:bg-neutral-50 active:bg-neutral-100'
      }`}
    >
      <div className={`w-10 h-10 rounded-[1.2rem] flex items-center justify-center ${
        danger ? 'bg-red-50 text-red-500' : 'bg-neutral-50 text-neutral-900'
      }`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-neutral-900'}`}>
          {label}
        </p>
        {value && (
          <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{value}</p>
        )}
      </div>
      {toggle ? (
        <div className={`w-11 h-6 rounded-full transition-colors relative ${
          toggleValue ? 'bg-black' : 'bg-neutral-200'
        }`}>
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            toggleValue ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`} />
        </div>
      ) : (
        <ChevronRight size={16} className="text-neutral-300" />
      )}
    </button>
  );
}
