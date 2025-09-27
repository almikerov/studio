

'use client';

import type { ScheduleTemplate } from '@/app/page';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface SavedTemplatesProps {
  templates: ScheduleTemplate[];
  onLoad: (template: ScheduleTemplate) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onSaveTemplate: (name: string) => void;
}

export function SavedTemplates({ templates, onLoad, onDelete, onClose, onSaveTemplate }: SavedTemplatesProps) {
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const handleLoad = (template: ScheduleTemplate) => {
    onLoad(template);
    onClose();
  }

  const handleSaveTemplateClick = () => {
    if (templateName.trim()) {
        onSaveTemplate(templateName.trim());
        setTemplateName('');
        setIsSaveTemplateDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
       <DialogHeader className="p-6 border-b">
        <DialogTitle className="text-2xl font-bold">Мои расписания</DialogTitle>
        <DialogDescription className="mt-2 text-sm sm:text-base">Загрузите или сохраните шаблон.</DialogDescription>
      </DialogHeader>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="lg"><Save className="mr-2" />Сохранить текущее расписание</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Сохранить шаблон расписания</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="template-name">Название шаблона</Label>
                    <Input id="template-name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="например, 'День матча'" onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplateClick()} />
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveTemplateClick} disabled={!templateName.trim()}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        {templates.length > 0 ? (
          <ul className="space-y-4">
            {templates.map(template => (
              <li key={template.id} className="group flex items-center justify-between gap-2 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleLoad(template)}>
                <p className="font-semibold flex-1 truncate">{template.name}</p>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(template.id); }}>
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

    