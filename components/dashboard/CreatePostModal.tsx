'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type PostType = 'whats_new' | 'event' | 'offer' | 'product';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    type: PostType;
    title: string;
    description: string;
    cta?: string;
    url?: string;
  }) => Promise<void> | void;
}

const CTA_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'BOOK', label: 'Book' },
  { value: 'ORDER', label: 'Order' },
  { value: 'SIGN_UP', label: 'Sign Up' },
  { value: 'CALL', label: 'Call' },
];

export function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>('whats_new');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cta, setCta] = useState<string>('');
  const [url, setUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (title.trim().length === 0 || description.trim().length === 0) {
      toast.error('Please fill in title and description');
      return;
    }
    setIsPublishing(true);
    await new Promise((r) => setTimeout(r, 1000));
    try {
      await onSubmit?.({
        type: postType,
        title,
        description,
        cta: cta || undefined,
        url: url || undefined,
      });
    } catch {
      // ignore custom errors in mock mode
    }
    toast.success('Post published!');
    setIsPublishing(false);
    handleClose();
  };

  const handleClose = () => {
    setPostType('whats_new');
    setTitle('');
    setDescription('');
    setCta('');
    setUrl('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : null)}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Create New Post</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Draft and publish a Google Business Profile post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-zinc-300">Post Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'whats_new', label: "What's New" },
                { key: 'event', label: 'Event' },
                { key: 'offer', label: 'Offer' },
                { key: 'product', label: 'Product' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setPostType(opt.key as PostType)}
                  className={`px-3 py-2 rounded-md border text-sm transition-all ${
                    postType === (opt.key as PostType)
                      ? 'bg-orange-600 border-orange-600 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-orange-500/50 hover:bg-orange-500/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-zinc-300">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc" className="text-zinc-300">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a compelling description..."
              className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Media</Label>
            <div className="rounded-md border border-dashed border-zinc-700 bg-zinc-800/50 p-4 text-sm text-zinc-400">
              File upload coming soon. Drop images here or click to browse.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">CTA Button</Label>
              <select
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-600"
              >
                {CTA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url" className="text-zinc-300">CTA URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={handleClose} className="text-zinc-300 hover:text-zinc-100">
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


