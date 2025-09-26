'use client';

import type { SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle } from 'lucide-react';

interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAddSavedEvent: (description: string) => void;
}

export function SavedEvents({ savedEvents, onAddSavedEvent }: SavedEventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сохраненные события</CardTitle>
        <CardDescription>Быстро добавляйте часто используемые события.</CardDescription>
      </CardHeader>
      <CardContent>
        {savedEvents.length > 0 ? (
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {savedEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                  <span className="text-sm text-secondary-foreground">{event.description}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-accent-foreground"
                    onClick={() => onAddSavedEvent(event.description)}
                    aria-label={`Add ${event.description}`}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            <p>Нет сохраненных событий.</p>
            <p>Создайте событие и отметьте "Сохранить", чтобы оно появилось здесь.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
