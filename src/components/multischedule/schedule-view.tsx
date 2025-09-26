

'use client';

import { useState, type ReactNode, useRef, useEffect } from 'react';
import type { ScheduleItem, SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical, Bookmark, CalendarIcon, Palette, MessageSquare, Save, ImagePlus, X, Check } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';


const ITEM_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateEvent: (id: string, updatedValues: Partial<Omit<ScheduleItem, 'id'>>) => void;
  onDeleteEvent: (id: string) => void;
  onAddNewEvent: (fromSaved?: SavedEvent) => void;
  cardTitle: string;
  setCardTitle: (title: string) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  onSaveEvent: (item: ScheduleItem) => void;
  comment: string;
  setComment: (comment: string) => void;
  onSaveTemplate: (name: string) => void;
  editingEvent: ScheduleItem | null;
  handleOpenEditModal: (item: ScheduleItem) => void;
  handleCloseEditModal: () => void;
  savedEvents: SavedEvent[];
  isMobile: boolean | undefined;
}

export function ScheduleView({ 
  schedule, onUpdateEvent, onDeleteEvent, onAddNewEvent, cardTitle, setCardTitle, 
  selectedDate, setSelectedDate, imageUrl, setImageUrl, onSaveEvent, comment, 
  setComment, onSaveTemplate, editingEvent, handleOpenEditModal, handleCloseEditModal,
  savedEvents, isMobile
}: ScheduleViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const editRowRef = useRef<HTMLDivElement>(null);
  const [templateName, setTemplateName] = useState('');
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (editingId && !isPopoverOpen && !isMobile && editRowRef.current && !editRowRef.current.contains(event.target as Node)) {
        handleSave(editingId);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingId, editedTime, editedDescription, isPopoverOpen, isMobile]);

  useEffect(() => {
    if (editingEvent) {
        setEditedTime(editingEvent.time);
        setEditedDescription(editingEvent.description);
    }
  }, [editingEvent]);


  const handleEdit = (item: ScheduleItem) => {
    if (isMobile) {
      handleOpenEditModal(item);
    } else {
      setEditingId(item.id);
      setEditedTime(item.time);
      setEditedDescription(item.description);
    }
  };

  const handleSave = (id: string) => {
    const item = schedule.find(i => i.id === id);
    if (item) {
        onUpdateEvent(id, { time: editedTime, description: editedDescription });
    }
    setEditingId(null);
    if (isMobile) {
      handleCloseEditModal();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    if (isMobile) {
      handleCloseEditModal();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
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
    onUpdateEvent(id, { isUntimed, time: isUntimed ? '' : editedTime || '00:00' });
    if(isUntimed) setEditedTime('');
  }

  const handleSaveTemplateClick = () => {
    if (templateName.trim()) {
      onSaveTemplate(templateName.trim());
      setTemplateName('');
      setIsSaveTemplateDialogOpen(false);
    }
  };

  const handleAddFromSavedClick = (event: SavedEvent) => {
    onAddNewEvent(event);
    setIsAddEventDialogOpen(false);
  }

  const handleAddNewBlankEvent = () => {
    onAddNewEvent();
    setIsAddEventDialogOpen(false);
  }

  const renderEditContent = (item: ScheduleItem) => (
    <div className="flex flex-col gap-4 p-1">
        <div className="flex items-center gap-2">
            <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} />
            <Input
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className="flex-1 text-lg"
              autoFocus
            />
        </div>

        <div className="flex items-center gap-4 justify-between p-2 rounded-lg bg-secondary/50">
            <Label htmlFor={`untimed-switch-${item.id}`} className="text-base font-normal">Без времени</Label>
            <Switch id={`untimed-switch-${item.id}`} checked={!!item.isUntimed} onCheckedChange={(checked) => handleToggleUntimed(item.id, checked)} />
        </div>

        {!item.isUntimed && (
            <Input
              type="time"
              value={editedTime}
              onChange={(e) => setEditedTime(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className="w-full text-lg h-12"
              disabled={!!item.isUntimed}
            />
        )}
      
        <div>
            <Label className="text-xs text-muted-foreground ml-1 mb-2">Цвет</Label>
            <div className="flex gap-2 justify-around">
              <Button variant={!item.color ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => handleColorChange(item.id, undefined)}>
                  <div className="h-6 w-6 rounded-full border" />
              </Button>
              {ITEM_COLORS.map(color => (
                <Button key={color} variant={item.color === color ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => handleColorChange(item.id, color)}>
                  <div className={`h-6 w-6 rounded-full bg-${color}-500`} />
                </Button>
              ))}
            </div>
        </div>

        <div className="flex gap-2 mt-4">
            <Button onClick={() => onDeleteEvent(item.id)} variant="destructive" className="w-full" size="lg"><Trash2 /></Button>
            <Button onClick={() => handleSave(item.id)} className="w-full" size="lg"><Check /></Button>
        </div>
    </div>
  );

  return (
    <Card className="shadow-lg overflow-hidden relative border-none sm:border sm:rounded-lg">
       {/* These are for tailwind to detect and generate dynamic classes */}
       <div className="hidden bg-red-100 dark:bg-red-900/30 bg-orange-100 dark:bg-orange-900/30 bg-yellow-100 dark:bg-yellow-900/30 bg-green-100 dark:bg-green-900/30 bg-blue-100 dark:bg-blue-900/30 bg-purple-100 dark:bg-purple-900/30"></div>
       <div className="hidden bg-red-500 bg-orange-500 bg-yellow-500 bg-green-500 bg-blue-500 bg-purple-500"></div>

      <CardHeader className="p-4 sm:p-6">
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
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden cursor-pointer group/image">
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
      <CardContent className="p-4 sm:p-6 pt-0">
          <Droppable droppableId="schedule">
            {(provided) => (
              <ul className="space-y-2" {...provided.droppableProps} ref={provided.innerRef}>
                {schedule.map((item, index) => (
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
                        onClick={() => handleEdit(item)}
                      >
                         <div {...provided.dragHandleProps} data-drag-handle className="cursor-grab active:cursor-grabbing p-2">
                           <GripVertical className="h-5 w-5 text-muted-foreground" />
                         </div>

                        {editingId === item.id && !isMobile ? (
                          <div ref={editRowRef} className="flex items-center gap-2 flex-1">
                            <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} onOpenChange={setIsPopoverOpen} />
                            
                            <div className="w-24">
                                <Input
                                  type="time"
                                  value={editedTime}
                                  onChange={(e) => setEditedTime(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, item.id)}
                                  className="w-full mb-1 disabled:opacity-50"
                                  disabled={!!item.isUntimed}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              <div className="flex items-center space-x-2 pl-1" onClick={(e) => e.stopPropagation()}>
                                <Switch id={`untimed-switch-${item.id}`} checked={!!item.isUntimed} onCheckedChange={(checked) => handleToggleUntimed(item.id, checked)} />
                                <Label htmlFor={`untimed-switch-${item.id}`} className="text-xs font-normal">Без времени</Label>
                              </div>
                            </div>
                            
                            <Input
                              value={editedDescription}
                              onChange={(e) => setEditedDescription(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, item.id)}
                              className="flex-1"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />

                            <Popover onOpenChange={setIsPopoverOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Palette className="h-4 w-4" /></Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-2" onClick={(e) => e.stopPropagation()}>
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

                            <Button onClick={(e) => { e.stopPropagation(); handleSave(item.id);}} size="sm">Сохранить</Button>
                          </div>
                        ) : (
                          <>
                            <div className="w-8 h-8 flex items-center justify-center cursor-pointer">
                                {item.icon ? (
                                    <ScheduleEventIcon icon={item.icon} className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <div className="w-5 h-5" />
                                )}
                            </div>
                            
                            <div className="p-1 rounded-md cursor-pointer w-20 sm:w-auto text-center sm:text-left">
                              {!item.isUntimed && (
                                <p className="font-mono text-base font-semibold">
                                    {item.time}
                                </p>
                              )}
                            </div>

                            <p className="flex-1 text-card-foreground cursor-pointer">
                              {item.description}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); onSaveEvent(item); }}
                              aria-label={`Save event: ${item.description}`}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); onDeleteEvent(item.id); }}
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
        
        {schedule.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg font-semibold">Ваше расписание пусто</p>
            <p>Добавьте события, чтобы начать планировать свой день.</p>
          </div>
        )}

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
      </CardContent>
      <CardFooter id="card-footer" className={cn("gap-2 p-4 sm:p-6", { "justify-center": isMobile })}>
        {isMobile ? (
          <>
            <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
              <DialogTrigger asChild>
                 <Button className="rounded-full h-16 w-16" size="icon"><Plus className="h-8 w-8" /></Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить событие</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    <Button variant="outline" className="w-full justify-start" onClick={handleAddNewBlankEvent}>
                        <Plus className="mr-4" /> Новое событие
                    </Button>
                    <p className="text-sm text-muted-foreground">Или выберите из заготовок:</p>
                    {savedEvents.length > 0 ? (
                        <ul className="space-y-2">
                            {savedEvents.map(event => (
                                <li key={event.id}>
                                    <Button variant="ghost" className="w-full justify-start gap-4" onClick={() => handleAddFromSavedClick(event)}>
                                        {event.icon ? <ScheduleEventIcon icon={event.icon} /> : <div className="w-4 h-4" />}
                                        {event.description}
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-center text-muted-foreground py-4 text-sm">Нет сохраненных заготовок</p>}
                  </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
              <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full h-16 w-16" size="icon"><Save className="h-7 w-7" /></Button>
              </DialogTrigger>
              <DialogContent>
                  <DialogHeader><DialogTitle>Сохранить шаблон</DialogTitle></DialogHeader>
                  <div className="py-4">
                      <Label htmlFor="template-name-mobile">Название шаблона</Label>
                      <Input id="template-name-mobile" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="например, 'День матча'" onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplateClick()} />
                  </div>
                  <DialogFooter><Button onClick={handleSaveTemplateClick} disabled={!templateName.trim()}>Сохранить</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <Button onClick={() => onAddNewEvent()} className="flex-1" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Добавить новое событие
            </Button>
            <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить шаблон
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Сохранить шаблон расписания</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="template-name">Название шаблона</Label>
                        <Input
                            id="template-name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="например, 'День матча'"
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplateClick()}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveTemplateClick} disabled={!templateName.trim()}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </>
        )}
      </CardFooter>

      {/* Mobile Edit Modal */}
      <Dialog open={isMobile && !!editingEvent} onOpenChange={(open) => !open && handleCloseEditModal()}>
          <DialogContent className="max-w-sm">
              <DialogHeader>
                  <DialogTitle>Редактировать событие</DialogTitle>
              </DialogHeader>
              {editingEvent && renderEditContent(editingEvent)}
          </DialogContent>
      </Dialog>
    </Card>
  );
}





    