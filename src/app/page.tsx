

'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { translateSchedule } from '@/ai/flows/translate-schedule';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import type { IconName } from '@/components/multischedule/schedule-event-icons';
import { parseScheduleFromText } from '@/ai/flows/parse-schedule-text';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopNavbar } from '@/components/multischedule/desktop-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, Languages, Loader2, Copy, BookOpen, Wand2, Save, Construction, ArrowDown, ArrowUp, Menu, Share, ImagePlus, GripVertical, KeyRound, Smartphone, Laptop, Plus, Trash, Ruler } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { SavedTemplates } from '@/components/multischedule/saved-templates';
import { AiScheduleParser } from '@/components/multischedule/ai-schedule-parser';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SavedEvents } from '@/components/multischedule/saved-events';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '@/components/multischedule/image-uploader';
import { Input } from '@/components/ui/input';
import { ScheduleEventIcon } from '@/components/multischedule/schedule-event-icons';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';


export const AVAILABLE_LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'Английский' },
  { code: 'es', name: 'Испанский' },
  { code: 'fr', name: 'Французский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'ja', name: 'Японский' },
  { code: 'zh', name: 'Китайский' },
];


export type ScheduleItem = { 
  id: string; 
  time: string; 
  description: string; 
  icon?: IconName; 
  color?: string;
  type: 'timed' | 'untimed' | 'comment' | 'date' | 'h1' | 'h2' | 'h3';
  date?: string;
  translations?: Record<string, string>;
};
export type TranslatedSchedule = { lang: string; text: string };

export type SavedEvent = {
  id: string;
  description: string;
  icon?: IconName;
  time?: string;
  type: ScheduleItem['type'];
  color?: string;
  date?: string;
};

export type ScheduleTemplate = {
  id: string;
  name: string;
  schedule: ScheduleItem[];
  cardTitle: string;
  imageUrl: string | null;
};

export type TranslationDisplayMode = 'inline' | 'block' | 'text-block';
export type RenderOptions = { renderAsMobile?: boolean, fitContent?: boolean };

const defaultSchedule: ScheduleItem[] = [
    { id: `${Date.now()}-${Math.random()}`, time: '', description: '', date: new Date().toISOString(), icon: undefined, type: 'date' },
];

