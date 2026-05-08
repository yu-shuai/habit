import { ChangeEvent } from 'react';

export const isDarkColor = (color: string | null) => {
  if (!color) return false;

  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness < 128;
};

export const getNextHabitGoal = (totalDays: number) => {
  const nextGoalMap: Record<number, number> = {
    7: 30,
    30: 90,
    90: 180,
    180: 360,
    360: 1000,
  };

  return nextGoalMap[totalDays] || totalDays * 2;
};

export const readImageFileAsDataUrl = (file: File, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.onload = (upload) => {
    if (upload.target?.result) {
      callback(upload.target.result as string);
    }
  };
  reader.readAsDataURL(file);
};

/** 仅仅是为了统一导出 */
export const getFileFromInput = (e: ChangeEvent<HTMLInputElement>): File | null => {
  if (e.target.files && e.target.files.length > 0) {
    return e.target.files[0];
  }
  return null;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
};

export const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MEDAL_TIERS = [7, 30, 90, 180, 365, 500];

/** 向下取整：找出不超过 totalDays 的最大勋章层级 */
export const getMedalForDays = (days: number): number | null => {
  const earned = MEDAL_TIERS.filter(t => t <= days);
  return earned.length > 0 ? earned[earned.length - 1] : null;
};
