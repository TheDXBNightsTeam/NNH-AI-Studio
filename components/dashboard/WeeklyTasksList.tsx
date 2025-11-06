'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

const STORAGE_KEY = 'dashboard-weekly-tasks';

function loadTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

function saveTasksToStorage(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function WeeklyTasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setTasks(loadTasksFromStorage());
  }, []);

  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const completion = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return {
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [tasks]);

  const generateMockTasks = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    const candidates: Omit<Task, 'id'>[] = [
      { title: 'Reply to 5 pending reviews', completed: false, priority: 'HIGH' },
      { title: 'Answer 2 customer questions', completed: false, priority: 'HIGH' },
      { title: 'Upload 3 new photos', completed: false, priority: 'MEDIUM' },
      { title: 'Create a special offer post', completed: false, priority: 'MEDIUM' },
      { title: 'Update business hours', completed: false, priority: 'LOW' },
    ];
    // Pick 3-5 tasks randomly
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const count = Math.floor(Math.random() * 3) + 3;
    const generated: Task[] = shuffled.slice(0, count).map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      ...t,
    }));
    setTasks(generated);
    toast.success('Weekly tasks generated!');
    setIsGenerating(false);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-300">
          Progress:{' '}
          <span className="font-medium">
            {completion.done}/{completion.total} completed
          </span>
        </div>
        <Button
          onClick={generateMockTasks}
          disabled={isGenerating}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Weekly Tasks
            </>
          )}
        </Button>
      </div>

      <Progress value={completion.percent} className="h-2 bg-zinc-800" />

      {tasks.length === 0 ? (
        <div className="text-sm text-zinc-500 py-8 text-center">
          No tasks yet. Click “Generate Weekly Tasks” to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                'bg-zinc-800/50 border-zinc-700/50 p-3',
                'transition-all',
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => {
                    const becomingComplete = !task.completed;
                    toggleTask(task.id);
                    if (becomingComplete) {
                      toast.success('Task completed!');
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      'text-sm text-zinc-200',
                      task.completed && 'line-through text-zinc-400 transition-all',
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="mt-1">
                    <Badge
                      className={cn(
                        'text-xs',
                        task.priority === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : task.priority === 'MEDIUM'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30',
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


