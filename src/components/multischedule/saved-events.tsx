'use client';

import { useState } from 'react';
import type { SavedEvent } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { ScheduleEventIcon } from './schedule-event-icons';

interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAdd: (event: SavedEvent) => void;
  onDelete: (id: string) => void;
  onUpdate: (event: SavedEvent) => void;
}

export function SavedEvents({ savedEvents, onAdd, onDelete, onUpdate }: SavedEventsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEvent, setEditedEvent] = useState<SavedEvent | null>(null);

  const startEditing = (event: SavedEvent) => {
    setEditingId(event.id);
    setEditedEvent({ ...event });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedEvent(null);
  };

  const saveChanges = () => {
    if (editedEvent) {
      onUpdate(editedEvent);
    }
    cancelEditing();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, description: e.target.value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сохраненные события</CardTitle>
      </CardHeader>
      <CardContent>
        {savedEvents.length > 0 ? (
          <ul className="space-y-4">
            {savedEvents.map(event => (
              <li key={event.id} className="group flex flex-col gap-2 p-3 rounded-md bg-secondary/30">
                {editingId === event.id && editedEvent ? (
                  <div className="space-y-3">
                    <Input value={editedEvent.description} onChange={handleDescriptionChange} placeholder="Описание события" />
                    <div className="flex justify-end gap-2">
                       <Button onClick={saveChanges} size="sm"><Save className="mr-2 h-4 w-4" />Сохранить</Button>
                       <Button onClick={cancelEditing} size="sm" variant="ghost">Отмена</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    {event.icon && <ScheduleEventIcon icon={event.icon} className="h-5 w-5 mt-0.5 text-muted-foreground" />}
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{event.description}</p>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => startEditing(event)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => onAdd(event)}><Plus className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                )}
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
