// src/components/reviews/ReviewResponseCockpit.tsx

"use client"

import { useState, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Sparkles, MessageSquare, Star, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

// 💡 افتراض نوع بيانات المراجعة (يجب أن يتطابق مع Supabase)
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
    { value: 'friendly', label: 'Friendly & Enthusiastic' },
    { value: 'formal', label: 'Formal & Professional' },
    { value: 'apologetic', label: 'Apologetic (Negative)' },
    { value: 'marketing', label: 'Marketing Focused' },
];

// بيانات وهمية للاختبار والتصميم
const mockReviews: Review[] = [
    { id: 'r1', review_date: new Date(Date.now() - 86400000 * 2).toISOString(), reviewer_name: 'Ahmed K.', rating: 5, review_text: 'Amazing staff and quick service! Will definitely be coming back.', review_reply: null, location_name: 'Downtown Branch', location_id: 'l1', platform: 'google' },
    { id: 'r2', review_date: new Date(Date.now() - 86400000 * 5).toISOString(), reviewer_name: 'Fatima A.', rating: 2, review_text: 'The coffee was cold and the wait time was too long. Disappointed with the experience.', review_reply: null, location_name: 'Al Quoz Workshop', location_id: 'l2', platform: 'google' },
    { id: 'r3', review_date: new Date(Date.now() - 86400000 * 1).toISOString(), reviewer_name: 'Omar M.', rating: 4, review_text: 'Great product, but the pricing is a bit high compared to competitors.', review_reply: null, location_name: 'Downtown Branch', location_id: 'l1', platform: 'google' },
];


