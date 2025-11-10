'use client';

import { useState } from 'react';
import { FeedItem } from '@/components/dashboard/FeedItem';

type Alert = {
  priority: 'HIGH' | 'MEDIUM';
  message: string;
  type: string;
  icon: string;
};

export function ExpandableFeed({ alerts }: { alerts: Alert[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const getAction = (type: string) => {
    if (type === 'reviews') return { text: 'Reply to Reviews', link: '/reviews', description: 'Respond quickly to maintain high engagement' };
    if (type === 'questions') return { text: 'Answer Questions', link: '/questions', description: 'Provide timely answers to improve trust' };
    if (type === 'response_rate') return { text: 'Improve Response Rate', link: '/reviews', description: 'Aim for at least 80% response rate' };
    return { text: 'View Details', link: '/dashboard', description: 'Open details' };
  };

  return (
    <div className="space-y-3">
      {alerts.map((a, idx) => {
        const action = getAction(a.type);
        const key = `${a.type}-${idx}`;
        return (
          <FeedItem
            key={key}
            priority={a.priority}
            title={a.message}
            description={action.description}
            actionText={action.text}
            actionLink={action.link}
            isExpanded={expanded === key}
            onToggle={() => setExpanded((prev) => (prev === key ? null : key))}
          />
        );
      })}
    </div>
  );
}


