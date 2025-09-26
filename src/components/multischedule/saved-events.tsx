
'use client';

import { useState } from 'react';
import type { SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Save, PlusCircle } from 'lucide-react';
import { ScheduleEventIcon, IconName } from './schedule-event-icons';
import { IconDropdown } from './icon-dropdown';

interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAdd: (event: SavedEvent) => void;
  onDelete: (id: string) => void;
  onUpdate: (event: SavedEvent) => void;
  onClose: () => void;
}

export function SavedEvents({ savedEvents, onAdd, onDelete, onUpdate, onClose }: SavedEventsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEvent, setEditedEvent] = useState<SavedEvent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventIcon, setNewEventIcon] = useState<IconName | undefined>(undefined);

  const startEditing = (event: SavedEvent) => {
    setEditingId(event.id);
    setEditedEvent({ ...event });
    setIsCreating(false);
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

  const handleCreateNew = () => {
    if(newEventDescription.trim()){
        const newEvent: SavedEvent = {
            id: Date.now().toString(),
            description: newEventDescription,
            icon: newEventIcon
        }
        onUpdate(newEvent); // A bit of a hack, but onUpdate can handle creation too
        setNewEventDescription('');
        setNewEventIcon(undefined);
        setIsCreating(false);
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, description: e.target.value });
    }
  };
  
  const handleIconChange = (icon?: IconName) => {
      if(editedEvent) {
          setEditedEvent({ ...editedEvent, icon });
      }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pt-2 border-b flex justify-between items-center">
        <p className="text-muted-foreground">Управляйте вашими сохраненными событиями.</p>
        <Button onClick={() => setIsCreating(true)} size="sm">
            <PlusCircle className="mr-2"/>
            Создать
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isCreating && (
             <div className="p-4 rounded-lg border bg-card space-y-3">
                <div className='flex items-center gap-2'>
                    <IconDropdown value={newEventIcon} onChange={setNewEventIcon} />
                    <Input 
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        placeholder="Новое событие..."
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleCreateNew} size="sm"><Save className="mr-2 h-4 w-4" />Сохранить</Button>
                    <Button onClick={() => setIsCreating(false)} size="sm" variant="ghost">Отмена</Button>
                </div>
            </div>
        )}

        {savedEvents.length > 0 ? (
          <ul className="space-y-2">
            {savedEvents.map(event => (
              <li key={event.id} className="group flex items-center justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                {editingId === event.id && editedEvent ? (
                  <div className="flex-1 space-y-3">
                    <div className='flex items-center gap-2'>
                        <IconDropdown value={editedEvent.icon} onChange={handleIconChange} />
                        <Input value={editedEvent.description} onChange={handleDescriptionChange} placeholder="Описание события" />
                    </div>
                    <div className="flex justify-end gap-2">
                       <Button onClick={saveChanges} size="sm"><Save className="mr-2 h-4 w-4" />Сохранить</Button>
                       <Button onClick={cancelEditing} size="sm" variant="ghost">Отмена</Button>
                    </div>
                  </div>
                ) : (
                    <>
                        <div className="flex items-center gap-4 flex-1 truncate">
                            {event.icon ? <ScheduleEventIcon icon={event.icon} className="h-5 w-5 text-muted-foreground" /> : <div className="w-5 h-5"/>}
                            <p className="font-semibold truncate">{event.description}</p>
                        </div>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => onAdd(event)}><Plus className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => startEditing(event)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          !isCreating && <div className="text-center text-muted-foreground py-16">
            <p className="text-lg">Нет заготовок</p>
            <p className="text-sm">Нажмите "Создать", чтобы добавить первую.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t">
        <Button onClick={onClose} variant="outline" className="w-full">Закрыть</Button>
      </div>
    </div>
  );
}
