

'use client';

import { useState, useEffect } from 'react';
import type { SavedEvent, ScheduleItem } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Save, PlusCircle, Check, ChevronDown, Clock, Tag, Type, Palette } from 'lucide-react';
import { ScheduleEventIcon, IconName } from './schedule-event-icons';
import { IconDropdown } from './icon-dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';


interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAdd: (event: Partial<Omit<SavedEvent, 'id'>>) => void;
  onDelete: (id: string) => void;
  onUpdate: (event: SavedEvent) => void;
  onSaveNew: (event: Partial<SavedEvent>) => void;
  onClose: () => void;
  itemColors: string[];
}

const typeLabels: Record<ScheduleItem['type'], string> = {
    timed: 'Событие со временем',
    untimed: 'Событие без времени',
    date: 'Дата',
    h1: 'Заголовок H1',
    h2: 'Заголовок H2',
    h3: 'Заголовок H3',
    comment: 'Комментарий',
};

export function SavedEvents({ savedEvents, onAdd, onDelete, onUpdate, onSaveNew, onClose, itemColors }: SavedEventsProps) {
  const [editingEvent, setEditingEvent] = useState<SavedEvent | null>(null);
  
  const startCreating = () => {
    // This object is a placeholder for the creation dialog. It doesn't have a real ID yet.
    setEditingEvent({
        id: 'new',
        description: 'Новая заготовка',
        icon: undefined,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'timed',
        color: undefined
    });
  }

  const handleSave = (eventToSave: SavedEvent) => {
    // If id is 'new', it's a new event from the "Create" flow.
    if (eventToSave.id === 'new') {
        onSaveNew(eventToSave);
    } else {
        onUpdate(eventToSave);
    }
    setEditingEvent(null);
  };
  
  const handleAddAndClose = (event: SavedEvent) => {
    onAdd({
        description: event.description,
        icon: event.icon,
        time: event.time,
        type: event.type,
        color: event.color,
    });
    onClose();
  }

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="p-6 border-b">
        <DialogTitle className="text-2xl font-bold">Мои заготовки</DialogTitle>
        <DialogDescription className="mt-2 text-sm sm:text-base">Добавьте элемент в расписание или создайте новую заготовку.</DialogDescription>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <Button onClick={startCreating} className="w-full sm:w-auto" size="lg">
            <PlusCircle className="mr-2"/>
            Создать заготовку
        </Button>
        {savedEvents.length > 0 ? (
          <ul className="space-y-3">
            {savedEvents.map(event => (
              <li 
                  key={event.id}
                  className={cn(
                      "group relative flex flex-col gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer",
                      event.color && `bg-${event.color}-100 dark:bg-${event.color}-900/30`
                  )}
                  onClick={() => handleAddAndClose(event)}
              >
                  <div className="flex items-center gap-4">
                      {event.icon ? <ScheduleEventIcon icon={event.icon} className="h-5 w-5 text-muted-foreground" /> : <div className="w-5 h-5"/>}
                      <p className="font-semibold text-lg flex-1 truncate">{event.description}</p>
                      <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => setEditingEvent(event)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground pl-9">
                      <div className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          <span>{typeLabels[event.type]}</span>
                      </div>
                      {event.time && event.type === 'timed' && (
                           <div className="flex items-center gap-2">
                               <Clock className="h-4 w-4" />
                               <span>{event.time}</span>
                           </div>
                      )}
                      {event.color && (
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full bg-${event.color}-500`}/>
                            <span>{event.color}</span>
                          </div>
                      )}
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

       <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
            <EditSavedEventDialog 
                event={editingEvent}
                onSave={handleSave}
                onClose={() => setEditingEvent(null)}
                itemColors={itemColors}
            />
      </Dialog>
    </div>
  );
}


interface EditSavedEventDialogProps {
    event: SavedEvent | null;
    onSave: (event: SavedEvent) => void;
    onClose: () => void;
    itemColors: string[];
}

function EditSavedEventDialog({ event, onSave, onClose, itemColors }: EditSavedEventDialogProps) {
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState<IconName | undefined>(undefined);
    const [time, setTime] = useState('');
    const [type, setType] = useState<ScheduleItem['type']>('timed');
    const [color, setColor] = useState<string | undefined>(undefined);

    const isCreating = event?.id === 'new';

    useEffect(() => {
        if (event) {
            setDescription(event.description);
            setIcon(event.icon);
            setTime(event.time || '');
            setType(event.type);
            setColor(event.color);
        }
    }, [event]);

    const handleSaveChanges = () => {
        if (event) {
            onSave({
                ...event,
                description,
                icon,
                time: type === 'timed' ? time : undefined,
                type,
                color,
            });
        }
    };

    if (!event) return null;

    return (
        <DialogContent>
            <DialogHeader>
            <DialogTitle>{isCreating ? 'Создать заготовку' : 'Редактировать заготовку'}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 p-1">
                
                <div className="flex items-center gap-2">
                    <IconDropdown value={icon} onChange={setIcon} />
                    <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-1 text-base h-10"
                        placeholder="Описание"
                    />
                </div>

                <div className="flex items-center gap-4 justify-between p-2 rounded-lg bg-secondary/50">
                    <Label htmlFor="type-select-saved" className="text-base font-normal">Тип элемента</Label>
                    <div className="relative">
                        <select
                            id="type-select-saved"
                            value={type}
                            onChange={(e) => setType(e.target.value as ScheduleItem['type'])}
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
                
                { type === 'timed' && (
                    <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-lg h-12"
                    />
                )}
            
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground ml-1">Цвет</Label>
                    <div className="grid grid-cols-4 gap-2">
                    <Button variant={!color ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => setColor(undefined)}>
                        <div className="h-6 w-6 rounded-full border" />
                    </Button>
                    {itemColors.map(c => (
                        <Button key={c} variant={color === c ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => setColor(c)}>
                        <div className={`h-6 w-6 rounded-full bg-${c}-500`} />
                        </Button>
                    ))}
                    </div>
                </div>

                <DialogFooter className="mt-4">
                <Button onClick={onClose} variant="ghost">Отмена</Button>
                <Button onClick={handleSaveChanges}><Check className="mr-2"/>Сохранить</Button>
                </DialogFooter>
            </div>
        </DialogContent>
    );
}
