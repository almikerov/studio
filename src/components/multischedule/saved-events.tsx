'use client';

import { useState } from 'react';
import type { SavedEvent } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Save, X, Languages } from 'lucide-react';

interface SavedEventsProps {
  savedEvents: SavedEvent[];
  onAdd: (event: SavedEvent) => void;
  onDelete: (id: string) => void;
  onUpdate: (event: SavedEvent) => void;
}

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
};

export function SavedEvents({ savedEvents, onAdd, onDelete, onUpdate }: SavedEventsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEvent, setEditedEvent] = useState<SavedEvent | null>(null);
  const [newLang, setNewLang] = useState('');

  const startEditing = (event: SavedEvent) => {
    setEditingId(event.id);
    setEditedEvent(JSON.parse(JSON.stringify(event))); // Deep copy
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedEvent(null);
    setNewLang('');
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

  const handleTranslationChange = (lang: string, value: string) => {
    if (editedEvent) {
      const newTranslations = { ...editedEvent.translations, [lang]: value };
      setEditedEvent({ ...editedEvent, translations: newTranslations });
    }
  };

  const handleAddLanguage = () => {
    if (editedEvent && newLang && !editedEvent.translations[newLang]) {
      handleTranslationChange(newLang, '');
      setNewLang('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    if (editedEvent) {
      const newTranslations = { ...editedEvent.translations };
      delete newTranslations[lang];
      setEditedEvent({ ...editedEvent, translations: newTranslations });
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
                    <div className="space-y-2">
                       {Object.entries(editedEvent.translations).map(([lang, text]) => (
                         <div key={lang} className="flex items-center gap-2">
                           <Input value={languageNames[lang] || lang} className="w-24 bg-muted" disabled />
                           <Input value={text} onChange={(e) => handleTranslationChange(lang, e.target.value)} placeholder={`Перевод...`} />
                           <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveLanguage(lang)}><X className="h-4 w-4" /></Button>
                         </div>
                       ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="Код языка (en, es...)" />
                        <Button onClick={handleAddLanguage}><Plus className="h-4 w-4" /></Button>
                    </div>

                    <div className="flex justify-end gap-2">
                       <Button onClick={saveChanges} size="sm"><Save className="mr-2" />Сохранить</Button>
                       <Button onClick={cancelEditing} size="sm" variant="ghost">Отмена</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">{event.description}</p>
                      {Object.entries(event.translations).length > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                             <Languages className="h-3 w-3"/>
                             {Object.keys(event.translations).join(', ')}
                          </div>
                      )}
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
