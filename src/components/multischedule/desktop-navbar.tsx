

'use client';

import type { ScheduleTemplate, SavedEvent, TranslationDisplayMode } from '@/app/page';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, MenubarGroup } from '@/components/ui/menubar';
import { Copy, Download, Languages, Loader2, Save, Wand2, FolderDown, FileSignature, ImagePlus, KeyRound, Trash2, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { AiScheduleParser } from './ai-schedule-parser';
import { SavedEvents } from './saved-events';
import { ImageUploader } from './image-uploader';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { SavedTemplates } from './saved-templates';
import { Checkbox } from '../ui/checkbox';
import { AVAILABLE_LANGUAGES } from '@/app/page';


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
  onLanguageChange: (codes: string[]) => void;
  onTranslate: () => void;
  onClearTranslations: () => void;
  isAiParserOpen: boolean;
  setIsAiParserOpen: (open: boolean) => void;
  isSavedEventsOpen: boolean;
  setIsSavedEventsOpen: (open: boolean) => void;
  setImageUrl: (url: string | null) => void;
  onClearAll: () => void;
  onSaveEvent: (event: Partial<SavedEvent>) => void;
  translationDisplayMode: TranslationDisplayMode;
  setTranslationDisplayMode: (mode: TranslationDisplayMode) => void;
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
  onLanguageChange,
  onTranslate,
  onClearTranslations,
  isAiParserOpen,
  setIsAiParserOpen,
  isSavedEventsOpen,
  setIsSavedEventsOpen,
  setImageUrl,
  onClearAll,
  onSaveEvent,
  translationDisplayMode,
  setTranslationDisplayMode,
}: DesktopNavbarProps) {
    const [isTranslateDialogOpen, setIsTranslateDialogOpen] = useState(false);
    const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

     React.useEffect(() => {
        const storedApiKey = localStorage.getItem('gemini-api-key');
        if (storedApiKey) {
            setApiKeyInput(storedApiKey);
        }
    }, []);
    
    const handleAddFromSaved = (event: SavedEvent) => {
        onAddEventFromSaved(event);
    }
    
    const handleTranslateClick = () => {
        onTranslate();
        setIsTranslateDialogOpen(false);
    }
    
    const handleClearTranslationsClick = () => {
        onClearTranslations();
        setIsTranslateDialogOpen(false);
    }

    const handleSaveApiConfig = () => {
        try {
            localStorage.setItem('gemini-api-key', apiKeyInput);
            setIsApiKeyDialogOpen(false);
        } catch (error) {
            console.error("Failed to save to localStorage", error);
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
                       <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <ImagePlus className="mr-2" /> Изменить изображение
                            </MenubarItem>
                       </DialogTrigger>
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
                                <DialogDescription>Выберите языки и стиль отображения.</DialogDescription>
                            </DialogHeader>
                             <div className="py-4 space-y-6">
                                 <div className="space-y-2">
                                     <Label>Языки</Label>
                                     <div className="grid grid-cols-2 gap-4">
                                        {AVAILABLE_LANGUAGES.map(lang => (
                                        <div key={lang.code} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`lang-desktop-${lang.code}`}
                                                checked={selectedLanguages.includes(lang.code)}
                                                onCheckedChange={(checked) => {
                                                    onLanguageChange(
                                                        checked
                                                        ? [...selectedLanguages, lang.code]
                                                        : selectedLanguages.filter(c => c !== lang.code)
                                                    )
                                                }}
                                            />
                                            <Label htmlFor={`lang-desktop-${lang.code}`} className="font-normal cursor-pointer">{lang.name}</Label>
                                        </div>
                                        ))}
                                     </div>
                                 </div>
                                  <div className="space-y-3">
                                      <Label>Стиль отображения</Label>
                                       <RadioGroup value={translationDisplayMode} onValueChange={(val) => setTranslationDisplayMode(val as TranslationDisplayMode)} className="flex flex-col space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="inline" id="mode-desktop-inline" />
                                            <Label htmlFor="mode-desktop-inline" className="font-normal cursor-pointer">В скобках</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="block" id="mode-desktop-block" />
                                            <Label htmlFor="mode-desktop-block" className="font-normal cursor-pointer">Под словом</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="text-block" id="mode-desktop-text" />
                                            <Label htmlFor="mode-desktop-text" className="font-normal cursor-pointer">Текстом</Label>
                                          </div>
                                        </RadioGroup>
                                  </div>
                             </div>

                            <DialogFooter>
                                <Button variant="destructive" onClick={handleClearTranslationsClick}>Очистить переводы</Button>
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
                <MenubarTrigger>Библиотека</MenubarTrigger>
                <MenubarContent>
                    <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
                        <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <FolderDown className="mr-2" /> Шаблоны
                            </MenubarItem>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
                            <SavedTemplates
                                templates={savedTemplates}
                                onLoad={(template) => { onLoadTemplate(template); setIsTemplatesOpen(false); }}
                                onDelete={onDeleteTemplate}
                                onClose={() => setIsTemplatesOpen(false)}
                                onSaveTemplate={onSaveTemplate}
                            />
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isSavedEventsOpen} onOpenChange={setIsSavedEventsOpen}>
                        <DialogTrigger asChild>
                            <MenubarItem onSelect={(e) => e.preventDefault()}>
                                <FileSignature className="mr-2" /> Заготовки событий
                            </MenubarItem>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
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
                                onSaveNew={onSaveEvent}
                                onClose={() => setIsSavedEventsOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    </div>
  );
}


    

    





