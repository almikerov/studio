'use client';

import { useState } from 'react';
import type { TranslatedSchedule } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TranslatedSchedulesViewProps {
  translatedSchedules: TranslatedSchedule[];
  onDelete: (lang: string) => void;
  onUpdate: (lang: string, newText: string) => void;
}

const languageNames: Record<string, string> = {
  en: 'Английский',
  es: 'Испанский',
  fr: 'Французский',
  de: 'Немецкий',
  ru: 'Русский',
  ja: 'Японский',
  zh: 'Китайский',
};

export function TranslatedSchedulesView({ translatedSchedules, onDelete, onUpdate }: TranslatedSchedulesViewProps) {
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');

  if (translatedSchedules.length === 0) {
    return null;
  }

  const handleEdit = (schedule: TranslatedSchedule) => {
    setEditingLang(schedule.lang);
    setEditedText(schedule.text);
  };

  const handleSave = (lang: string) => {
    onUpdate(lang, editedText);
    setEditingLang(null);
  };

  const handleCancel = () => {
    setEditingLang(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, lang: string) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSave(lang);
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  }

  return (
    <div className="space-y-8">
      {translatedSchedules.map(({ lang, text }) => (
        <Card key={lang} className="shadow-lg group">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Расписание на {languageNames[lang] || lang}</CardTitle>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {editingLang === lang ? (
                <>
                  <Button size="icon" variant="ghost" onClick={() => handleSave(lang)}><Save className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel}><X className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <Button size="icon" variant="ghost" onClick={() => handleEdit({ lang, text })}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(lang)}><Trash2 className="h-4 w-4" /></Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingLang === lang ? (
              <Textarea 
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, lang)}
                className="whitespace-pre-wrap font-body text-sm text-card-foreground min-h-[100px]"
                autoFocus
              />
            ) : (
              <pre className="whitespace-pre-wrap font-body text-sm text-card-foreground">{text}</pre>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
