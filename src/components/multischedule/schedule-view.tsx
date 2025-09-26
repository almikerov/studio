'use client';

import { useState } from 'react';
import type { ScheduleItem } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateEvent: (id: number, time: string, description: string) => void;
  onDeleteEvent: (id: number) => void;
  onMoveEvent: (id: number, direction: 'up' | 'down') => void;
  onAddNewEvent: () => void;
}

export function ScheduleView({ schedule, onUpdateEvent, onDeleteEvent, onMoveEvent, onAddNewEvent }: ScheduleViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditedTime(item.time);
    setEditedDescription(item.description);
  };

  const handleSave = (id: number) => {
    onUpdateEvent(id, editedTime, editedDescription);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Расписание на день</CardTitle>
        <CardDescription>Ваш план на сегодня. Нажмите на событие, чтобы редактировать.</CardDescription>
      </CardHeader>
      <CardContent>
        {schedule.length > 0 ? (
          <ul className="space-y-2">
            {schedule.map((item, index) => (
              <li key={item.id} className="group flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50">
                <div className="flex flex-col gap-1">
                   <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-accent-foreground disabled:opacity-30"
                    onClick={() => onMoveEvent(item.id, 'up')}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                   <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-accent-foreground disabled:opacity-30"
                    onClick={() => onMoveEvent(item.id, 'down')}
                    disabled={index === schedule.length - 1}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {editingId === item.id ? (
                  <>
                    <Input
                      type="time"
                      value={editedTime}
                      onChange={(e) => setEditedTime(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className="w-28"
                      autoFocus
                    />
                    <Input
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className="flex-1"
                    />
                    <Button onClick={() => handleSave(item.id)} size="sm">Сохранить</Button>
                    <Button onClick={handleCancel} size="sm" variant="ghost">Отмена</Button>
                  </>
                ) : (
                  <>
                    <div className="font-mono text-base font-semibold text-primary-foreground bg-primary rounded-md px-3 py-1 w-24 text-center cursor-pointer" onClick={() => handleEdit(item)}>
                      {item.time}
                    </div>
                    <p className="flex-1 text-card-foreground cursor-pointer" onClick={() => handleEdit(item)}>
                      {item.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteEvent(item.id)}
                      aria-label={`Delete event: ${item.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg font-semibold">Ваше расписание пусто</p>
            <p>Добавьте события, чтобы начать планировать свой день.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onAddNewEvent} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Добавить новое событие
        </Button>
      </CardFooter>
    </Card>
  );
}
