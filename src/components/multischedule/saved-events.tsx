'use client';

import type { SavedEvent } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ScheduleEventIcon } from './schedule-event-icons';

interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAdd: (event: SavedEvent) => void;
  onDelete: (id: string) => void;
}

export function SavedEvents({ savedEvents, onAdd, onDelete }: SavedEventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Сохраненные события</CardTitle>
      </CardHeader>
      <CardContent>
        {savedEvents.length > 0 ? (
          <ul className="space-y-2">
            {savedEvents.map(event => (
              <li key={event.id} className="group flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50">
                <div className="w-8 h-8 flex items-center justify-center">
                    {event.icon ? <ScheduleEventIcon icon={event.icon} className="h-5 w-5 text-muted-foreground" /> : <div className="h-5 w-5" />}
                </div>
                <p className="flex-1 text-sm">{event.description}</p>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onAdd(event)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDelete(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Нет сохраненных событий</p>
            <p className="text-xs">Вы можете сохранять события из расписания, чтобы быстро добавлять их.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
