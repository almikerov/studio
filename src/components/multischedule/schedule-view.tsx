

'use client';

import { useState, type ReactNode, useRef, useEffect } from 'react';
import type { ScheduleItem, SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical, Bookmark, Palette, Save, ImagePlus, X, Check, ArrowUp, ArrowDown, Menu, ChevronDown } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { EditableField } from './editable-field';
import { ImageUploader } from './image-uploader';
import Image from 'next/image';
import { IconDropdown } from './icon-dropdown';
import { IconName, ScheduleEventIcon } from './schedule-event-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  onAddNewEvent: (fromSaved?: Partial<ScheduleItem>) => void;
  cardTitle: string;
  setCardTitle: (title: string) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  onSaveEvent: (item: Partial<ScheduleItem>) => void;
  editingEvent: ScheduleItem | null;
  handleOpenEditModal: (item: ScheduleItem) => void;
  handleCloseEditModal: () => void;
  isMobile: boolean | undefined;
  onMoveEvent: (index: number, direction: 'up' | 'down') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isAddEventDialogOpen: boolean;
  setIsAddEventDialogOpen: (open: boolean) => void;
}

export function ScheduleView({ 
  schedule, onUpdateEvent, onDeleteEvent, onAddNewEvent, cardTitle, setCardTitle, 
  imageUrl, setImageUrl, onSaveEvent, 
  editingEvent, handleOpenEditModal, handleCloseEditModal,
  isMobile, onMoveEvent, setIsMobileMenuOpen, isAddEventDialogOpen, setIsAddEventDialogOpen
}: ScheduleViewProps) {
  const editRowRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedType, setEditedType] = useState<ScheduleItem['type']>('timed');
  const [editedDate, setEditedDate] = useState<Date | undefined>(new Date());
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);


  useEffect(() => {
    if (editingEvent) { // For mobile modal
        setEditedTime(editingEvent.time);
        setEditedDescription(editingEvent.description);
        setEditedType(editingEvent.type);
        if (editingEvent.type === 'date' && editingEvent.date) {
            setEditedDate(new Date(editingEvent.date));
        }
    }
  }, [editingEvent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      const popper = document.querySelector('[data-radix-popper-content-wrapper]');
      if (popper && popper.contains(target)) {
        return;
      }

      if (editRowRef.current && !editRowRef.current.contains(target)) {
        if (editingId) {
          handleSave(editingId);
        }
      }
    };

    if (editingId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingId, editRowRef, editedTime, editedDescription, editedType, editedDate]);

  const handleEdit = (item: ScheduleItem) => {
    if (isMobile) {
      handleOpenEditModal(item);
    } else {
      if (editingId) { // Save previous before editing new one
        handleSave(editingId);
      }
      setEditingId(item.id);
      setEditedTime(item.time);
      setEditedDescription(item.description);
      setEditedType(item.type);
      if (item.type === 'date' && item.date) {
        setEditedDate(new Date(item.date));
      }
    }
  };

  const handleSave = (id: string) => {
    onUpdateEvent(id, { 
      time: editedType === 'timed' ? editedTime : '', 
      description: editedDescription,
      type: editedType,
      date: editedType === 'date' && editedDate ? editedDate.toISOString() : undefined,
    });
    
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
    if(isMobile) {
      setIsIconPopoverOpen(false);
    }
  }

  const handleColorChange = (id: string, color: string | undefined) => {
    onUpdateEvent(id, { color });
  }
  
  const handleTypeChange = (id: string, type: ScheduleItem['type']) => {
    const currentTime = schedule.find(i => i.id === id)?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTime = type === 'timed' ? currentTime : '';
    
    const updatePayload: Partial<ScheduleItem> = { type, time: newTime };
    if (type === 'date') {
        updatePayload.date = new Date().toISOString();
    }

    if (!isMobile && editingId === id) {
        onUpdateEvent(id, { ...updatePayload, description: editedDescription });
        setEditingId(null);
    } else {
        onUpdateEvent(id, updatePayload);
    }

    if (isMobile && editingEvent?.id === id) {
        setEditedType(type);
    }
  };

  const handleAddNewEventAndEdit = () => {
    const newId = Date.now().toString() + Math.random();
    onAddNewEvent({id: newId, type: 'timed'});
    setLastAdded(newId);
  }

  useEffect(() => {
    if (lastAdded && !isMobile) {
      const itemToEdit = schedule.find(item => item.id === lastAdded);
      if (itemToEdit) {
        handleEdit(itemToEdit);
      }
      setLastAdded(null);
    }
  }, [schedule, lastAdded, isMobile]);


  const renderEditContent = (item: ScheduleItem) => {
    const handleSaveToPreset = () => {
        const eventToSave: Partial<ScheduleItem> = {
            id: item.id,
            description: editedDescription,
            icon: item.icon,
            color: item.color,
            time: editedType === 'timed' ? editedTime : '',
            type: editedType,
        };
        onSaveEvent(eventToSave);
        handleCloseEditModal();
    };

    return (
        <div className="flex flex-col gap-4 p-1">
            <div className="flex items-center gap-2">
                {editedType !== 'comment' && editedType !== 'date' && <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen} />}
                {editedType !== 'date' && 
                    <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="flex-1 text-lg"
                        rows={editedType === 'comment' ? 3 : 1}
                    />
                }
            </div>

            <div className="flex items-center gap-4 justify-between p-2 rounded-lg bg-secondary/50">
                <Label htmlFor={`type-select-native-${item.id}`} className="text-base font-normal">Тип события</Label>
                <div className="relative">
                    <select
                        id={`type-select-native-${item.id}`}
                        value={editedType}
                        onChange={(e) => handleTypeChange(item.id, e.target.value as ScheduleItem['type'])}
                        className="appearance-none w-full bg-transparent pr-8 text-right font-medium"
                    >
                        <option value="timed">Со временем</option>
                        <option value="untimed">Без времени</option>
                        <option value="date">Дата</option>
                        <option value="h1">Заголовок H1</option>
                        <option value="h2">Заголовок H2</option>
                        <option value="h3">Заголовок H3</option>
                        <option value="comment">Комментарий</option>
                    </select>
                    <ChevronDown className="h-4 w-4 opacity-50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            
            {editedType === 'date' && (
              <>
                <Calendar
                    mode="single"
                    selected={editedDate}
                    onSelect={(date) => {
                        setEditedDate(date);
                        if (date) {
                            onUpdateEvent(item.id, { date: date.toISOString() });
                        }
                    }}
                    className="rounded-md border"
                    />
                <Textarea 
                    placeholder="Описание (необязательно)"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="text-base"
                />
              </>
            )}

            { editedType === 'timed' && (
                <Input
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="w-full text-lg h-12"
                />
            )}
        
            { !['comment', 'date', 'h1', 'h2', 'h3'].includes(editedType) && (
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
            )}

            <div className="flex gap-2 mt-4">
                <Button onClick={handleSaveToPreset} variant="outline" className="w-full" size="lg"><Bookmark /></Button>
                <Button onClick={() => { onDeleteEvent(item.id); handleCloseEditModal(); }} variant="destructive" className="w-full" size="lg"><Trash2 /></Button>
            </div>
            <Button onClick={() => handleSave(item.id)} className="w-full" size="lg"><Check className="mr-2"/>Сохранить и закрыть</Button>
        </div>
    );
  };



  return (
    <Card className="shadow-lg overflow-hidden relative border-none sm:border sm:rounded-lg">
       {/* These are for tailwind to detect and generate dynamic classes */}
       <div className="hidden bg-red-100 dark:bg-red-900/30 bg-orange-100 dark:bg-orange-900/30 bg-yellow-100 dark:bg-yellow-900/30 bg-green-100 dark:bg-green-900/30 bg-blue-100 dark:bg-blue-900/30 bg-purple-100 dark:bg-purple-900/30"></div>
       <div className="hidden bg-red-500 bg-orange-500 bg-yellow-500 bg-green-500 bg-blue-500 bg-purple-500"></div>

      <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <EditableField as="h1" value={cardTitle} setValue={setCardTitle} className="text-2xl font-bold leading-none tracking-tight" />
            </div>
            <div className="flex items-center gap-2">
                {isMobile && (
                    <Button variant="ghost" size="icon" id="mobile-menu-trigger" data-no-print="true" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu />
                    </Button>
                )}
                <div className="relative">
                    <ImageUploader onSetImageUrl={setImageUrl} onOpenChange={isMobile ? (open) => { if (!open) setIsMobileMenuOpen(false) } : undefined}>
                        <div className="absolute inset-0 cursor-pointer" data-no-print="true" />
                    </ImageUploader>
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt="Schedule image"
                            width={isMobile ? 80 : 96}
                            height={isMobile ? 80 : 96}
                            className="object-cover rounded-md aspect-square"
                            crossOrigin="anonymous"
                        />
                    ) : (
                         <div className={cn("bg-secondary rounded-md flex items-center justify-center aspect-square cursor-pointer", isMobile ? "w-20 h-20" : "w-24 h-24")}>
                           <ImagePlus className="h-8 w-8 text-muted-foreground" />
                        </div>
                    )}
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent data-schedule-content className="p-4 sm:p-6 pt-2 sm:pt-4">
          <Droppable droppableId="schedule" isDropDisabled={!!isMobile}>
            {(provided) => (
              <div className="space-y-2 group/list" {...provided.droppableProps} ref={provided.innerRef}>
                {schedule.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!!isMobile}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'group/item flex items-center gap-2 p-2 rounded-md',
                          !isMobile && 'hover:bg-secondary/50',
                          snapshot.isDragging ? 'bg-secondary shadow-lg' : '',
                           item.color && !snapshot.isDragging && !['comment', 'date', 'h1', 'h2', 'h3'].includes(item.type) ? `bg-${item.color}-100 dark:bg-${item.color}-900/30` : ''
                        )}
                        onClick={() => editingId !== item.id && handleEdit(item)}
                      >
                         <div {...provided.dragHandleProps} data-drag-handle="true" className={cn("cursor-grab active:cursor-grabbing p-2 flex")}>
                           <GripVertical className="h-5 w-5 text-muted-foreground" />
                         </div>
                         
                         {isMobile && (
                            <Button data-mobile-arrow data-no-print="true" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={(e) => { e.stopPropagation(); onMoveEvent(index, 'up'); }}>
                                <ArrowUp className="h-5 w-5" />
                            </Button>
                         )}

                        {editingId === item.id && !isMobile ? (
                          <div ref={editRowRef} className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                {!['comment', 'date', 'h1', 'h2', 'h3'].includes(editedType) &&
                                  <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} />
                                }
                            
                                <Select value={editedType} onValueChange={(value) => handleTypeChange(item.id, value as ScheduleItem['type'])}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="timed">Со временем</SelectItem>
                                        <SelectItem value="untimed">Без времени</SelectItem>
                                        <SelectItem value="date">Дата</SelectItem>
                                        <SelectItem value="h1">Заголовок H1</SelectItem>
                                        <SelectItem value="h2">Заголовок H2</SelectItem>
                                        <SelectItem value="h3">Заголовок H3</SelectItem>
                                        <SelectItem value="comment">Комментарий</SelectItem>
                                    </SelectContent>
                                </Select>

                                {editedType === 'timed' &&
                                    <Input
                                    type="time"
                                    value={editedTime}
                                    onChange={(e) => setEditedTime(e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                                    className="w-24"
                                    autoFocus
                                    />
                                }

                                {editedType === 'date' && editedDate &&
                                  <div className="flex gap-2 items-center flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline">
                                                {format(editedDate, 'PPP', { locale: ru })}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={editedDate}
                                                onSelect={(date) => date && setEditedDate(date)}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input 
                                      value={editedDescription}
                                      onChange={(e) => setEditedDescription(e.target.value)}
                                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                                      placeholder="Описание (необязательно)"
                                      className="flex-1"
                                    />
                                  </div>
                                }
                            
                                {['timed', 'untimed', 'h1', 'h2', 'h3', 'comment'].includes(editedType) &&
                                    <Textarea
                                        value={editedDescription}
                                        onChange={(e) => setEditedDescription(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                                        className="flex-1"
                                        rows={1}
                                        autoFocus
                                    />
                                }

                                {!['comment', 'date', 'h1', 'h2', 'h3'].includes(editedType) &&
                                    <Popover>
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
                                }

                                <Button onClick={(e) => { e.stopPropagation(); handleSave(item.id);}} size="sm">Сохранить</Button>
                                <Button onClick={(e) => { e.stopPropagation(); handleCancel();}} size="sm" variant="ghost">Отмена</Button>
                          </div>
                        ) : (
                          <>
                            {item.type === 'comment' ? (
                                <p 
                                  className="flex-1 text-card-foreground text-sm italic text-muted-foreground p-2 rounded-md w-full"
                                >
                                  {item.description}
                                </p>
                            ) : item.type === 'date' && item.date ? (
                                <div className="flex items-center gap-2 flex-1 render-align-fix">
                                    <div className="flex flex-col">
                                        <span className='font-semibold text-lg text-muted-foreground'>{format(new Date(item.date), 'PPP', { locale: ru })}</span>
                                        {item.description && <span className="text-base font-normal text-muted-foreground -mt-1">{item.description}</span>}
                                    </div>
                                </div>
                            ) : item.type === 'h1' ? (
                                <div className="w-full flex items-center render-header-align-fix">
                                  <h2 className='text-xl font-bold'>{item.description}</h2>
                                </div>
                            ) : item.type === 'h2' ? (
                                <div className="w-full flex items-center render-header-align-fix">
                                  <h3 className='text-lg font-semibold'>{item.description}</h3>
                                </div>
                            ) : item.type === 'h3' ? (
                                <div className="w-full flex items-center render-header-align-fix">
                                  <h4 className='text-base font-medium'>{item.description}</h4>
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
                                    
                                    <div className="p-1 rounded-md cursor-pointer w-20 sm:w-auto text-center sm:text-left min-w-[5rem]">
                                      {item.type === 'timed' ? (
                                        <p className="font-mono text-base font-semibold">
                                            {item.time}
                                        </p>
                                      ) : (
                                        <div className="w-12" />
                                      )}
                                    </div>

                                    <p className="flex-1 text-card-foreground cursor-pointer truncate">
                                      {item.description}
                                    </p>
                                </>
                            )}
                            
                            <div data-no-print={isMobile ? "true" : undefined} className={cn("items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100", isMobile ? "hidden" : "flex")}>
                                {!['comment', 'date', 'h1', 'h2', 'h3'].includes(item.type) && (
                                    <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    onClick={(e) => { e.stopPropagation(); onSaveEvent(item); }}
                                    aria-label={`Save event: ${item.description}`}
                                    >
                                    <Bookmark className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); onDeleteEvent(item.id); }}
                                aria-label={`Delete event: ${item.description}`}
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            {isMobile && (
                                <Button data-mobile-arrow data-no-print="true" variant="ghost" size="icon" className="h-8 w-8" disabled={index === schedule.length - 1} onClick={(e) => { e.stopPropagation(); onMoveEvent(index, 'down'); }}>
                                    <ArrowDown className="h-5 w-5" />
                                </Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {!isMobile && (
                  <div className="h-10 flex justify-center items-center" data-no-print="true">
                    <Button
                      variant="ghost"
                      className="opacity-0 group-hover/list:opacity-100 transition-opacity w-full"
                      onClick={() => handleAddNewEventAndEdit()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        
        {schedule.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg font-semibold">Ваше расписание пусто</p>
            <p>Добавьте события, чтобы начать планировать свой день.</p>
          </div>
        )}
      </CardContent>
      <CardFooter id="card-footer" className={cn("gap-2 p-4 sm:p-6 justify-center", { "hidden": !isMobile })} data-no-print="true">
        <Button className="rounded-full h-16 w-16" size="icon" onClick={() => setIsAddEventDialogOpen(true)}><Plus className="h-8 w-8" /></Button>
      </CardFooter>

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

    

    











    