export function ReviewResponseCockpit() {
    const [reviews, setReviews] = useState<Review[]>(mockReviews); // 💡 سيتم استبدالها بـ fetch API
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [replyContent, setReplyContent] = useState<string>('');
    const [tone, setTone] = useState<string>('friendly');
    const [aiLoading, setAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 💡 دالة لجلب المراجعات (سيتم تفعيلها لاحقاً)
    const fetchReviews = useCallback(async () => {
        // 💡 هنا يجب استدعاء API Route لجلب المراجعات غير المستجاب لها
        // try { ... const res = await fetch('/api/reviews/unanswered') ... }
    }, []);

    useEffect(() => {
        // fetchReviews(); // 💡 تفعيل الجلب عند الحاجة
    }, [fetchReviews]);

    // ⭐️ دالة لتوليد الردود بالذكاء الاصطناعي
    const handleGenerateAI = async () => {
        if (!selectedReview) return;
        setAiLoading(true);

        try {
            // 💡 استدعاء API Route لتوليد الردود
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

            // 💡 افتراض: الـ API يرجع حقل 'reply'
            setReplyContent(result.reply || "AI generated reply failed. Please try a different tone.");

        } catch (e: any) {
            toast.error(e.message);
            setReplyContent("Could not generate AI reply.");
        } finally {
            setAiLoading(false);
        }
    }

    // ⭐️ دالة لنشر الرد
    const handleSubmitReply = async () => {
        if (!selectedReview || !replyContent.trim()) return;
        setIsSubmitting(true);

        try {
            // 💡 استدعاء API Route لنشر الرد
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

            toast.success("Reply posted successfully to Google!");

            // تحديث الواجهة الأمامية: إزالة المراجعة من القائمة
            setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
            setSelectedReview(null);
            setReplyContent('');

        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    // ⭐️ دالة عند اختيار مراجعة
    const handleSelectReview = (review: Review) => {
        setSelectedReview(review);
        setReplyContent(''); // مسح الرد القديم
        // 💡 تفعيل التوليد التلقائي للرد الفوري عند الاختيار
        // setAiLoading(true); 
        // handleGenerateAI(); // يجب وضع هذا هنا لتوليد الرد تلقائياً
    }

    // عرض القائمة الجانبية (Review List Panel)
    const reviewListPanel = (
        <CardContent className="p-0">
            {reviews.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-3" />
                    <p>Great job! No reviews awaiting a response.</p>
                </div>
            ) : (
                <div className="divide-y max-h-[600px] overflow-y-auto">
                    {reviews.map(review => (
                        <div 
                            key={review.id} 
                            onClick={() => handleSelectReview(review)}
                            className={cn(
                                "p-4 cursor-pointer hover:bg-primary/5 transition-colors",
                                selectedReview?.id === review.id && "bg-primary/10 border-l-4 border-primary"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-sm">{review.reviewer_name}</h4>
                                <div className="flex items-center gap-1 text-xs">
                                    {review.rating} <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-full">
                                {review.review_text.substring(0, 100)}...
                            </p>
                            <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                                <span>{review.location_name}</span>
                                <span>{formatDistanceToNow(new Date(review.review_date), { addSuffix: true })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
    );

    // عرض مساحة عمل الردود (Response Composer)
    const responseComposer = (
        <CardContent className="p-4 h-full flex flex-col">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedReview(null)} 
                className="self-start mb-4 gap-2 text-primary"
            >
                <ArrowLeft className="w-4 h-4" /> Back to List
            </Button>

            <div className="flex-1 overflow-y-auto pr-4 mb-4 space-y-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-bold text-base flex items-center gap-2">
                        {selectedReview?.reviewer_name} 
                        <span className="text-xs text-muted-foreground">({selectedReview?.rating} <Star className="w-3 h-3 inline text-yellow-500 fill-yellow-500" />)</span>
                    </h4>
                    <p className="text-sm mt-2 whitespace-pre-wrap">{selectedReview?.review_text}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Posted {selectedReview?.review_date ? formatDistanceToNow(new Date(selectedReview.review_date), { addSuffix: true }) : 'N/A'} at {selectedReview?.location_name}
                    </p>
                </div>
            </div>

            {/* AI Generator & Composer */}
            <div className="mt-auto pt-4 border-t">
                <h5 className="text-sm font-semibold mb-2">Your AI Response Draft</h5>
                <div className="flex items-center gap-3 mb-3">
                    <Select onValueChange={setTone} value={tone} disabled={aiLoading}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Tone" />
                        </SelectTrigger>
                        <SelectContent>
                            {toneOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleGenerateAI} 
                        disabled={aiLoading || isSubmitting} 
                        variant="secondary" 
                        className="gap-2"
                    >
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Draft
                    </Button>
                </div>

                <Textarea 
                    value={replyContent} 
                    onChange={(e) => setReplyContent(e.target.value)} 
                    rows={6} 
                    placeholder="The AI draft will appear here, or type your custom reply..."
                    disabled={aiLoading || isSubmitting}
                />

                <Button 
                    onClick={handleSubmitReply} 
                    disabled={!replyContent.trim() || isSubmitting} 
                    className="mt-3 w-full gap-2"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Publish Reply to Google
                </Button>
            </div>
        </CardContent>
    );

    // عرض المكون الرئيسي
    return (
        <div className={cn("h-[750px] border rounded-lg overflow-hidden", selectedReview ? 'grid grid-cols-1' : 'grid grid-cols-4')}>
            <Card className={cn("p-0 border-none h-full", selectedReview ? 'hidden' : 'lg:col-span-1 border-r')}>
                <CardHeader className="border-b">
                    <CardTitle className="text-base">Reviews ({reviews.length} pending)</CardTitle>
                </CardHeader>
                {reviewListPanel}
            </Card>

            <Card className={cn("p-0 border-none h-full", selectedReview ? 'lg:col-span-4' : 'lg:col-span-3')}>
                {selectedReview ? responseComposer : (
                     <div className="text-center p-10 h-full flex flex-col justify-center items-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                        <p className="text-lg font-semibold">Select a Review to start composing a reply.</p>
                        <p className="text-sm mt-1">Use the AI tools to generate replies in seconds.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}