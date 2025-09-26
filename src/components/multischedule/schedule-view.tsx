
'use client';

import { useState, type ReactNode, useRef, useEffect } from 'react';
import type { ScheduleItem } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical, Bookmark, CalendarIcon, Palette, Clock, MessageSquare, SquareDashed, ImagePlus } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { EditableField } from './editable-field';
import { ImageUploader } from './image-uploader';
import Image from 'next/image';
import { IconDropdown } from './icon-dropdown';
import { IconName, ScheduleEventIcon } from './schedule-event-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const ITEM_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateEvent: (id: string, updatedValues: Partial<Omit<ScheduleItem, 'id'>>) => void;
  onDeleteEvent: (id: string) => void;
  onAddNewEvent: () => void;
  cardTitle: string;
  setCardTitle: (title: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  onSaveEvent: (item: ScheduleItem) => void;
  comment: string;
  setComment: (comment: string) => void;
}

export function ScheduleView({ schedule, onUpdateEvent, onDeleteEvent, onAddNewEvent, cardTitle, setCardTitle, selectedDate, setSelectedDate, imageUrl, setImageUrl, onSaveEvent, comment, setComment }: ScheduleViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const editRowRef = useRef<HTMLDivElement>(null);
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editingId && !isPopoverOpen && editRowRef.current && !editRowRef.current.contains(event.target as Node)) {
        handleSave(editingId);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingId, editedTime, editedDescription, isPopoverOpen]);


  const handleEdit = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditedTime(item.time);
    setEditedDescription(item.description);
  };

  const handleSave = (id: string) => {
    const item = schedule.find(i => i.id === id);
    if (item) {
        onUpdateEvent(id, { time: editedTime, description: editedDescription });
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
    onUpdateEvent(id, { icon });
  }

  const handleColorChange = (id: string, color: string | undefined) => {
    onUpdateEvent(id, { color });
  }

  const handleToggleUntimed = (id: string, isUntimed: boolean) => {
    onUpdateEvent(id, { isUntimed });
  }

  const renderScheduleList = (items: ScheduleItem[], droppableId: string) => (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
          {items.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided, snapshot) => (
                <li
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={cn(
                    'group flex items-center gap-2 p-2 rounded-md hover:bg-secondary/50',
                    snapshot.isDragging ? 'bg-secondary shadow-lg' : '',
                    item.color && !snapshot.isDragging ? `bg-${item.color}-100 dark:bg-${item.color}-900/30` : ''
                  )}
                >
                   <div {...provided.dragHandleProps} data-drag-handle className="cursor-grab active:cursor-grabbing p-2">
                     <GripVertical className="h-5 w-5 text-muted-foreground" />
                   </div>

                  {editingId === item.id ? (
                    <div ref={editRowRef} className="flex items-center gap-2 flex-1">
                      <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} onOpenChange={setIsPopoverOpen} />
                      
                      {!item.isUntimed && (
                        <Input
                          type="time"
                          value={editedTime}
                          onChange={(e) => setEditedTime(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          className="w-28"
                        />
                      )}
                      <Input
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                        className="flex-1"
                        autoFocus
                      />

                      <Popover onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon"><Palette className="h-4 w-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex gap-1">
                            <Button variant={!item.color ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleColorChange(item.id, undefined)}>
                                <div className="h-4 w-4 rounded-full border" />
                            </Button>
                            {ITEM_COLORS.map(color => (
                              <Button key={color} variant={item.color === color ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleColorChange(item.id, color)}>
                                <div className={`h-4 w-4 rounded-full bg-${color}-500`} />
                              </Button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon"><Clock className="h-4 w-4" /></Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4">
                           <div className="flex items-center space-x-2">
                            <Switch id={`untimed-switch-${item.id}`} checked={item.isUntimed} onCheckedChange={(checked) => handleToggleUntimed(item.id, checked)} />
                            <Label htmlFor={`untimed-switch-${item.id}`}>Событие без времени</Label>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button onClick={() => handleSave(item.id)} size="sm">Сохранить</Button>
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
                      
                      {!item.isUntimed ? (
                          <div onClick={() => handleEdit(item)} className="p-1 rounded-md cursor-pointer">
                              <p className="font-mono text-base font-semibold w-24 text-center">
                                  {item.time}
                              </p>
                          </div>
                       ) : (
                          <div className="w-24 flex justify-center items-center">
                             <SquareDashed className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                       )}

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
  )

  return (
    <Card className="shadow-lg overflow-hidden relative">
       {/* These are for tailwind to detect and generate dynamic classes */}
       <div className="hidden bg-red-100 dark:bg-red-900/30 bg-orange-100 dark:bg-orange-900/30 bg-yellow-100 dark:bg-yellow-900/30 bg-green-100 dark:bg-green-900/30 bg-blue-100 dark:bg-blue-900/30 bg-purple-100 dark:bg-purple-900/30"></div>
       <div className="hidden bg-red-500 bg-orange-500 bg-yellow-500 bg-green-500 bg-blue-500 bg-purple-500"></div>

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
                <ImageUploader onSetImageUrl={setImageUrl}>
                  {imageUrl ? (
                    <div className="relative w-24 h-24 rounded-md overflow-hidden cursor-pointer group/image">
                       <Image
                          src={imageUrl}
                          alt="Schedule image"
                          fill
                          className="object-cover"
                      />
                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                            <ImagePlus className="h-8 w-8 text-white" />
                       </div>
                    </div>
                  ) : <Button variant="ghost" size="icon" id="image-uploader-trigger"><ImagePlus className="h-5 w-5" /></Button>}
                </ImageUploader>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {schedule.length > 0 ? (
          <div className="space-y-4">
            {renderScheduleList(schedule, 'schedule')}
             <div id="comments-container">
                <hr className="my-4"/>
                <div className="px-2 pt-2">
                  <Label htmlFor="comments" className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Комментарии
                  </Label>
                  <Textarea 
                    id="comments"
                    placeholder="Добавьте заметки..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="text-sm"
                  />
                </div>
            </div>
          </div>
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
