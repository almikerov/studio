
'use client';

import { useState, type ReactNode, useRef, useEffect } from 'react';
import type { ScheduleItem } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical, Bookmark, CalendarIcon } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { EditableField } from './editable-field';
import { ImageUploader } from './image-uploader';
import Image from 'next/image';
import { IconDropdown } from './icon-dropdown';
import { IconName, ScheduleEventIcon } from './schedule-event-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateEvent: (id: string, time: string, description: string, icon?: IconName) => void;
  onDeleteEvent: (id: string) => void;
  onAddNewEvent: () => void;
  cardTitle: string;
  setCardTitle: (title: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  onSaveEvent: (item: ScheduleItem) => void;
}

export function ScheduleView({ schedule, onUpdateEvent, onDeleteEvent, onAddNewEvent, cardTitle, setCardTitle, selectedDate, setSelectedDate, imageUrl, setImageUrl, onSaveEvent }: ScheduleViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const editRowRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editingId && editRowRef.current && !editRowRef.current.contains(event.target as Node)) {
        // Check if the click is outside the popover as well
        const popover = document.querySelector('[data-radix-popover-content-wrapper]');
        if (!popover || !popover.contains(event.target as Node)) {
           handleSave(editingId);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingId, editedTime, editedDescription]);


  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditedTime(item.time);
    setEditedDescription(item.description);
  };

  const handleSave = (id: string) => {
    const item = schedule.find(i => i.id === id);
    if (item) {
        onUpdateEvent(id, editedTime, editedDescription, item.icon);
    }
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

  const handleIconChange = (id: string, icon: IconName | undefined) => {
    const item = schedule.find(i => i.id === id);
    if(item) {
        onUpdateEvent(id, item.time, item.description, icon);
        setEditingId(null); // Exit edit mode
    }
  }

  return (
    <Card className="shadow-lg overflow-hidden relative">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <EditableField as="h2" value={cardTitle} setValue={setCardTitle} className="text-2xl font-semibold leading-none tracking-tight" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="text-sm text-muted-foreground mt-1.5 px-2 py-1 h-auto justify-start font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      План на {format(selectedDate, 'PPP', { locale: ru })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center gap-2">
              {imageUrl ? (
                  <div className="relative w-24 h-24 rounded-md overflow-hidden cursor-pointer" onClick={() => {
                    // This is a workaround to trigger the dialog
                    const trigger = document.getElementById('image-uploader-trigger');
                    if (trigger) trigger.click();
                  }}>
                     <Image
                        src={imageUrl}
                        alt="Schedule image"
                        fill
                        className="object-cover"
                    />
                  </div>
              ) : null}
              <ImageUploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
            </div>
        </div>
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
                         <div {...provided.dragHandleProps} data-drag-handle className="cursor-grab active:cursor-grabbing p-2">
                           <GripVertical className="h-5 w-5 text-muted-foreground" />
                         </div>

                        {editingId === item.id ? (
                          <div ref={editRowRef} className="flex items-center gap-2 flex-1">
                            <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} />
                            <Input
                              type="time"
                              value={editedTime}
                              onChange={(e) => setEditedTime(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.id)}
                              className="w-28"
                            />
                            <Input
                              value={editedDescription}
                              onChange={(e) => setEditedDescription(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.id)}
                              className="flex-1"
                              autoFocus
                            />
                            <Button onClick={() => handleSave(item.id)} size="sm">Сохранить</Button>
                            <Button onClick={handleCancel} size="sm" variant="ghost">Отмена</Button>
                          </div>
                        ) : (
                          <>
                            <div className="w-8 h-8 flex items-center justify-center cursor-pointer" onClick={() => handleEdit(item)}>
                                {item.icon ? (
                                    <ScheduleEventIcon icon={item.icon} className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <div className="w-5 h-5" />
                                )}
                            </div>
                            <div onClick={() => handleEdit(item)} className="p-1 rounded-md cursor-pointer">
                                <p className="font-mono text-base font-semibold w-24 text-center">
                                    {item.time}
                                </p>
                            </div>
                            <p className="flex-1 text-card-foreground cursor-pointer" onClick={() => handleEdit(item)}>
                              {item.description}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => onSaveEvent(item)}
                              aria-label={`Save event: ${item.description}`}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
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
      <CardFooter id="card-footer">
        <Button onClick={onAddNewEvent} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Добавить новое событие
        </Button>
      </CardFooter>
    </Card>
  );
}
