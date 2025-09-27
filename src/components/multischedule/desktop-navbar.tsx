

'use client';

import type { ScheduleTemplate, SavedEvent } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, MenubarGroup } from '@/components/ui/menubar';
import { Copy, Download, Languages, Loader2, Save, Wand2, FolderDown, FileSignature, ImagePlus, KeyRound, Trash2, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { AiScheduleParser } from './ai-schedule-parser';
import { SavedEvents } from './saved-events';
import { toast } from '@/hooks/use-toast';
import { ImageUploader } from './image-uploader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';


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
  isSavedEventsOpen: boolean;
  setIsSavedEventsOpen: (open: boolean) => void;
  setImageUrl: (url: string | null) => void;
  onClearAll: () => void;
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
  isSavedEventsOpen,
  setIsSavedEventsOpen,
  setImageUrl,
  onClearAll,
}: DesktopNavbarProps) {
    const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
    const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');

     React.useEffect(() => {
        const storedApiKey = localStorage.getItem('gemini-api-key');
        if (storedApiKey) {
            setApiKeyInput(storedApiKey);
        }
    }, []);

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
        setIsTranslateDialogOpen(false);
    }
    
    const handleSaveApiConfig = () => {
        try {
            localStorage.setItem('gemini-api-key', apiKeyInput);
            toast({ title: 'API ключ сохранен' });
            setIsApiKeyDialogOpen(false);
        } catch (error) {
            console.error("Failed to save to localStorage", error);
            toast({ title: 'Ошибка сохранения', description: 'Не удалось сохранить ключ.', variant: 'destructive' });
        }
    };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-1 h-auto">
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
                    <ImageUploader onSetImageUrl={setImageUrl}>
                       <MenubarItem onSelect={(e) => e.preventDefault()}>
                            <ImagePlus className="mr-2" /> Изменить изображение
                       </MenubarItem>
                    </ImageUploader>
                    <Dialog open={isTranslateDialogOpen} onOpenChange={setIsTranslateDialogOpen}>
                        <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <Languages className="mr-2" /> Перевести
                            </MenubarItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                             <DialogHeader>
                                <DialogTitle>Перевод расписания</DialogTitle>
                                <DialogDescription>Выберите языки для перевода.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
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
                            <DialogFooter>
                                <Button onClick={handleTranslateClick} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Перевести
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                     <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                        <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <KeyRound className="mr-2" /> Gemini API Key
                            </MenubarItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Конфигурация Gemini API</DialogTitle>
                                <DialogDescription>Введите ваш API ключ для доступа к Gemini AI.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div>
                                <Label htmlFor="api-key-desktop">API Key</Label>
                                <Input
                                    id="api-key-desktop"
                                    type="password"
                                    placeholder="Ваш API ключ"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                />
                                </div>
                            </div>
                            <DialogFooter className="sm:justify-end">
                              <Button onClick={handleSaveApiConfig}>Сохранить</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <MenubarSeparator />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                <Trash className="mr-2" /> Очистить всё
                            </MenubarItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Это действие навсегда удалит ваше текущее расписание. Это действие нельзя будет отменить.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={onClearAll} className="bg-destructive hover:bg-destructive/90">Очистить</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
                    <MenubarSub>
                        <MenubarSubTrigger>
                            <Trash2 className="mr-2" /> Удалить
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                             {savedTemplates.length > 0 ? (
                                savedTemplates.map(template => (
                                    <MenubarItem key={template.id} onClick={() => onDeleteTemplate(template.id)}>
                                        {template.name}
                                    </MenubarItem>
                                ))
                            ) : (
                                <MenubarItem disabled>Нет шаблонов для удаления</MenubarItem>
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
                                  <DialogDescription>Управляйте вашими сохраненными событиями.</DialogDescription>
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


    

