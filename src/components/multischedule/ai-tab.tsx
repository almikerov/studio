
'use client';

import { AiScheduleParser } from '@/components/multischedule/ai-schedule-parser';

export function AiTab(props: any) {
  const { handleAiParse, isLoading, onScheduleParsed } = props;

  const handleParse = async (text: string) => {
    await handleAiParse(text);
    if (onScheduleParsed) {
      onScheduleParsed();
    }
  };

  return (
    <div className="space-y-8">
        <AiScheduleParser onParse={handleParse} isLoading={isLoading} />
    </div>
  );
}

    