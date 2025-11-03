'use client';

import { QuestionsList } from '@/components/questions/questions-list';

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Questions & Answers</h1>
        <p className="text-muted-foreground mt-2">
          Manage customer questions and answers
        </p>
      </div>

      <QuestionsList />
    </div>
  );
}

