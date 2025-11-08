

'use client';

import { useState, useTransition } from 'react';
import { generateWeeklyTasks } from './actions';

export default function GenerateTasksButton({ accountId }: { accountId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        await generateWeeklyTasks(accountId);
        setStatus('success');
        window.dispatchEvent(new Event('dashboard:refresh'));
        console.log('[GenerateTasksButton] Weekly tasks generated, dashboard refresh dispatched');
      } catch (error) {
        console.error('[GenerateTasksButton] Error generating tasks:', error);
        setStatus('error');
      }
    });
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={isPending}
      className={`px-5 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
        isPending
          ? 'bg-zinc-700 cursor-wait text-zinc-300'
          : 'bg-green-600 hover:bg-green-700 text-white'
      }`}
    >
      {isPending ? (
        <>
          <span>⚙️</span>
          <span>Generating...</span>
        </>
      ) : status === 'success' ? (
        <>
          <span>✅</span>
          <span>Generated</span>
        </>
      ) : (
        <>
          <span>🧠</span>
          <span>Generate Tasks</span>
        </>
      )}
    </button>
  );
}