
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AiScheduleParserProps {
  onParse: (text: string) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export function AiScheduleParser({ onParse, isLoading, onClose }: AiScheduleParserProps) {
  const [text, setText] = useState('');

  const handleParseClick = async () => {
    if (!text.trim()) {
      console.error('Error: Please enter text to parse.');
      return;
    }
    await onParse(text);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-6">
        <DialogTitle className="text-2xl font-bold">ИИ-редактор</DialogTitle>
        <DialogDescription className="mt-2">Вставьте или напишите свое расписание в свободной форме, и ИИ автоматически его структурирует.</DialogDescription>
      </DialogHeader>

      <div className="flex-1 px-6">
        <Textarea
          placeholder="например: 10:00 встреча, 13:00 обед, потом купить билеты..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="h-full resize-none text-base"
          disabled={isLoading}
        />
      </div>

      <div className="p-6 border-t">
        <Button onClick={handleParseClick} disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Генерация...' : 'Сгенерировать расписание'}
        </Button>
      </div>
    </div>
  );
}
