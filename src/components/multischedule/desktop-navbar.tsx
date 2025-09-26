
'use client';

import type { ScheduleTemplate, SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, MenubarGroup } from '@/components/ui/menubar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Copy, Download, Languages, Loader2, Save, Wand2, FolderDown, FileSignature } from 'lucide-react';
import React, { useState } from 'react';
import { AiScheduleParser } from './ai-schedule-parser';
import { SavedEvents } from './saved-events';
import { toast } from '@/hooks/use-toast';

const AVAILABLE_LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'Английский' },
  { code: 'es', name: 'Испанский' },
  { code: 'fr', name: 'Французский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'ja', name: 'Японский' },
  { code: 'zh', name: 'Китайский' },
];

interface DesktopNavbarProps {
  isLoading: boolean;
  isDownloading: boolean;
  onDownload: () => void;
  onCopy: () => void;
  savedTemplates: ScheduleTemplate[];
  onLoadTemplate: (template: ScheduleTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onSaveTemplate: (name: string) => void;
  savedEvents: SavedEvent[];
  onAddEventFromSaved: (event: SavedEvent) => void;
  updateSavedEvents: (events: SavedEvent[]) => void;
  onAiParse: (text: string) => Promise<void>;
  selectedLanguages: string[];
  onLanguageToggle: (code: string) => void;
  onTranslate: () => void;
  isAiParserOpen: boolean;
  setIsAiParserOpen: (open: boolean) => void;
}

export function DesktopNavbar({
  isLoading,
  isDownloading,
  onDownload,
  onCopy,
  savedTemplates,
  onLoadTemplate,
  onDeleteTemplate,
  onSaveTemplate,
  savedEvents,
  onAddEventFromSaved,
  updateSavedEvents,
  onAiParse,
  selectedLanguages,
  onLanguageToggle,
  onTranslate,
  isAiParserOpen,
  setIsAiParserOpen,
}: DesktopNavbarProps) {
    const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [isSavedEventsOpen, setIsSavedEventsOpen] = useState(false);
    const [isTranslatePopoverOpen, setIsTranslatePopoverOpen] = useState(false);

    const handleSaveTemplateClick = () => {
        if (templateName.trim()) {
            onSaveTemplate(templateName.trim());
            setTemplateName('');
            setIsSaveTemplateDialogOpen(false);
        }
    };
    
    const handleAddFromSaved = (event: SavedEvent) => {
        onAddEventFromSaved(event);
        toast({
            title: "Событие добавлено",
            description: `"${event.description}" добавлено в расписание.`
        })
    }
    
    const handleTranslateClick = () => {
        onTranslate();
        setIsTranslatePopoverOpen(false);
    }

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-1 h-auto">
        <div className="flex items-center">
            <Popover open={isTranslatePopoverOpen} onOpenChange={setIsTranslatePopoverOpen}>
                <PopoverTrigger asChild>
                     <Button variant="ghost" className="px-3 py-1.5 h-auto text-sm font-medium">
                         <Languages className="mr-2 h-4 w-4" /> Перевести
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="start">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Перевод</h4>
                            <p className="text-sm text-muted-foreground">Выберите языки для перевода.</p>
                        </div>
                        <div className="grid gap-2">
                            {AVAILABLE_LANGUAGES.map(lang => (
                            <div key={lang.code} className="flex items-center space-x-2">
                                <Checkbox
                                id={`lang-desktop-${lang.code}`}
                                checked={selectedLanguages.includes(lang.code)}
                                onCheckedChange={() => onLanguageToggle(lang.code)}
                                />
                                <Label htmlFor={`lang-desktop-${lang.code}`} className="font-normal cursor-pointer">{lang.name}</Label>
                            </div>
                            ))}
                        </div>
                        <Button onClick={handleTranslateClick} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Перевести
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
        
        <Menubar className="border-none bg-transparent p-0 h-auto">
            <MenubarMenu>
                <MenubarTrigger>Файл</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem onClick={onDownload} disabled={isDownloading || isLoading}>
                        <Download className="mr-2" /> Сохранить изображение
                    </MenubarItem>
                    <MenubarItem onClick={onCopy} disabled={isDownloading || isLoading}>
                        <Copy className="mr-2" /> Копировать изображение
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Инструменты</MenubarTrigger>
                <MenubarContent>
                    <Dialog open={isAiParserOpen} onOpenChange={setIsAiParserOpen}>
                        <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <Wand2 className="mr-2" /> ИИ-Редактор
                            </MenubarItem>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
                            <AiScheduleParser onParse={onAiParse} isLoading={isLoading} onClose={() => setIsAiParserOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
                <MenubarTrigger>Шаблоны</MenubarTrigger>
                <MenubarContent>
                    <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
                        <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <Save className="mr-2" /> Сохранить текущее
                            </MenubarItem>
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
                    <MenubarSub>
                        <MenubarSubTrigger>
                            <FolderDown className="mr-2" /> Загрузить
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            {savedTemplates.length > 0 ? (
                                savedTemplates.map(template => (
                                    <MenubarItem key={template.id} onClick={() => onLoadTemplate(template)}>
                                        {template.name}
                                    </MenubarItem>
                                ))
                            ) : (
                                <MenubarItem disabled>Нет сохраненных шаблонов</MenubarItem>
                            )}
                        </MenubarSubContent>
                    </MenubarSub>
                    <MenubarSeparator />
                    <MenubarGroup>
                        <Dialog open={isSavedEventsOpen} onOpenChange={setIsSavedEventsOpen}>
                            <DialogTrigger asChild>
                                <MenubarItem onSelect={(e) => e.preventDefault()}>
                                    <FileSignature className="mr-2" /> Заготовки событий
                                </MenubarItem>
                            </DialogTrigger>
                            <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
                                <DialogHeader className="p-6 pb-0">
                                <DialogTitle>Мои события</DialogTitle>
                                </DialogHeader>
                                <SavedEvents
                                    savedEvents={savedEvents}
                                    onAdd={handleAddFromSaved}
                                    onUpdate={(updatedEvent) => {
                                        const newEvents = savedEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e);
                                        updateSavedEvents(newEvents);
                                    }}
                                    onDelete={(id) => {
                                        updateSavedEvents(savedEvents.filter(e => e.id !== id));
                                    }}
                                    onClose={() => setIsSavedEventsOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    </div>
  );
}
