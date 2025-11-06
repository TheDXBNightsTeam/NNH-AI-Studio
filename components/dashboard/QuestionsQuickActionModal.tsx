'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface QuestionItem {
  id: string;
  question_text: string;
  created_at: string;
  author_name?: string | null;
  upvotes?: number | null;
  answer_status?: string | null;
}

interface QuestionsQuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  unansweredQuestions: QuestionItem[];
}

export function QuestionsQuickActionModal({
  isOpen,
  onClose,
  unansweredQuestions,
}: QuestionsQuickActionModalProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostAnswer = async () => {
    if (!selectedQuestion || answerText.trim().length === 0) {
      toast.error('Please enter an answer.');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    toast.success('Answer posted!');
    setAnswerText('');
    setSelectedQuestion(null);
    onClose();
  };

  const closeAndReset = () => {
    setSelectedQuestion(null);
    setAnswerText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeAndReset() : null)}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Answer Questions</DialogTitle>
          <DialogDescription className="text-zinc-400">
            View unanswered customer questions and post a helpful answer.
          </DialogDescription>
        </DialogHeader>

        {!selectedQuestion ? (
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {unansweredQuestions.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">No unanswered questions 🎉</div>
            ) : (
              unansweredQuestions.map((q) => (
                <Card
                  key={q.id}
                  className="bg-zinc-800/50 border-zinc-700/50 hover:border-orange-500/40 transition-all cursor-pointer"
                  onClick={() => setSelectedQuestion(q)}
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-300">{q.author_name || 'Customer'}</p>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Unanswered
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-200 line-clamp-3">{q.question_text}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{new Date(q.created_at).toLocaleString()}</span>
                      {typeof q.upvotes === 'number' && <span>▲ {q.upvotes}</span>}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <p className="text-sm text-zinc-200">{selectedQuestion.question_text}</p>
              <p className="text-xs text-zinc-500 mt-2">
                {new Date(selectedQuestion.created_at).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Your Answer</label>
              <Textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your answer..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedQuestion(null)}
                className="text-zinc-300 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePostAnswer}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSubmitting ? 'Posting...' : 'Post Answer'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


