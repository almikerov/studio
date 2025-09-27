
'use client';

import { useState } from 'react';
import type { SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Save, PlusCircle, Bookmark, Check, Palette, ChevronDown, CalendarIcon } from 'lucide-react';
import { ScheduleEventIcon, IconName } from './schedule-event-icons';
import { IconDropdown } from './icon-dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const ITEM_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];

interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAdd: (event: SavedEvent) => void;
  onDelete: (id: string) => void;
  onUpdate: (event: SavedEvent) => void;
  onClose: () => void;
}

export function SavedEvents({ savedEvents, onAdd, onDelete, onUpdate, onClose }: SavedEventsProps) {
  const [editingEvent, setEditingEvent] = useState<SavedEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // State for the editor
  const [editedDescription, setEditedDescription] = useState('');
  const [editedIcon, setEditedIcon] = useState<IconName | undefined>(undefined);
  const [editedTime, setEditedTime] = useState('');
  const [editedType, setEditedType] = useState<'timed' | 'untimed'>('timed');
  const [editedColor, setEditedColor] = useState<string | undefined>(undefined);
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);


  const startEditing = (event: SavedEvent) => {
    setEditingEvent(event);
    setEditedDescription(event.description);
    setEditedIcon(event.icon);
    setEditedTime(event.time || '');
    setEditedType(event.type);
    setEditedColor(event.color);
    setIsCreating(false);
  };
  
  const startCreating = () => {
    const newId = Date.now().toString();
    const newEvent: SavedEvent = {
        id: newId,
        description: 'Новое событие',
        icon: undefined,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'timed',
        color: undefined
    };
    onUpdate(newEvent);
    startEditing(newEvent);
    setIsCreating(true);
  }

  const cancelEditing = () => {
    if (isCreating && editingEvent) {
      onDelete(editingEvent.id);
    }
    setEditingEvent(null);
    setIsCreating(false);
  };

  const saveChanges = () => {
    if (editingEvent) {
      const updatedEvent: SavedEvent = {
        ...editingEvent,
        description: editedDescription,
        icon: editedIcon,
        time: editedType === 'timed' ? editedTime : undefined,
        type: editedType,
        color: editedColor,
      };
      onUpdate(updatedEvent);
    }
    setEditingEvent(null);
    setIsCreating(false);
  };
  
  const handleAddAndClose = (event: SavedEvent) => {
    onAdd(event);
    onClose();
  }


  const renderEditContent = () => {
    if (!editingEvent) return null;

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Создать заготовку' : 'Редактировать заготовку'}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 p-1">
            
            <div className="flex items-center gap-2">
                <IconDropdown value={editedIcon} onChange={setEditedIcon} open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen} />
                 <Input
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="flex-1 text-base h-10"
                    placeholder="Описание события"
                />
            </div>

            <div className="flex items-center gap-4 justify-between p-2 rounded-lg bg-secondary/50">
                <Label htmlFor={`type-select-native-${editingEvent.id}`} className="text-base font-normal">Тип события</Label>
                <div className="relative">
                    <select
                        id={`type-select-native-${editingEvent.id}`}
                        value={editedType}
                        onChange={(e) => setEditedType(e.target.value as 'timed' | 'untimed')}
                        className="appearance-none w-full bg-transparent pr-8 text-right font-medium"
                    >
                        <option value="timed">Со временем</option>
                        <option value="untimed">Без времени</option>
                    </select>
                    <ChevronDown className="h-4 w-4 opacity-50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            
            { editedType === 'timed' && (
                <Input
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="w-full text-lg h-12"
                />
            )}
        
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground ml-1">Цвет</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button variant={!editedColor ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => setEditedColor(undefined)}>
                      <div className="h-6 w-6 rounded-full border" />
                  </Button>
                  {ITEM_COLORS.map(color => (
                      <Button key={color} variant={editedColor === color ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => setEditedColor(color)}>
                      <div className={`h-6 w-6 rounded-full bg-${color}-500`} />
                      </Button>
                  ))}
                </div>
            </div>

            <DialogFooter className="mt-4">
               <Button onClick={cancelEditing} variant="ghost">Отмена</Button>
               <Button onClick={saveChanges}><Check className="mr-2"/>Сохранить</Button>
            </DialogFooter>
        </div>
      </DialogContent>
    );
  };


  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-6 border-b block sm:flex sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <DialogTitle className="text-2xl font-bold">Мои заготовки</DialogTitle>
          <DialogDescription className="mt-2 text-sm sm:text-base">Добавьте событие в расписание или создайте новое.</DialogDescription>
        </div>
        <Button onClick={startCreating} className="w-full sm:w-auto">
            <PlusCircle className="mr-2"/>
            Создать
        </Button>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
        {savedEvents.length > 0 ? (
          <ul className="space-y-2">
            {savedEvents.map(event => (
              <li key={event.id} className="group flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleAddAndClose(event)}>
                  <div className="flex items-center gap-4 flex-1 truncate">
                      {event.icon ? <ScheduleEventIcon icon={event.icon} className="h-5 w-5 text-muted-foreground" /> : <div className="w-5 h-5"/>}
                      <p className="font-semibold truncate">{event.description}</p>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" onClick={() => startEditing(event)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-16 h-full flex flex-col justify-center items-center">
            <p className="text-lg">Нет заготовок</p>
            <p className="text-sm mt-1">Нажмите "Создать", чтобы добавить первую.</p>
          </div>
        )}
      </div>

       <Dialog open={!!editingEvent} onOpenChange={(open) => !open && cancelEditing()}>
        {renderEditContent()}
      </Dialog>
    </div>
  );
}
