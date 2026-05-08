import React from 'react';

export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-lg ${className}`}></div>
  );
}

export function MomentItemSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] p-6 mb-4 shadow-sm border border-neutral-50 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-neutral-200" />
        <div className="flex flex-col gap-2">
          <div className="w-24 h-3 bg-neutral-200 rounded" />
          <div className="w-16 h-2 bg-neutral-100 rounded" />
        </div>
      </div>
      <div className="w-full h-4 bg-neutral-200 rounded mb-4" />
      <div className="w-3/4 h-4 bg-neutral-100 rounded mb-4" />
      <div className="w-full aspect-square rounded-3xl bg-neutral-200 mb-4" />
      <div className="flex gap-4">
        <div className="w-16 h-6 bg-neutral-100 rounded-full" />
        <div className="w-16 h-6 bg-neutral-100 rounded-full" />
      </div>
    </div>
  );
}

export function HabitCardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] p-6 mb-4 border border-neutral-100 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <div className="w-32 h-4 bg-neutral-200 rounded" />
          <div className="w-20 h-2 bg-neutral-100 rounded" />
        </div>
        <div className="w-8 h-8 rounded-full bg-neutral-200" />
      </div>
      <div className="w-full h-2 bg-neutral-100 rounded-full mb-4" />
      <div className="flex justify-between">
        <div className="w-12 h-3 bg-neutral-200 rounded" />
        <div className="w-12 h-3 bg-neutral-200 rounded" />
      </div>
    </div>
  );
}

export function MeTabSkeleton() {
  return (
    <div className="flex flex-col gap-10 py-10 px-6 animate-pulse">
      <div className="flex flex-col items-center gap-6">
        <div className="w-24 h-24 rounded-[2.5rem] bg-neutral-200" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-6 bg-neutral-200 rounded" />
          <div className="w-48 h-3 bg-neutral-100 rounded" />
        </div>
        <div className="flex gap-10 mt-4">
          <div className="w-12 h-10 bg-neutral-100 rounded" />
          <div className="w-12 h-10 bg-neutral-100 rounded" />
          <div className="w-12 h-10 bg-neutral-100 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="w-32 h-6 bg-neutral-200 rounded" />
        <div className="grid grid-cols-3 gap-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-100 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
