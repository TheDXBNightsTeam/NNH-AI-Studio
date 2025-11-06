'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

export interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
}

interface ReviewsQuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingReviews: ReviewItem[];
}

export function ReviewsQuickActionModal({
  isOpen,
  onClose,
  pendingReviews,
}: ReviewsQuickActionModalProps) {
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendReply = async () => {
    if (!selectedReview || replyText.trim().length === 0) {
      toast.error('Please enter a reply.');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSubmitting(false);
    toast.success('Reply sent successfully!');
    setReplyText('');
    setSelectedReview(null);
    onClose();
  };

  const closeAndReset = () => {
    setSelectedReview(null);
    setReplyText('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? closeAndReset() : null)}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Reply to Reviews</DialogTitle>
          <DialogDescription className="text-zinc-400">
            View pending reviews and send a quick reply.
          </DialogDescription>
        </DialogHeader>

        {!selectedReview ? (
          <div className="space-y-3 max-h-[60vh] overflow-auto pr-1">
            {pendingReviews.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">No pending reviews 🎉</div>
            ) : (
              pendingReviews.slice(0, 20).map((review) => (
                <Card
                  key={review.id}
                  className="bg-zinc-800/50 border-zinc-700/50 hover:border-orange-500/40 transition-all cursor-pointer"
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-zinc-300">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{review.rating?.toFixed(1) ?? 'N/A'}</span>
                      </div>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-200 line-clamp-3">
                      {review.comment || 'No review text'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(review.created_at).toLocaleString()}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-sm text-zinc-300">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>{selectedReview.rating?.toFixed(1) ?? 'N/A'}</span>
                </div>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Pending
                </Badge>
              </div>
              <p className="text-sm text-zinc-200">{selectedReview.comment || 'No review text'}</p>
              <p className="text-xs text-zinc-500 mt-2">
                {new Date(selectedReview.created_at).toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Your Reply</label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[120px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setSelectedReview(null)}
                className="text-zinc-300 hover:text-zinc-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendReply}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


