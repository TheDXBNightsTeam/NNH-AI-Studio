'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, FileDown, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

interface ExportShareBarProps {
  getShareParams: () => Record<string, string | number | undefined>;
  printRootSelector?: string; // CSS selector for print root, default: '[data-print-root]'
  locale?: string;
}

export function ExportShareBar({ getShareParams, printRootSelector = '[data-print-root]', locale = 'en' }: ExportShareBarProps) {
  const isArabic = locale === 'ar';
  const [copied, setCopied] = useState(false);
  const printing = useRef(false);

  const handleExportPDF = async () => {
    try {
      // Native print flow: users can Save as PDF
      printing.current = true;
      window.print();
      setTimeout(() => { printing.current = false; }, 1000);
    } catch (e) {
      console.error('Print error:', e);
      toast.error(isArabic ? 'فشل التصدير' : 'Export failed');
    }
  };

  const handleShare = async () => {
    try {
      const url = new URL(window.location.href);
      const params = getShareParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
      const shareUrl = url.toString();
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(isArabic ? 'تم نسخ رابط المشاركة' : 'Share link copied');
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Share link error:', e);
      toast.error(isArabic ? 'تعذر نسخ الرابط' : 'Failed to copy link');
    }
  };

  return (
    <Card className="p-4 flex items-center justify-between border border-muted/50">
      <div className="text-sm text-muted-foreground">
        {isArabic ? 'صدّر التقرير أو شاركه مع فريقك' : 'Export the report or share with your team'}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleShare}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
          {copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ الرابط' : 'Copy Link')}
        </Button>
        <Button size="sm" onClick={handleExportPDF}>
          <FileDown className="w-4 h-4 mr-2" />
          {isArabic ? 'تصدير PDF' : 'Export PDF'}
        </Button>
      </div>
    </Card>
  );
}
