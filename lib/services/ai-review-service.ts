import type { GMBReview } from '@/lib/types/database';

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

export interface Stats {
  pending: number;
  responseRate: number;
  avgTime: number; // in hours
}

export class AIReviewService {
  static calculateSentimentData(reviews: any[]) {
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0
      };
    }

    let positive = 0;
    let neutral = 0;
    let negative = 0;

    reviews.forEach((review: any) => {
      // Use ai_sentiment if available, otherwise infer from rating/star_rating
      const rating = review.rating || review.star_rating || 0;
      const sentiment = review.ai_sentiment;

      if (sentiment) {
        if (sentiment === 'positive') positive++;
        else if (sentiment === 'negative') negative++;
        else neutral++;
      } else {
        // Infer from rating
        if (rating >= 4) positive++;
        else if (rating <= 2) negative++;
        else neutral++;
      }
    });

    const positivePercent = Math.round((positive / totalReviews) * 100);
    const neutralPercent = Math.round((neutral / totalReviews) * 100);
    const negativePercent = Math.round((negative / totalReviews) * 100);

    return {
      positive: positivePercent,
      neutral: neutralPercent,
      negative: negativePercent,
      total: totalReviews
    };
  }

  static extractKeywords(reviews: any[]): Array<{ topic: string; count: number }> {
    const keywordCounts: Record<string, number> = {};
    
    const commonKeywords = [
      'service', 'quality', 'price', 'staff', 'clean', 'food', 'atmosphere',
      'location', 'wait', 'time', 'friendly', 'professional', 'recommend',
      'excellent', 'great', 'good', 'bad', 'poor', 'slow', 'fast', 'delicious',
      'ambiance', 'parking', 'wifi', 'music', 'decor', 'comfortable', 'value',
      'experience', 'customer', 'management', 'environment'
    ];
    
    reviews.forEach((review: any) => {
      const text = (review.review_text || review.comment || review.comment_text || '').toLowerCase();
      
      commonKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        }
      });
    });
    
    // Return top keywords sorted by frequency
    return Object.entries(keywordCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

/**
 * Analyze sentiment of review text
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Simple sentiment analysis based on keywords and rating
  // In production, you might want to use a more sophisticated NLP service
  
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveKeywords = [
    'excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'best',
    'perfect', 'outstanding', 'awesome', 'superb', 'delicious', 'friendly',
    'helpful', 'professional', 'recommend', 'highly', 'satisfied', 'happy'
  ];
  
  // Negative keywords
  const negativeKeywords = [
    'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor', 'disappointed',
    'disgusting', 'rude', 'slow', 'dirty', 'unprofessional', 'waste', 'avoid',
    'never', 'worst', 'hate', 'complaint', 'unsatisfied', 'unhappy'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) positiveCount++;
  });
  
  negativeKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) negativeCount++;
  });
  
  // Determine sentiment
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: 0.7 + (positiveCount * 0.1) };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: 0.3 - (negativeCount * 0.1) };
  } else {
    return { sentiment: 'neutral', score: 0.5 };
  }
}

/**
 * Extract keywords/topics from reviews
 */
export async function extractKeywords(reviews: GMBReview[]): Promise<string[]> {
  const keywordCounts: Record<string, number> = {};
  
  const commonKeywords = [
    'service', 'quality', 'price', 'staff', 'clean', 'food', 'atmosphere',
    'location', 'wait', 'time', 'friendly', 'professional', 'recommend',
    'excellent', 'great', 'good', 'bad', 'poor', 'slow', 'fast', 'delicious',
    'ambiance', 'parking', 'wifi', 'music', 'decor', 'comfortable', 'value',
    'experience', 'customer', 'management', 'environment'
  ];
  
  reviews.forEach(review => {
    const text = (review.review_text || review.comment || '').toLowerCase();
    
    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      }
    });
  });
  
  // Return top keywords sorted by frequency
  return Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);
}

/**
 * Generate AI response for a review
 * This is a placeholder - actual implementation should call the API
 */
export async function generateResponse(review: GMBReview): Promise<string> {
  // This should call the /api/reviews/ai-response endpoint
  // For now, return a placeholder
  throw new Error('Use the API endpoint /api/reviews/ai-response instead');
}

/**
 * Calculate statistics from reviews
 */
export async function calculateStats(reviews: GMBReview[]): Promise<Stats> {
  const totalReviews = reviews.length;
  const respondedReviews = reviews.filter(r => 
    r.reply_text || r.review_reply
  ).length;
  
  const responseRate = totalReviews > 0 
    ? Math.round((respondedReviews / totalReviews) * 100) 
    : 0;
  
  const avgTime = 30; // Default mock value in hours
  
  const pending = reviews.filter(r => 
    !r.reply_text && !r.review_reply
  ).length;
  
  return {
    pending,
    responseRate,
    avgTime
  };
}

