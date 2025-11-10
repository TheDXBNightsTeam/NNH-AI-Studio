'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/navigation';
import { 
  MessageSquare, 
  HelpCircle, 
  FileText, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  href: string;
  color: string;
  gradient: string;
  description: string;
}

interface QuickActionsBarProps {
  pendingReviews: number;
  unansweredQuestions: number;
}

export function QuickActionsBar({ 
  pendingReviews, 
  unansweredQuestions
}: QuickActionsBarProps) {

  const quickActions: QuickAction[] = [
    {
      id: 'reviews',
      label: 'Reply to Reviews',
      icon: <MessageSquare className="w-5 h-5" />,
      count: pendingReviews,
      href: '/reviews',
      color: 'text-info',
      gradient: 'from-info/10 to-info/5',
      description: 'Respond to pending reviews'
    },
    {
      id: 'questions',
      label: 'Answer Questions',
      icon: <HelpCircle className="w-5 h-5" />,
      count: unansweredQuestions,
      href: '/questions',
      color: 'text-primary',
      gradient: 'from-primary/10 to-primary/5',
      description: 'Reply to customer questions'
    },
    {
      id: 'posts',
      label: 'Create New Post',
      icon: <FileText className="w-5 h-5" />,
      href: '/posts',
      color: 'text-success',
      gradient: 'from-success/10 to-success/5',
      description: 'Share updates with customers'
    }
  ];

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Most common actions in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              href={action.href}
              aria-label={`${action.label}. ${action.description}. ${action.count !== undefined && action.count > 0 ? `${action.count} pending items` : 'No pending items'}.`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
            >
              <Card 
                className={cn(
                "p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group",
                "border-2 border-transparent hover:border-primary/30",
                "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
                `bg-gradient-to-br ${action.gradient}`
                )}
                role="button"
                tabIndex={0}
                aria-labelledby={`action-${action.id}-title`}
                aria-describedby={`action-${action.id}-description`}
                onKeyDown={(e) => {
                  // ✅ Enable keyboard activation (Enter or Space)
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    // Link component will handle navigation
                    const link = e.currentTarget.closest('a');
                    if (link) {
                      link.click();
                    }
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div 
                      className={cn(
                      "p-2 rounded-lg bg-background/80 group-hover:scale-110 transition-transform",
                      action.color
                      )}
                      aria-hidden="true"
                    >
                      {action.icon}
                    </div>
                    
                    <div className="flex-1">
                      <h4 
                        id={`action-${action.id}-title`}
                        className="font-semibold text-foreground group-hover:text-primary transition-colors"
                      >
                        {action.label}
                      </h4>
                      <p 
                        id={`action-${action.id}-description`}
                        className="text-xs text-muted-foreground mt-1"
                      >
                        {action.description}
                      </p>
                      
                      {action.count !== undefined && action.count > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-500/30">
                          <Zap className="w-3 h-3 fill-white" />
                          {action.count} {isArabic ? 'معلق' : 'pending'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <ArrowRight 
                    className={cn(
                    "w-4 h-4 text-muted-foreground group-hover:text-primary",
                    "group-hover:translate-x-1 transition-all"
                    )}
                    aria-hidden="true"
                  />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