export default function Home() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const [cardTitle, setCardTitle] = useState('Расписание на день');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<ScheduleTemplate[]>([]);

  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);

  const isMobile = useIsMobile();

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [translationDisplayMode, setTranslationDisplayMode] = useState<TranslationDisplayMode>('inline');
  const [isAiParserOpen, setIsAiParserOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSavedEventsOpen, setIsSavedEventsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isRenderOptionsOpen, setIsRenderOptionsOpen] = useState(false);
  const [renderAction, setRenderAction] = useState<((options: RenderOptions) => void) | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');


  useEffect(() => {
    try {
      const storedState = localStorage.getItem('multiScheduleState');
      if (storedState) {
        const { schedule, cardTitle, imageUrl, translationDisplayMode: storedMode, selectedLanguages: storedLangs } = JSON.parse(storedState);
        setSchedule(schedule || []);
        if (cardTitle) setCardTitle(cardTitle);
        if (imageUrl) setImageUrl(imageUrl);
        if (storedMode) setTranslationDisplayMode(storedMode);
        if (storedLangs) setSelectedLanguages(storedLangs);

      } else {
        setSchedule(defaultSchedule);
      }

      const storedEvents = localStorage.getItem('savedEvents');
      if (storedEvents) {
        setSavedEvents(JSON.parse(storedEvents));
      }
      const storedTemplates = localStorage.getItem('savedTemplates');
      if (storedTemplates) {
        setSavedTemplates(JSON.parse(storedTemplates));
      }
      const storedApiKey = localStorage.getItem('gemini-api-key');
      if (storedApiKey) {
        setApiKeyInput(storedApiKey);
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      setSchedule(defaultSchedule);
    }
  }, []);

  useEffect(() => {
    if (schedule.length === 0 && !localStorage.getItem('multiScheduleState')) {
        return;
    }
    try {
        const stateToSave = { schedule, cardTitle, imageUrl, translationDisplayMode, selectedLanguages };
        localStorage.setItem('multiScheduleState', JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [schedule, cardTitle, imageUrl, translationDisplayMode, selectedLanguages]);
  
  const updateSavedEvents = (newSavedEvents: SavedEvent[]) => {
    setSavedEvents(newSavedEvents);
    try {
      localStorage.setItem('savedEvents', JSON.stringify(newSavedEvents));
    } catch (error) {
      console.error("Failed to save events to localStorage", error);
    }
  };

  const updateSavedTemplates = (newTemplates: ScheduleTemplate[]) => {
    setSavedTemplates(newTemplates);
    try {
      localStorage.setItem('savedTemplates', JSON.stringify(newTemplates));
    } catch (error) {
      console.error("Failed to save templates to localStorage", error);
    }
  };


  const handleUpdateEvent = (id: string, updatedValues: Partial<Omit<ScheduleItem, 'id'>>) => {
    const newSchedule = schedule.map(item => (item.id === id ? { ...item, ...updatedValues } : item));
    setSchedule(newSchedule);
    if (editingEvent?.id === id) {
      setEditingEvent(prev => prev ? { ...prev, ...updatedValues } : null);
    }
  };

  const handleOpenEditModal = (item: ScheduleItem) => {
    setEditingEvent(item);
  };
  
  const handleCloseEditModal = () => {
    setEditingEvent(null);
  };
  
  const handleAddNewEvent = (newEventConfig?: Partial<ScheduleItem>) => {
    const newEvent: ScheduleItem = {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: 'Новое событие',
        type: 'timed',
        ...newEventConfig,
    };

    if (newEventConfig) { 
        if (newEventConfig.type === 'date') {
            newEvent.time = '';
            newEvent.description = newEventConfig.description || '';
            newEvent.date = newEventConfig.date || new Date().toISOString();
        }
        if (['h1', 'h2', 'h3', 'untimed', 'comment'].includes(newEvent.type)) {
            newEvent.time = '';
        }
        setSchedule(prev => [...prev, newEvent]);
        setIsAddEventDialogOpen(false); // Close dialog if it was open
    } else {
        setSchedule(prev => [...prev, {
          id: `${Date.now()}-${Math.random()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: 'Новое событие',
          type: 'timed',
        }]);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
    if (editingEvent?.id === id) {
      setEditingEvent(null);
    }
  };

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    setSchedule(prev => {
      const items = Array.from(prev);
      const [movedItem] = items.splice(index, 1);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (newIndex < 0 || newIndex >= items.length + 1) {
        return items; // out of bounds
      }
      
      items.splice(newIndex, 0, movedItem);
      return items;
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(schedule);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSchedule(items);
  };


  const handleTranslate = async () => {
    const itemsToTranslate = schedule.filter(item => item.description && ['timed', 'untimed', 'comment', 'h1', 'h2', 'h3'].includes(item.type));
    if (itemsToTranslate.length === 0 || selectedLanguages.length === 0) return;

    setIsLoading(true);
    setIsMobileMenuOpen(false);

    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setIsLoading(false);
      return;
    }

    try {
      const descriptions = itemsToTranslate.map(item => item.description);
      const result = await translateSchedule({ descriptions, targetLanguages: selectedLanguages }, apiKey);
      
      const newSchedule = schedule.map(item => {
        const translatedItem = result.results.find(t => t.original === item.description);
        if (translatedItem) {
          return { ...item, translations: translatedItem.translations };
        }
        // Don't clear old translations if this item wasn't part of the current batch
        return item; 
      });

      setSchedule(newSchedule);

    } catch (error: any) {
      console.error('Translation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTranslations = () => {
    setSchedule(prev => prev.map(item => ({...item, translations: {}})));
  };

  const generateCanvas = async (options: RenderOptions): Promise<HTMLCanvasElement | null> => {
    const element = printableAreaRef.current;
    if (!element) return null;
  
    setIsDownloading(true);
    
    const clone = element.cloneNode(true) as HTMLElement;

    clone.classList.add('cloned-for-rendering');
    if (options.renderAsMobile) {
      clone.classList.add('render-mobile-padding');
    }
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0px';

    if (options.fitContent) {
        clone.style.width = 'max-content';
    } else {
        clone.style.width = options.renderAsMobile ? '420px' : '768px';
    }
    clone.style.height = 'auto';

    document.body.appendChild(clone);
    
    // If fitContent, we measure the width and set it explicitly for html2canvas
    if (options.fitContent) {
        const contentWidth = clone.scrollWidth + 2; // add a little buffer
        clone.style.width = `${contentWidth}px`;
    }

    clone.querySelectorAll('[data-no-print="true"]').forEach(el => el.remove());
    clone.querySelectorAll('[data-drag-handle="true"]').forEach(el => el.remove());
    

    clone.querySelectorAll('[data-id="icon-container"]').forEach(el => {
        const container = el as HTMLElement;
        if (container.dataset.hasIcon === 'false') {
            container.innerHTML = '';
            container.style.backgroundColor = 'transparent';
        }
    });

    const footer = clone.querySelector('#card-footer');
    if (footer) footer.remove();

    if (!imageUrl) {
        const placeholder = clone.querySelector('[data-id="image-placeholder"]');
        if (placeholder) placeholder.remove();
    }

    clone.querySelectorAll('.truncate').forEach(el => {
      el.classList.remove('truncate');
    });

    const content = clone.querySelector<HTMLDivElement>('[data-schedule-content]');
    if (content) {
      content.style.height = 'auto';
      content.style.maxHeight = 'none';
      content.style.overflow = 'visible';
    }

    // Show drag handles on mobile render if they are hidden
    if (options.renderAsMobile) {
        clone.querySelectorAll('[data-drag-handle]').forEach(el => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.classList.contains('hidden')) {
                htmlEl.classList.remove('hidden');
                htmlEl.classList.add('flex');
            }
        });
        clone.querySelectorAll('[data-mobile-arrow]').forEach(el => el.remove());
    }

    const imageWrapper = clone.querySelector('[data-id="schedule-image-wrapper"]');
    const imageElement = imageWrapper?.querySelector('img');

    const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = (e) => {
                console.error("Image load error:", e);
                reject(new Error(`Failed to load image at ${url}`));
            };
            img.src = url;
        });
    };

    if (imageElement && imageUrl) {
        try {
            const base64Url = await loadImageAsBase64(imageUrl);
            imageElement.src = base64Url;
        } catch (error) {
            console.error(error);
        }
    }

    
    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });
      return canvas;
    } catch (err) {
      console.error("Error generating canvas: ", err);
      return null;
    } finally {
      document.body.removeChild(clone);
      setIsDownloading(false);
    }
  };


  const handleDownloadImage = async (options: RenderOptions) => {
    const canvas = await generateCanvas(options);
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'multischedule.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyImage = async (options: RenderOptions) => {
    const canvas = await generateCanvas(options);
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Не удалось создать blob из canvas');
        }
        window.focus(); // Ensure document is focused before clipboard write
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      }, 'image/png');
    } catch (err) {
      console.error("Ошибка копирования в буфер обмена: ", err);
    }
  }

  const handleShareImage = async (options: RenderOptions) => {
    const canvas = await generateCanvas(options);
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        return;
      }
      const file = new File([blob], "multischedule.png", { type: "image/png" });
      const data = {
        files: [file],
        title: 'Мое расписание',
        text: cardTitle,
      };

      if (navigator.canShare && navigator.canShare(data)) {
        try {
          await navigator.share(data);
        } catch (error) {
          if ((error as Error).name !== 'AbortError') {
            console.error("Share failed.");
          }
        }
      } else {
        console.error("Sharing not supported.");
      }
    }, 'image/png');
  };

  const handleSaveEvent = (eventData: Partial<ScheduleItem>) => {
    const { description, type } = eventData;
  
    if (!description) {
      return;
    }
  
    if (savedEvents.some(e => e.description.toLowerCase() === description.toLowerCase())) {
      return;
    }
  
    const newSavedEvent: SavedEvent = {
      id: `${Date.now()}-${Math.random()}`,
      description: eventData.description!,
      icon: eventData.icon,
      time: eventData.time,
      type: eventData.type!,
      color: eventData.color,
      date: eventData.date,
    };
    updateSavedEvents([...savedEvents, newSavedEvent]);
  };

  const handleSaveTemplate = (name: string) => {
    const newTemplate: ScheduleTemplate = {
      id: `${Date.now()}-${Math.random()}`,
      name,
      schedule,
      cardTitle,
      imageUrl,
    };
    updateSavedTemplates([...savedTemplates, newTemplate]);
  };
  
  const handleLoadTemplate = (template: ScheduleTemplate) => {
    setSchedule(template.schedule.map(item => ({...item, id: `${Date.now()}-${Math.random()}`}))); // new IDs
    setCardTitle(template.cardTitle);
    setImageUrl(template.imageUrl);
  };
  
  const handleDeleteTemplate = (id: string) => {
    updateSavedTemplates(savedTemplates.filter(template => template.id !== id));
  };

  const handleAiParse = async (text: string) => {
    setIsLoading(true);
    setIsAiParserOpen(false);
    setIsMobileMenuOpen(false);

    const apiKey = localStorage.getItem('gemini-api-key');
    if (!apiKey) {
      setIsLoading(false);
      return;
    }

    try {
      const result = await parseScheduleFromText({ text }, apiKey);
      const newScheduleItems: ScheduleItem[] = result.schedule.map(item => ({
        ...item,
        id: `${Date.now()}-${Math.random()}`,
        time: item.time || '',
        description: item.description || '',
      }));
      setSchedule(newScheduleItems);
      setCardTitle(result.cardTitle);
    } catch (error: any) {
      console.error('AI parsing failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSavedEvent = (updatedEvent: SavedEvent) => {
    const newEvents = savedEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    updateSavedEvents(newEvents);
  }

  const handleSaveApiConfig = () => {
    try {
      localStorage.setItem('gemini-api-key', apiKeyInput);
      setIsApiKeyDialogOpen(false);
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };
  
  const openRenderOptions = (action: (options: RenderOptions) => void) => {
    setRenderAction(() => (options: RenderOptions) => {
      action(options);
      setIsRenderOptionsOpen(false);
    });
    setIsRenderOptionsOpen(true);
    setIsMobileMenuOpen(false);
  };
  
  const handleAddFromSavedClick = (event: SavedEvent) => {
    handleAddNewEvent({
        description: event.description,
        icon: event.icon,
        time: event.time,
        type: event.type,
        color: event.color,
        date: event.date,
    });
  }

  const addNewTypedEvent = (type: ScheduleItem['type']) => {
    const config: Partial<ScheduleItem> = { type };
    if (type === 'date') {
      config.date = new Date().toISOString();
      config.description = 'Новая дата';
    } else {
        config.description = 'Новое событие';
    }
    handleAddNewEvent(config);
  }

  const handleClearAll = () => {
    setSchedule(defaultSchedule);
    setCardTitle('Расписание на день');
    setImageUrl(null);
    setIsMobileMenuOpen(false);
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {!isMobile && <DesktopNavbar 
            isLoading={isLoading}
            isDownloading={isDownloading}
            onDownload={() => openRenderOptions(handleDownloadImage)}
            onCopy={() => openRenderOptions(handleCopyImage)}
            savedTemplates={savedTemplates}
            onLoadTemplate={handleLoadTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSaveTemplate={handleSaveTemplate}
            savedEvents={savedEvents}
            onAddEventFromSaved={handleAddFromSavedClick}
            updateSavedEvents={updateSavedEvents}
            isSavedEventsOpen={isSavedEventsOpen}
            setIsSavedEventsOpen={setIsSavedEventsOpen}
            onAiParse={handleAiParse}
            selectedLanguages={selectedLanguages}
            onLanguageChange={setSelectedLanguages}
            onTranslate={handleTranslate}
            onClearTranslations={handleClearTranslations}
            isAiParserOpen={isAiParserOpen}
            setIsAiParserOpen={setIsAiParserOpen}
            setImageUrl={setImageUrl}
            onClearAll={handleClearAll}
            onSaveEvent={handleSaveEvent}
            translationDisplayMode={translationDisplayMode}
            setTranslationDisplayMode={setTranslationDisplayMode}
        />}

        
          <div ref={printableAreaRef} className="space-y-8 bg-background p-0 rounded-lg printable-area-for-render">
            <DragDropContext onDragEnd={onDragEnd}>
              <ScheduleView
                schedule={schedule}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddNewEvent={handleAddNewEvent}
                cardTitle={cardTitle}
                setCardTitle={setCardTitle}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onSaveEvent={handleSaveEvent}
                editingEvent={editingEvent}
                handleOpenEditModal={handleOpenEditModal}
                handleCloseEditModal={handleCloseEditModal}
                isMobile={isMobile}
                onMoveEvent={moveEvent}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                isAddEventDialogOpen={isAddEventDialogOpen}
                setIsAddEventDialogOpen={setIsAddEventDialogOpen}
                translationDisplayMode={translationDisplayMode}
                selectedLanguages={selectedLanguages}
              />
            </DragDropContext>
          </div>
        
        {/* Render Options Dialog */}
        <Dialog open={isRenderOptionsOpen} onOpenChange={setIsRenderOptionsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Параметры рендеринга</DialogTitle>
                    <DialogDescription>Выберите как вы хотите сохранить изображение.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => renderAction && renderAction({ renderAsMobile: false })}>
                        <Laptop className="h-8 w-8" />
                        <span>Десктоп (широкий)</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => renderAction && renderAction({ renderAsMobile: true })}>
                        <Smartphone className="h-8 w-8" />
                        <span>Мобильный (узкий)</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => renderAction && renderAction({ fitContent: true })}>
                        <Ruler className="h-8 w-8" />
                        <span>По ширине текста</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>


        {isMobile && (
           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetContent>
                  <SheetHeader>
                      <SheetTitle>Меню</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100%-4rem)]">
                    <div className="py-4 flex flex-col gap-4 px-3">
                      <div>
                        <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Экспорт</h3>
                        <Button onClick={() => openRenderOptions(handleShareImage)} variant="ghost" className="justify-start w-full" disabled={isDownloading}>
                          {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Share className="mr-2" />}
                          Поделиться...
                        </Button>
                      </div>

                      <Separator />
                       <div>
                         <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Изображение</h3>
                         <ImageUploader onSetImageUrl={setImageUrl} onOpenChange={(open) => { if (!open) setIsMobileMenuOpen(false) }}>
                           <DialogTrigger asChild>
                              <Button variant="ghost" className="justify-start w-full">
                                 <ImagePlus className="mr-2" /> Изменить изображение
                              </Button>
                           </DialogTrigger>
                         </ImageUploader>
                       </div>

                      <Separator />

                      <div>
                        <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Инструменты</h3>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="justify-start w-full">
                                <Languages className="mr-2" /> Перевести
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Перевод расписания</DialogTitle>
                                <DialogDescription>Выберите языки и стиль отображения.</DialogDescription>
                              </DialogHeader>
                               <div className="py-4 space-y-6">
                                 <div className="space-y-2">
                                     <Label>Языки</Label>
                                     <div className="grid grid-cols-2 gap-4">
                                        {AVAILABLE_LANGUAGES.map(lang => (
                                          <div key={`mobile-lang-${lang.code}`} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`mobile-lang-${lang.code}`}
                                              checked={selectedLanguages.includes(lang.code)}
                                              onCheckedChange={(checked) => {
                                                setSelectedLanguages(prev => 
                                                  checked ? [...prev, lang.code] : prev.filter(c => c !== lang.code)
                                                )
                                              }}
                                            />
                                            <Label htmlFor={`mobile-lang-${lang.code}`} className="font-normal cursor-pointer">{lang.name}</Label>
                                          </div>
                                        ))}
                                     </div>
                                 </div>
                                  <div className="space-y-3">
                                      <Label>Стиль отображения</Label>
                                       <RadioGroup value={translationDisplayMode} onValueChange={(val) => setTranslationDisplayMode(val as TranslationDisplayMode)} className="flex flex-col space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="inline" id="mode-mobile-inline" />
                                            <Label htmlFor="mode-mobile-inline" className="font-normal cursor-pointer">В скобках</Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="block" id="mode-mobile-block" />
                                            <Label htmlFor="mode-mobile-block" className="font-normal cursor-pointer">Под словом</Label>
                                          </div>
                                           <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="text-block" id="mode-mobile-text" />
                                            <Label htmlFor="mode-mobile-text" className="font-normal cursor-pointer">Текстом</Label>
                                          </div>
                                        </RadioGroup>
                                  </div>
                               </div>
                              <DialogFooter className='gap-2 sm:gap-0'>
                                <Button variant="destructive" onClick={handleClearTranslations}>Очистить переводы</Button>
                                <DialogClose asChild>
                                  <Button onClick={handleTranslate} disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Перевести
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Dialog open={isAiParserOpen} onOpenChange={setIsAiParserOpen}>
                            <DialogTrigger asChild>
                               <Button variant="ghost" className="justify-start w-full">
                                <Wand2 className="mr-2" /> ИИ-редактор
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
                              <AiScheduleParser 
                                onParse={handleAiParse} 
                                isLoading={isLoading} 
                                onClose={() => setIsAiParserOpen(false)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="justify-start w-full">
                                <KeyRound className="mr-2" /> Gemini API Key
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Конфигурация Gemini API</DialogTitle>
                                <DialogDescription>Введите ваш API ключ для доступа к Gemini AI.</DialogDescription>
                              </DialogHeader>
                              <div className="py-4 space-y-4">
                                 <div>
                                  <Label htmlFor="api-key-mobile">API Key</Label>
                                  <Input
                                    id="api-key-mobile"
                                    type="password"
                                    placeholder="Ваш API ключ"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                  />
                                 </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleSaveApiConfig}>Сохранить</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" className="justify-start w-full text-destructive hover:text-destructive">
                                      <Trash className="mr-2" /> Очистить всё
                                  </Button>
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
                                      <AlertDialogAction onClick={handleClearAll} className="bg-destructive hover:bg-destructive/90">Очистить</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                     </div>

                     <Separator />

                      <div>
                        <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Библиотека</h3>
                         <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="justify-start w-full">
                                <BookOpen className="mr-2" /> Шаблоны
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
                              <SavedTemplates 
                                templates={savedTemplates}
                                onLoad={(template) => { handleLoadTemplate(template); setIsTemplatesOpen(false); setIsMobileMenuOpen(false); }}
                                onDelete={handleDeleteTemplate}
                                onClose={() => setIsTemplatesOpen(false)}
                                onSaveTemplate={handleSaveTemplate}
                              />
                            </DialogContent>
                          </Dialog>
                          <Dialog open={isSavedEventsOpen} onOpenChange={setIsSavedEventsOpen}>
                             <DialogTrigger asChild>
                              <Button variant="ghost" className="justify-start w-full">
                                <Save className="mr-2" /> Заготовки
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
                               <SavedEvents
                                  savedEvents={savedEvents}
                                  onAdd={handleAddFromSavedClick}
                                  onUpdate={handleUpdateSavedEvent}
                                  onDelete={(id) => {
                                      updateSavedEvents(savedEvents.filter(e => e.id !== id));
                                  }}
                                  onSaveNew={handleSaveEvent}
                                  onClose={() => setIsSavedEventsOpen(false)}
                               />
                            </DialogContent>
                          </Dialog>
                      </div>

                    </div>
                  </ScrollArea>
              </SheetContent>
           </Sheet>
        )}

        <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
          <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить событие</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-2 max-h-[60vh] overflow-y-auto">
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('timed')}>Событие со временем</Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('untimed')}>Событие без времени</Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('date')}>Дата</Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('h1')}>Заголовок H1</Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('h2')}>Заголовок H2</Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('h3')}>Заголовок H3</Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => addNewTypedEvent('comment')}>Комментарий</Button>
                
                {savedEvents.length > 0 && <Separator className="my-4"/>}

                {savedEvents.map(event => (
                  <Button key={event.id} variant="ghost" className="w-full justify-start" onClick={() => { handleAddFromSavedClick(event); setIsAddEventDialogOpen(false); }}>
                      {event.icon ? <ScheduleEventIcon icon={event.icon} className="h-5 w-5 mr-4 text-muted-foreground" /> : <div className="w-5 h-5 mr-4"/>}
                      {event.description}
                  </Button>
                ))}
              </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
