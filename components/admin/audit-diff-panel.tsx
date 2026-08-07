'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface AuditDiffPanelProps {
  diff: unknown;
}

export function AuditDiffPanel({ diff }: AuditDiffPanelProps) {
  const t = useTranslations('admin.auditLog');
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-blue"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <ChevronDown
          className={cn('h-4 w-4 motion-safe:transition-transform', expanded && 'rotate-180')}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        {expanded ? t('hideDiff') : t('showDiff')}
      </button>
      {expanded ? (
        <Card className="mt-2">
          <CardContent className="p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[13px] text-body">
              {JSON.stringify(diff, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
