
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AiScheduleParserProps {
  onParse: (text: string) => void;
  isLoading: boolean;
}

export function AiScheduleParser({ onParse, isLoading }: AiScheduleParserProps) {
  const [text, setText] = useState('');
  const { toast } = useToast();

  const handleParseClick = () => {
    if (!text.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите текст для анализа.',
        variant: 'destructive',
      });
      return;
    }
    onParse(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ИИ-редактор</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="например: 10:00 встреча, 13:00 обед, потом купить билеты..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          disabled={isLoading}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleParseClick} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Генерация...' : 'Сгенерировать расписание'}
        </Button>
      </CardFooter>
    </Card>
  );
}

    