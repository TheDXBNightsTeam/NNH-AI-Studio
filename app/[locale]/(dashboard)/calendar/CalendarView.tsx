'use client';

import { useState, useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'post' | 'task' | 'activity';
  status: 'scheduled' | 'published' | 'pending' | 'completed';
  location?: string;
  metadata?: any;
}

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filters, setFilters] = useState({
    posts: true,
    tasks: true,
    activity: true
  });
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    // Use 1 for Monday (date-fns v4+ uses 0-6 where 0 is Sunday, 1 is Monday)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 as any });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 as any });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);
  
  // Filter events by day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      if (!filters.posts && event.type === 'post') return false;
      if (!filters.tasks && event.type === 'task') return false;
      if (!filters.activity && event.type === 'activity') return false;
      
      return isSameDay(event.date, day);
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            variant="outline"
            size="icon"
            className="hover:bg-zinc-800"
          >
            ←
          </Button>
          
          <h2 className="text-2xl font-bold text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            variant="outline"
            size="icon"
            className="hover:bg-zinc-800"
          >
            →
          </Button>
          
          <Button
            onClick={() => setCurrentDate(new Date())}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Today
          </Button>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => setView('month')}
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            className={view === 'month' ? 'bg-orange-600 text-white' : ''}
          >
            Month
          </Button>
          <Button
            onClick={() => setView('week')}
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            className={view === 'week' ? 'bg-orange-600 text-white' : ''}
          >
            Week
          </Button>
          <Button
            onClick={() => setView('day')}
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            className={view === 'day' ? 'bg-orange-600 text-white' : ''}
          >
            Day
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.posts}
            onChange={() => setFilters(f => ({ ...f, posts: !f.posts }))}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-zinc-300">📝 Posts</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.tasks}
            onChange={() => setFilters(f => ({ ...f, tasks: !f.tasks }))}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-zinc-300">✅ Tasks</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.activity}
            onChange={() => setFilters(f => ({ ...f, activity: !f.activity }))}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-orange-600 focus:ring-orange-500"
          />
          <span className="text-sm text-zinc-300">📊 Activity</span>
        </label>
      </div>
      
      {/* Calendar Grid */}
      {view === 'month' && (
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-zinc-800">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-zinc-400 border-r border-zinc-800 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={idx}
                  className={`min-h-[120px] p-2 border-r border-b border-zinc-800 last:border-r-0 ${
                    !isCurrentMonth ? 'bg-zinc-900/30' : ''
                  } ${isDayToday ? 'bg-orange-950/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isCurrentMonth ? 'text-white' : 'text-zinc-600'
                      } ${isDayToday ? 'text-orange-500 font-bold' : ''}`}
                    >
                      {format(day, 'd')}
                    </span>
                    
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-orange-600 text-white px-1.5 py-0.5 rounded">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-1.5 rounded truncate cursor-pointer transition ${
                          event.type === 'post'
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : event.type === 'task'
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                        }`}
                        title={event.title}
                      >
                        {event.type === 'post' && '📝 '}
                        {event.type === 'task' && '✅ '}
                        {event.type === 'activity' && '📊 '}
                        {event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-zinc-500 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
      
      {/* Week View */}
      {view === 'week' && (
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12">
          <div className="text-center text-zinc-400">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-lg">Week view coming soon...</p>
            <p className="text-sm mt-2">This feature will be available in a future update</p>
          </div>
        </Card>
      )}
      
      {/* Day View */}
      {view === 'day' && (
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12">
          <div className="text-center text-zinc-400">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-lg">Day view coming soon...</p>
            <p className="text-sm mt-2">This feature will be available in a future update</p>
          </div>
        </Card>
      )}
    </div>
  );
}

