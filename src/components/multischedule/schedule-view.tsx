'use client';

import { useState, type ReactNode } from 'react';
import type { ScheduleItem } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { EditableField } from './editable-field';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateEvent: (id: string, time: string, description: string) => void;
  onDeleteEvent: (id: string) => void;
  onAddNewEvent: () => void;
  cardTitle: string;
  setCardTitle: (title: string) => void;
  cardDescription: string;
  setCardDescription: (desc: string) => void;
  children?: ReactNode;
}

export function ScheduleView({ schedule, onUpdateEvent, onDeleteEvent, onAddNewEvent, cardTitle, setCardTitle, cardDescription, setCardDescription, children }: ScheduleViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditedTime(item.time);
    setEditedDescription(item.description);
  };

  const handleSave = (id: string) => {
    onUpdateEvent(id, editedTime, editedDescription);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleSave(id);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }

  return (
    <Card className="shadow-lg overflow-hidden">
      {children}
      <CardHeader>
        <EditableField as="h2" value={cardTitle} setValue={setCardTitle} className="text-2xl font-semibold leading-none tracking-tight" />
        <EditableField as="p" value={cardDescription} setValue={setCardDescription} className="text-sm text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {schedule.length > 0 ? (
          <Droppable droppableId="schedule">
            {(provided) => (
              <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                {schedule.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`group flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50 ${snapshot.isDragging ? 'bg-secondary shadow-lg' : ''}`}
                      >
                         <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-2">
                           <GripVertical className="h-5 w-5 text-muted-foreground" />
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
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
