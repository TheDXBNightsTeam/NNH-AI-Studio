"use client"

import { useState, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Send, Sparkles, MessageSquare, Star, Zap, TrendingUp, Clock, User, Bot, Copy, RotateCw, Check, AlertCircle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface Review {
    id: string;
    review_date: string;
    reviewer_name: string;
    rating: number;
    review_text: string;
    review_reply: string | null;
    location_name: string;
    location_id: string;
    platform: 'google';
}

const toneOptions = [
    { value: 'friendly', label: '😊 Friendly', icon: '👋', color: 'from-blue-500 to-cyan-500' },
    { value: 'formal', label: '👔 Professional', icon: '💼', color: 'from-purple-500 to-pink-500' },
    { value: 'apologetic', label: '🙏 Apologetic', icon: '💐', color: 'from-red-500 to-orange-500' },
    { value: 'marketing', label: '🎯 Marketing', icon: '🚀', color: 'from-green-500 to-emerald-500' },
];

const templates = [
    { id: 't1', label: 'Thank & Invite', preview: 'Thank you for your kind words! We\'d love to see you again...' },
    { id: 't2', label: 'Apologize & Resolve', preview: 'We sincerely apologize for your experience. Please contact us...' },
    { id: 't3', label: 'Feature Highlight', preview: 'Glad you enjoyed our service! Did you know we also offer...' },
];

const mockReviews: Review[] = [
    { id: 'r1', review_date: new Date(Date.now() - 86400000 * 2).toISOString(), reviewer_name: 'Ahmed K.', rating: 5, review_text: 'Amazing staff and quick service! Will definitely be coming back.', review_reply: null, location_name: 'Downtown Branch', location_id: 'l1', platform: 'google' },
    { id: 'r2', review_date: new Date(Date.now() - 86400000 * 5).toISOString(), reviewer_name: 'Fatima A.', rating: 2, review_text: 'The coffee was cold and the wait time was too long. Disappointed with the experience.', review_reply: null, location_name: 'Al Quoz Workshop', location_id: 'l2', platform: 'google' },
    { id: 'r3', review_date: new Date(Date.now() - 86400000 * 1).toISOString(), reviewer_name: 'Omar M.', rating: 4, review_text: 'Great product, but the pricing is a bit high compared to competitors.', review_reply: null, location_name: 'Downtown Branch', location_id: 'l1', platform: 'google' },
    { id: 'r4', review_date: new Date(Date.now() - 86400000 * 3).toISOString(), reviewer_name: 'Sarah L.', rating: 5, review_text: 'Excellent experience from start to finish. The team was professional and friendly.', review_reply: null, location_name: 'Mall Branch', location_id: 'l3', platform: 'google' },
    { id: 'r5', review_date: new Date(Date.now() - 86400000 * 7).toISOString(), reviewer_name: 'Mohammed R.', rating: 3, review_text: 'Average service, nothing special. Could be improved.', review_reply: null, location_name: 'Downtown Branch', location_id: 'l1', platform: 'google' },
];

export function ReviewResponseCockpit() {
    const [reviews, setReviews] = useState<Review[]>(mockReviews);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [replyContent, setReplyContent] = useState<string>('');
    const [tone, setTone] = useState<string>('friendly');
    const [aiLoading, setAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const getSentimentColor = (rating: number) => {
        if (rating >= 4) return 'from-green-500/20 to-emerald-500/20 border-green-500/50';
        if (rating === 3) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
        return 'from-red-500/20 to-pink-500/20 border-red-500/50';
    };

    const getSentimentIcon = (rating: number) => {
        if (rating >= 4) return '🎉';
        if (rating === 3) return '😐';
        return '😞';
    };

    const handleGenerateAI = async () => {
        if (!selectedReview) return;
        setAiLoading(true);

        try {
            const response = await fetch('/api/ai/generate-review-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    reviewText: selectedReview.review_text,
                    rating: selectedReview.rating,
                    tone: tone,
                    locationName: selectedReview.location_name
                })
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || "Failed to generate AI response.");
            }

            setReplyContent(result.reply || "AI generated reply failed. Please try a different tone.");
            toast.success("✨ AI response generated!");

        } catch (e: any) {
            toast.error(e.message);
            setReplyContent("Could not generate AI reply. Please check your API configuration.");
        } finally {
            setAiLoading(false);
        }
    }

    const handleSubmitReply = async () => {
        if (!selectedReview || !replyContent.trim()) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/gmb/reviews/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    reviewId: selectedReview.id,
                    locationId: selectedReview.location_id,
                    replyText: replyContent
                })
            });

            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || "Failed to publish reply to Google.");
            }

            toast.success("🎉 Reply published to Google!");
            setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
            setSelectedReview(null);
            setReplyContent('');

        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleSelectReview = (review: Review) => {
        setSelectedReview(review);
        setReplyContent('');
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(replyContent);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* AI Command Bar */}
            <div className="relative bg-gradient-to-r from-[#FF6B00]/10 via-black to-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg p-4 mb-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent animate-pulse" />
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute -inset-2 bg-[#FF6B00]/20 rounded-full blur-lg animate-pulse" />
                            <div className="relative w-12 h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-black" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                AI Copilot
                                <span className="px-2 py-0.5 text-xs bg-[#FF6B00]/20 text-[#FF6B00] rounded-full border border-[#FF6B00]/50">
                                    {aiLoading ? 'Generating...' : 'Ready'}
                                </span>
                            </h3>
                            <p className="text-sm text-gray-400">Powered by Aurora AI • Generate replies in seconds</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-[#FF6B00]">{reviews.length}</div>
                            <div className="text-xs text-gray-400">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">85%</div>
                            <div className="text-xs text-gray-400">Response Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">~30s</div>
                            <div className="text-xs text-gray-400">Avg. Time</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* LEFT: Review Stream */}
                <div className="col-span-4 flex flex-col min-h-0">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Review Stream</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3" />
                            <span>Priority Sorted</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 min-h-0">
                        {reviews.length === 0 ? (
                            <Card className="p-8 text-center border-dashed border-gray-700">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                <p className="text-gray-400">No pending reviews</p>
                            </Card>
                        ) : (
                            reviews.map(review => (
                                <Card 
                                    key={review.id}
                                    onClick={() => handleSelectReview(review)}
                                    className={cn(
                                        "relative cursor-pointer transition-all duration-300 hover:scale-[1.02] border overflow-hidden",
                                        "bg-gradient-to-br", getSentimentColor(review.rating),
                                        selectedReview?.id === review.id 
                                            ? "ring-2 ring-[#FF6B00] shadow-lg shadow-[#FF6B00]/20" 
                                            : "hover:border-[#FF6B00]/50"
                                    )}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getSentimentIcon(review.rating)}</span>
                                                <div>
                                                    <h4 className="font-semibold text-sm text-white">{review.reviewer_name}</h4>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        {Array.from({ length: review.rating }).map((_, i) => (
                                                            <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Clock className="w-4 h-4 text-gray-500" />
                                        </div>
                                        
                                        <p className="text-xs text-gray-300 line-clamp-2 mb-3">
                                            {review.review_text}
                                        </p>
                                        
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="truncate">{review.location_name}</span>
                                            <span>{formatDistanceToNow(new Date(review.review_date), { addSuffix: true })}</span>
                                        </div>

                                        {selectedReview?.id === review.id && (
                                            <div className="absolute top-2 right-2">
                                                <div className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: AI Studio Panel */}
                <div className="col-span-8 flex flex-col min-h-0">
                    {!selectedReview ? (
                        <Card className="flex-1 flex flex-col items-center justify-center border-dashed border-gray-700 bg-black/30">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[#FF6B00]/20 rounded-full blur-2xl" />
                                <Sparkles className="relative w-16 h-16 text-[#FF6B00] mb-4" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Select a Review to Begin</h3>
                            <p className="text-gray-400 text-center max-w-md">
                                Choose a review from the stream to generate AI-powered responses in seconds
                            </p>
                        </Card>
                    ) : (
                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                            {/* Review Context Card */}
                            <Card className="border-[#FF6B00]/30 bg-gradient-to-br from-[#FF6B00]/5 to-black">
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getSentimentIcon(selectedReview.rating)}</span>
                                            <div>
                                                <h4 className="font-bold text-white flex items-center gap-2">
                                                    {selectedReview.reviewer_name}
                                                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/50">
                                                        {selectedReview.rating} ★
                                                    </span>
                                                </h4>
                                                <p className="text-xs text-gray-400">{selectedReview.location_name} • {formatDistanceToNow(new Date(selectedReview.review_date), { addSuffix: true })}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                                        {selectedReview.review_text}
                                    </p>
                                </div>
                            </Card>

                            {/* Tone Selector */}
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                                    Response Tone
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {toneOptions.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setTone(opt.value)}
                                            disabled={aiLoading}
                                            className={cn(
                                                "relative p-3 rounded-lg border-2 transition-all duration-300",
                                                "hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                                                tone === opt.value
                                                    ? `border-[#FF6B00] bg-gradient-to-br ${opt.color} shadow-lg`
                                                    : "border-gray-700 bg-black/50 hover:border-gray-600"
                                            )}
                                        >
                                            <div className="text-center">
                                                <div className="text-2xl mb-1">{opt.icon}</div>
                                                <div className="text-xs font-medium text-white">{opt.label}</div>
                                            </div>
                                            {tone === opt.value && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-black" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <Button
                                onClick={handleGenerateAI}
                                disabled={aiLoading || isSubmitting}
                                className="relative w-full h-14 bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] hover:from-[#FF8C42] hover:to-[#FF6B00] text-black font-bold text-base shadow-lg shadow-[#FF6B00]/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-lg" />
                                <div className="relative flex items-center justify-center gap-3">
                                    {aiLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Generating Magic...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            <span>Generate with AI</span>
                                            <Zap className="w-5 h-5" />
                                        </>
                                    )}
                                </div>
                            </Button>

                            {/* Response Preview Area */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Your Response
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">
                                            {replyContent.length} chars
                                        </span>
                                        {replyContent && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleCopy}
                                                className="h-7 px-2 text-xs"
                                            >
                                                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex-1 relative min-h-0">
                                    <Textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="✨ Click 'Generate with AI' to create a response, or write your own..."
                                        disabled={aiLoading || isSubmitting}
                                        className="h-full resize-none bg-black/50 border-gray-700 focus:border-[#FF6B00] focus:ring-[#FF6B00] text-white placeholder:text-gray-600"
                                    />
                                    {!replyContent && !aiLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-center">
                                                <Lightbulb className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">AI response will appear here</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedReview(null);
                                        setReplyContent('');
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 border-gray-700 hover:bg-gray-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitReply}
                                    disabled={!replyContent.trim() || isSubmitting}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Publish to Google
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
