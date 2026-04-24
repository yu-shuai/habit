import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

const SettingsItem = ({
  icon,
  label,
  subtext,
  statusText,
  showArrow = true,
  showToggle = false,
  isToggled = false,
  onToggle,
  isLast = false,
  onClick,
  isCentered = false,
  isDanger = false
}: {
  icon?: ReactNode,
  label: string,
  subtext?: string,
  statusText?: string,
  showArrow?: boolean,
  showToggle?: boolean,
  isToggled?: boolean,
  onToggle?: (val: boolean) => void,
  isLast?: boolean,
  onClick?: () => void,
  isCentered?: boolean,
  isDanger?: boolean,
  key?: string | number
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-6 py-5 hover:bg-neutral-50 transition-colors ${!isLast ? 'border-b border-neutral-50' : ''} ${isCentered ? 'justify-center' : 'justify-between'}`}
  >
    <div className={`flex items-center gap-4 ${isCentered ? 'flex-col gap-0' : ''}`}>
      {!isCentered && icon && <div className="text-neutral-900">{icon}</div>}
      <div className={`flex flex-col ${isCentered ? 'items-center' : 'items-start'}`}>
        <span className={`font-sans font-bold text-[14px] tracking-tight ${isDanger ? 'text-red-500' : 'text-neutral-800'}`}>
          {label}
        </span>
        {subtext && (
          <span className="text-[10px] text-neutral-400 font-medium leading-none mt-1">
            {subtext}
          </span>
        )}
      </div>
    </div>

    {!isCentered && (
      <div className="flex items-center gap-2">
        {statusText && <span className="text-[12px] text-neutral-400 font-medium">{statusText}</span>}
        {showToggle ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(!isToggled);
            }}
            className={`w-10 h-6 rounded-full transition-colors relative ${isToggled ? 'bg-black' : 'bg-neutral-200'}`}
          >
            <motion.div
              animate={{ x: isToggled ? 18 : 2 }}
              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
        ) : (
          showArrow && <ChevronRight size={18} className="text-neutral-200" />
        )}
      </div>
    )}
  </button>
);

export default SettingsItem;