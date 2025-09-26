
'use client';

import type { ScheduleTemplate } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';

interface SavedTemplatesProps {
  templates: ScheduleTemplate[];
  onLoad: (template: ScheduleTemplate) => void;
  onDelete: (id: string) => void;
}

export function SavedTemplates({ templates, onLoad, onDelete }: SavedTemplatesProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Шаблоны расписаний</CardTitle>
      </CardHeader>
      <CardContent>
        {templates.length > 0 ? (
          <ul className="space-y-4">
            {templates.map(template => (
              <li key={template.id} className="group flex items-center justify-between gap-2 p-3 rounded-md bg-secondary/30">
                <p className="font-semibold flex-1 truncate">{template.name}</p>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => onLoad(template)}><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(template.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>Нет сохраненных шаблонов</p>
            <p className="text-xs">Вы можете сохранять расписания как шаблоны для быстрого доступа.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    