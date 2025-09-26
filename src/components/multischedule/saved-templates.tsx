
'use client';

import type { ScheduleTemplate } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';

interface SavedTemplatesProps {
  templates: ScheduleTemplate[];
  onLoad: (template: ScheduleTemplate) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function SavedTemplates({ templates, onLoad, onDelete, onClose }: SavedTemplatesProps) {
  
  const handleLoad = (template: ScheduleTemplate) => {
    onLoad(template);
    onClose();
  }

  return (
    <div className="flex flex-col h-full">
       <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Мои расписания</h2>
        <p className="text-muted-foreground mt-2">Загрузите один из ваших сохраненных шаблонов, чтобы быстро начать работу.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {templates.length > 0 ? (
          <ul className="space-y-4">
            {templates.map(template => (
              <li key={template.id} className="group flex items-center justify-between gap-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <p className="font-semibold flex-1 truncate">{template.name}</p>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" onClick={() => handleLoad(template)}>
                    <Download className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(template.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
            <div className="text-center">
              <p className="text-lg font-medium">Нет сохраненных шаблонов</p>
              <p className="text-sm mt-1">Вы можете сохранять расписания как шаблоны для быстрого доступа.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
