
'use client';

import { useState, useRef, useEffect } from 'react';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import type { IconName } from '@/components/multischedule/schedule-event-icons';
import { parseScheduleFromText } from '@/ai/flows/parse-schedule-text';
import { translateText } from '@/ai/flows/translate-text';
import { useIsMobile } from '@/hooks/use-mobile';
import { DesktopNavbar } from '@/components/multischedule/desktop-navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, Languages, Loader2, Copy, BookOpen, Wand2, Save, Construction, ArrowDown, ArrowUp, Menu, Share, ImagePlus, GripVertical, KeyRound, Smartphone, Laptop, Plus, Trash, Ruler, Paintbrush, Undo, Redo, X, Check, Settings } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ScheduleEventIcon } from '@/components/multischedule/schedule-event-icons';
import * as htmlToImage from 'html-to-image';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { EditableField } from '@/components/multischedule/editable-field';
import { cn } from '@/lib/utils';
import { useHistory } from '@/hooks/use-history';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type AiConfig, type ApiKey, getAiConfig, saveAiConfig } from '@/ai/config';


export const AVAILABLE_LANGUAGES = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский' },
  { code: 'en', name: 'Английский', nativeName: 'English' },
  { code: 'es', name: 'Испанский', nativeName: 'Español' },
  { code: 'fr', name: 'Французский', nativeName: 'Français' },
  { code: 'de', name: 'Немецкий', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Японский', nativeName: '日本語' },
  { code: 'zh', name: 'Китайский', nativeName: '中文' },
];

export const ITEM_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray'];


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
  id:string;
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
export type RenderOptions = { renderAsMobile?: boolean, fitContent?: boolean, withShadow?: boolean };

const defaultSchedule: ScheduleItem[] = [
    { id: `${Date.now()}-${Math.random()}`, time: '', description: '', date: new Date().toISOString(), icon: undefined, type: 'date' },
];

type TextBlockTranslation = {
    title: string;
    content: string;
}

export type ScheduleState = {
  schedule: ScheduleItem[];
  cardTitle: string;
  imageUrl: string | null;
};

export default function Home() {
  const [
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo
  ] = useHistory<ScheduleState>();

  const { schedule, cardTitle, imageUrl } = state || {};


  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<ScheduleTemplate[]>([]);

  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);

  const isMobile = useIsMobile();

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [translationDisplayMode, setTranslationDisplayMode] = useState<TranslationDisplayMode>('inline');
  const [textBlockTranslations, setTextBlockTranslations] = useState<Record<string, TextBlockTranslation>>({});
  const [isAiParserOpen, setIsAiParserOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSavedEventsOpen, setIsSavedEventsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAiSettingsDialogOpen, setIsAiSettingsDialogOpen] = useState(false);
  const [isRenderOptionsOpen, setIsRenderOptionsOpen] = useState(false);
  const [renderAction, setRenderAction] = useState<((options: Omit<RenderOptions, 'withShadow'>) => void) | null>(null);
  const [aiConfig, setAiConfig] = useState<AiConfig>({ apiKeys: [], model: 'gemini-2.5-pro' });
  const [isColorizeOpen, setIsColorizeOpen] = useState(false);


  const setSchedule = (updater: (prev: ScheduleItem[]) => ScheduleItem[], overwriteHistory = false) => {
    const newSchedule = updater(schedule || []);
    setState({ ...state!, schedule: newSchedule }, overwriteHistory);
  };
  
  const setCardTitle = (newTitle: string) => {
    setState({ ...state!, cardTitle: newTitle });
  };

  const setImageUrl = (newUrl: string | null) => {
    setState({ ...state!, imageUrl: newUrl });
  };


  useEffect(() => {
    try {
      const storedState = localStorage.getItem('multiScheduleState');
      if (storedState) {
        const { schedule, cardTitle, imageUrl, translationDisplayMode: storedMode, selectedLanguages: storedLangs, textBlockTranslations: storedTextBlocks } = JSON.parse(storedState);
        setState({
            schedule: schedule || defaultSchedule,
            cardTitle: cardTitle || 'Расписание на день',
            imageUrl: imageUrl || null
        }, true);

        if (storedMode) setTranslationDisplayMode(storedMode);
        if (storedLangs) setSelectedLanguages(storedLangs);
        if (storedTextBlocks) setTextBlockTranslations(storedTextBlocks);

      } else {
        setState({
            schedule: defaultSchedule,
            cardTitle: 'Расписание на день',
            imageUrl: null,
        }, true);
      }

      const storedEvents = localStorage.getItem('savedEvents');
      if (storedEvents) {
        setSavedEvents(JSON.parse(storedEvents));
      }
      const storedTemplates = localStorage.getItem('savedTemplates');
      if (storedTemplates) {
        setSavedTemplates(JSON.parse(storedTemplates));
      }
      setAiConfig(getAiConfig());
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      setState({
          schedule: defaultSchedule,
          cardTitle: 'Расписание на день',
          imageUrl: null,
      }, true);
    }
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
        const stateToSave = { schedule, cardTitle, imageUrl, translationDisplayMode, selectedLanguages, textBlockTranslations };
        localStorage.setItem('multiScheduleState', JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [state, translationDisplayMode, selectedLanguages, textBlockTranslations]);
  
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
    setSchedule(prev => prev.map(item => (item.id === id ? { ...item, ...updatedValues } : item)));

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
            newEvent.description = newEventConfig.description || 'Новая дата';
            newEvent.date = newEventConfig.date || new Date().toISOString();
        }
        if (['h1', 'h2', 'h3', 'untimed', 'comment'].includes(newEvent.type)) {
            newEvent.time = '';
            newEvent.description = 'Новое событие';
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
        items.splice(index, 0, movedItem); // put it back if out of bounds
        return items;
      }
      
      items.splice(newIndex, 0, movedItem);
      return items;
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setSchedule(prev => {
        const items = Array.from(prev);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination!.index, 0, reorderedItem);
        return items;
    });
  };


  const handleTranslate = async () => {
    const apiKeys = aiConfig.apiKeys.map(k => k.key);
    if (apiKeys.length === 0) {
        setIsAiSettingsDialogOpen(true);
        return;
    }
    if (selectedLanguages.length === 0) return;

    setIsTranslating(true);

    const itemsToTranslate = schedule
        .filter(item => item.description && item.type !== 'comment')
        .map(item => ({ id: item.id, text: item.description }));

    if (itemsToTranslate.length === 0) {
        setIsTranslating(false);
        return;
    }
    
    try {
        const results = await translateText({
            items: itemsToTranslate,
            targetLangs: selectedLanguages,
            apiKeys: apiKeys,
            model: aiConfig.model,
        });

        setSchedule(prev => {
            const newSchedule = [...prev];
            Object.entries(results).forEach(([itemId, translations]) => {
                const itemIndex = newSchedule.findIndex(item => item.id === itemId);
                if (itemIndex > -1) {
                    const existingTranslations = newSchedule[itemIndex].translations || {};
                    newSchedule[itemIndex] = {
                        ...newSchedule[itemIndex],
                        translations: { ...existingTranslations, ...translations },
                    };
                }
            });
            return newSchedule;
        }, true); // Overwrite history for translation to avoid many small steps

    } catch (e) {
        console.error("An error occurred during translation:", e);
    } finally {
        setIsTranslating(false);
    }
};

  const handleClearTranslations = () => {
    setSchedule(prev => prev.map(item => ({...item, translations: {}})));
    setTextBlockTranslations({});
  };
  
    const generateCanvas = (options: RenderOptions): Promise<HTMLCanvasElement> => {
        return new Promise(async (resolve, reject) => {
            const element = printableAreaRef.current;
            if (!element) {
                return reject(new Error("Printable area not found"));
            }

            setIsDownloading(true);

            const isDarkMode = document.documentElement.classList.contains('dark');
            const backgroundColor = isDarkMode ? '#09090b' : '#ffffff';

            // 1. Create a clone of the node
            const clone = element.cloneNode(true) as HTMLElement;
            clone.classList.add('cloned-for-rendering');
            
            // 2. Apply styles for rendering
            if (options.withShadow) {
                clone.style.border = '20px solid transparent';
            } else {
                const cardElement = clone.querySelector('.shadow-lg.sm\\:border');
                if (cardElement) {
                    cardElement.classList.add('hide-border-on-print');
                }
            }
            
            if (options.renderAsMobile) {
                clone.style.width = '420px'; 
                clone.classList.add('render-mobile-padding');
            } else if (options.fitContent) {
                clone.style.width = 'auto';
                clone.style.display = 'inline-block';
            } else {
                clone.style.width = `${element.offsetWidth}px`;
            }

            clone.querySelectorAll('[data-no-print="true"]').forEach(el => (el as HTMLElement).style.display = 'none');
            clone.querySelectorAll('[data-make-invisible]').forEach(el => (el as HTMLElement).style.visibility = 'hidden');
            
            document.body.appendChild(clone);

            // 3. Wait for the next animation frame to let the browser apply styles
            requestAnimationFrame(() => {
                setTimeout(async () => { // Additional timeout to ensure images are loaded
                    try {
                        const canvas = await htmlToImage.toCanvas(clone, {
                            pixelRatio: 2,
                            backgroundColor: backgroundColor,
                            fetchRequestInit: {
                                mode: 'cors',
                                cache: 'no-cache'
                            }
                        });
                        resolve(canvas);
                    } catch (error) {
                        console.error("Error generating canvas with html-to-image", error);
                        reject(error);
                    } finally {
                        // 4. Clean up
                        document.body.removeChild(clone);
                        setIsDownloading(false);
                    }
                }, 2000); // 2 second delay for images to load
            });
        });
    };


  const handleDownloadImage = async (options: RenderOptions) => {
    try {
        const canvas = await generateCanvas(options);
        if (!canvas) return;
        
        const link = document.createElement('a');
        link.download = 'multischedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error("Download failed:", error);
    }
  };

  const handleCopyImage = async (options: RenderOptions) => {
    try {
        const canvas = await generateCanvas(options);
        if (!canvas) return;

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
    try {
      const canvas = await generateCanvas(options);
      if (!canvas) {
        throw new Error('Canvas generation failed');
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error('Не удалось создать blob из canvas');
          return;
        }

        const file = new File([blob], "multischedule.png", { type: "image/png" });
        const filesArray = [file];

        if (navigator.canShare && navigator.canShare({ files: filesArray })) {
          try {
            await navigator.share({
              files: filesArray,
              title: 'Мое расписание',
              text: cardTitle,
            });
            console.log('Успешно отправлено!');
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              console.error('Не удалось отправить картинку:', error);
            }
          }
        } else {
          console.log("Этот браузер не поддерживает шаринг файлов.");
          // Fallback: download the image
          const link = document.createElement('a');
          link.download = 'multischedule.png';
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      }, 'image/png');

    } catch (error) {
      console.error('Не удалось создать или отправить картинку:', error);
    }
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
    if (!schedule || !cardTitle) return;
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
    setState({
        schedule: template.schedule.map(item => ({...item, id: `${Date.now()}-${Math.random()}`})), // new IDs
        cardTitle: template.cardTitle,
        imageUrl: template.imageUrl,
    });
  };
  
  const handleDeleteTemplate = (id: string) => {
    updateSavedTemplates(savedTemplates.filter(template => template.id !== id));
  };

  const handleAiParse = async (text: string) => {
    const apiKeys = aiConfig.apiKeys.map(k => k.key);
    if (apiKeys.length === 0) {
        setIsAiSettingsDialogOpen(true);
        return;
    }
    
    setIsLoading(true);
    setIsAiParserOpen(false);
    setIsMobileMenuOpen(false);

    try {
        const result = await parseScheduleFromText({ text, apiKeys: apiKeys, model: aiConfig.model });
        if (result) {
            const newScheduleItems: ScheduleItem[] = result.schedule.map(item => ({
                ...item,
                id: `${Date.now()}-${Math.random()}`,
                time: item.time || '',
                description: item.description || '',
            }));
            
            setState({
                schedule: newScheduleItems,
                cardTitle: result.cardTitle,
                imageUrl: state?.imageUrl ?? null,
            });
        }
    } catch (e) {
        console.error("AI parsing failed:", e);
        // Optionally, show a toast to the user
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdateSavedEvent = (updatedEvent: SavedEvent) => {
    const newEvents = savedEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    updateSavedEvents(newEvents);
  }

  const updateAiConfig = (newConfig: AiConfig) => {
    setAiConfig(newConfig);
    saveAiConfig(newConfig);
  };
  
  const openRenderOptions = (action: (options: Omit<RenderOptions, 'withShadow'>) => void) => {
    setRenderAction(() => action); // Store the action itself
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
    handleAddNewEvent(config);
  }

  const handleClearAll = () => {
    setState({
        schedule: defaultSchedule,
        cardTitle: 'Расписание на день',
        imageUrl: null
    });
    setIsMobileMenuOpen(false);
  }

  const handleColorize = (mode: 'single' | 'rainbow' | 'random', color?: string) => {
    let newSchedule: ScheduleItem[];

    if (!schedule) return;
    
    switch (mode) {
        case 'single':
            newSchedule = schedule.map(item => ({ ...item, color: color }));
            break;
        case 'rainbow':
            newSchedule = schedule.map((item, index) => ({ ...item, color: ITEM_COLORS[index % ITEM_COLORS.length] }));
            break;
        case 'random':
            newSchedule = schedule.map(item => ({ ...item, color: ITEM_COLORS[Math.floor(Math.random() * ITEM_COLORS.length)] }));
            break;
        default:
            newSchedule = schedule;
            break;
    }
    setSchedule(() => newSchedule);
    setIsColorizeOpen(false);
    setIsMobileMenuOpen(false);
  };
  
  const renderTextTranslation = (lang: string, scheduleToRender: ScheduleItem[]) => {
    if (!scheduleToRender) return '';
    const content = scheduleToRender.map(item => {
        const translatedDescription = item.translations?.[lang] ?? item.description;

        switch (item.type) {
            case 'timed':
                return `${item.time} ${translatedDescription}`;
            case 'untimed':
                return `- ${translatedDescription}`;
            case 'comment':
                return `// ${translatedDescription}`;
            case 'date':
                if (item.date) {
                    const dateString = format(new Date(item.date), 'dd.MM.yyyy', { locale: ru });
                    return `\n== ${dateString}${translatedDescription ? ` (${translatedDescription})` : ''} ==`;
                }
                return '';
            case 'h1':
                return `\n# ${translatedDescription}`;
            case 'h2':
                return `## ${translatedDescription}`;
            case 'h3':
                return `### ${translatedDescription}`;
            default:
                return '';
        }
    }).join('\n');
    return content.trim();
};

const updateTextBlockTranslations = () => {
    if (!schedule) return;
    const newTextBlocks: Record<string, TextBlockTranslation> = {};
    selectedLanguages.forEach(lang => {
        const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === lang);
        const langName = langInfo?.nativeName || langInfo?.name || lang;
        newTextBlocks[lang] = {
            title: textBlockTranslations[lang]?.title || langName,
            content: renderTextTranslation(lang, schedule),
        }
    });
    setTextBlockTranslations(newTextBlocks);
};

useEffect(() => {
    if (translationDisplayMode === 'text-block' && selectedLanguages.length > 0) {
        updateTextBlockTranslations();
    }
}, [translationDisplayMode, selectedLanguages, schedule, cardTitle]);

const handleTextBlockChange = (lang: string, field: 'title' | 'content', value: string) => {
    setTextBlockTranslations(prev => ({
        ...prev,
        [lang]: {
            ...prev[lang],
            [field]: value
        }
    }));
};

const handleRemoveLanguageFromTextBlock = (lang: string) => {
    setSelectedLanguages(prev => prev.filter(l => l !== lang));
    setTextBlockTranslations(prev => {
        const newBlocks = { ...prev };
        delete newBlocks[lang];
        return newBlocks;
    });
};


  if (!state) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }


  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {!isMobile && <DesktopNavbar 
            isLoading={isLoading}
            isTranslating={isTranslating}
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
            onTranslate={() => handleTranslate()}
            onClearTranslations={handleClearTranslations}
            isAiParserOpen={isAiParserOpen}
            setIsAiParserOpen={setIsAiParserOpen}
            setImageUrl={setImageUrl}
            onClearAll={handleClearAll}
            onSaveEvent={handleSaveEvent}
            translationDisplayMode={translationDisplayMode}
            setTranslationDisplayMode={setTranslationDisplayMode}
            isAiSettingsDialogOpen={isAiSettingsDialogOpen}
            setIsAiSettingsDialogOpen={setIsAiSettingsDialogOpen}
            aiConfig={aiConfig}
            updateAiConfig={updateAiConfig}
            isColorizeOpen={isColorizeOpen}
            setIsColorizeOpen={setIsColorizeOpen}
            onColorize={handleColorize}
            itemColors={ITEM_COLORS}
            undo={undo}
            redo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
        />}

        
          <div ref={printableAreaRef}>
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
                itemColors={ITEM_COLORS}
              />
            </DragDropContext>
          
           {translationDisplayMode === 'text-block' && selectedLanguages.length > 0 && schedule.length > 0 && (
                <div className={cn(
                    "border bg-card text-card-foreground",
                    "rounded-b-lg border-t-0 rounded-t-none shadow-none"
                )}>
                    {selectedLanguages.map((lang, index) => (
                            <div key={lang}>
                                {index > 0 && <Separator />}
                                <div className="p-4 flex-row items-center justify-between">
                                    <div className='flex items-center justify-between'>
                                        <EditableField
                                            as="h2"
                                            className="text-lg font-semibold leading-none tracking-tight flex-1"
                                            value={textBlockTranslations[lang]?.title || ''}
                                            setValue={(value) => handleTextBlockChange(lang, 'title', value)}
                                            isMobile={isMobile}
                                        />
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveLanguageFromTextBlock(lang)} data-no-print="true">
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Textarea
                                        value={textBlockTranslations[lang]?.content || ''}
                                        onChange={(e) => handleTextBlockChange(lang, 'content', e.target.value)}
                                        className="text-sm font-sans whitespace-pre-wrap p-0 border-none focus-visible:ring-0 shadow-none h-auto min-h-[100px] resize-none mt-2"
                                        rows={Math.max(5, (textBlockTranslations[lang]?.content || '').split('\n').length)}
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
           )}
         </div>

        
        {/* Render Options Dialog */}
        <Dialog open={isRenderOptionsOpen} onOpenChange={setIsRenderOptionsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Параметры рендеринга</DialogTitle>
                    <DialogDescription>Выберите как вы хотите сохранить изображение.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => { if (renderAction) { renderAction({ renderAsMobile: false, fitContent: false }); setIsRenderOptionsOpen(false); } }}>
                            <Laptop className="h-8 w-8" />
                            <span>Десктоп (широкий)</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => { if (renderAction) { renderAction({ renderAsMobile: true, fitContent: false }); setIsRenderOptionsOpen(false); } }}>
                            <Smartphone className="h-8 w-8" />
                            <span>Мобильный (узкий)</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => { if (renderAction) { renderAction({ fitContent: true, renderAsMobile: false }); setIsRenderOptionsOpen(false); } }}>
                            <Ruler className="h-8 w-8" />
                            <span>По ширине текста</span>
                        </Button>
                    </div>
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
                        <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Правка</h3>
                        <Button onClick={() => { undo(); setIsMobileMenuOpen(false); }} variant="ghost" className="justify-start w-full" disabled={!canUndo}>
                            <Undo className="mr-2" /> Отменить
                        </Button>
                         <Button onClick={() => { redo(); setIsMobileMenuOpen(false); }} variant="ghost" className="justify-start w-full" disabled={!canRedo}>
                            <Redo className="mr-2" /> Повторить
                        </Button>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Экспорт</h3>
                        <Button onClick={() => openRenderOptions((options) => handleShareImage({ ...options, withShadow: false }))} variant="ghost" className="justify-start w-full" disabled={isDownloading}>
                          {isDownloading ? <Loader2 className="mr-2 animate-spin" /> : <Share className="mr-2" />}
                          Поделиться...
                        </Button>
                      </div>

                      <Separator />
                       <div>
                         <h3 className="mb-2 font-semibold text-sm text-muted-foreground px-2">Изображение</h3>
                         <ImageUploader onSetImageUrl={(url) => setImageUrl(url)} onOpenChange={(open) => { if (!open) setIsMobileMenuOpen(false) }}>
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
                                  <Button onClick={() => handleTranslate()} disabled={isTranslating}>
                                    {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Перевести
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                           <Dialog open={isColorizeOpen} onOpenChange={setIsColorizeOpen}>
                              <DialogTrigger asChild>
                                 <Button variant="ghost" className="justify-start w-full">
                                    <Paintbrush className="mr-2" /> Раскрасить
                                 </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <ColorizeDialogContent onColorize={handleColorize} itemColors={ITEM_COLORS} />
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
                          <Dialog open={isAiSettingsDialogOpen} onOpenChange={setIsAiSettingsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" className="justify-start w-full">
                                <Settings className="mr-2" /> Настройки ИИ
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <AiSettingsDialogContent 
                                    aiConfig={aiConfig} 
                                    updateAiConfig={updateAiConfig}
                                    onClose={() => setIsAiSettingsDialogOpen(false)} 
                                />
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
                                  itemColors={ITEM_COLORS}
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


export function AiSettingsDialogContent({ aiConfig, updateAiConfig, onClose }: { aiConfig: AiConfig, updateAiConfig: (config: AiConfig) => void, onClose: () => void }) {
    const [newKey, setNewKey] = useState('');

    const addKey = () => {
        if (newKey && !aiConfig.apiKeys.some(k => k.key === newKey)) {
            const newApiKeys = [...aiConfig.apiKeys, { id: `key-${Date.now()}`, key: newKey }];
            updateAiConfig({ ...aiConfig, apiKeys: newApiKeys });
            setNewKey('');
        }
    };

    const deleteKey = (id: string) => {
        const newApiKeys = aiConfig.apiKeys.filter(k => k.id !== id);
        updateAiConfig({ ...aiConfig, apiKeys: newApiKeys });
    };

    const setModel = (model: string) => {
        updateAiConfig({ ...aiConfig, model });
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Настройки ИИ</DialogTitle>
                <DialogDescription>
                    Управляйте вашими Gemini API ключами и выберите модель. Вы можете <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">получить ключ здесь</a>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
                <div className="space-y-2">
                    <Label>Модель ИИ</Label>
                    <Input 
                        value={aiConfig.model} 
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="например, gemini-2.5-pro"
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>API Ключи</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                placeholder="Вставьте новый API ключ"
                                onKeyDown={(e) => e.key === 'Enter' && addKey()}
                            />
                            <Button onClick={addKey}><Plus /></Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {aiConfig.apiKeys.length > 0 ? (
                            aiConfig.apiKeys.map((apiKey) => (
                                <div key={apiKey.id} className="flex items-center gap-2 p-2 border rounded-lg">
                                    <Label className="flex-1 truncate">
                                        {`...${apiKey.key.slice(-4)}`}
                                    </Label>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteKey(apiKey.id)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center">У вас еще нет ключей.</p>
                        )}
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={onClose}>Закрыть</Button>
            </DialogFooter>
        </>
    );
}

export function ColorizeDialogContent({ onColorize, itemColors }: { onColorize: (mode: 'single' | 'rainbow' | 'random', color?: string) => void, itemColors: string[] }) {
    const [selectedColor, setSelectedColor] = useState(itemColors[0]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Раскрасить расписание</DialogTitle>                <DialogDescription>Примените цвет к элементам вашего расписания.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label>Один цвет</Label>
                    <div className="flex items-center gap-2">
                        <div className="grid grid-cols-4 gap-2 flex-1">
                            {itemColors.map(color => (
                                <Button
                                    key={color}
                                    variant={selectedColor === color ? 'secondary' : 'ghost'}
                                    size="icon"
                                    className="h-10 w-10 rounded-full"
                                    onClick={() => setSelectedColor(color)}
                                >
                                    <div className={`h-6 w-6 rounded-full bg-${color}-500`} />
                                </Button>
                            ))}
                        </div>
                        <Button onClick={() => onColorize('single', selectedColor)} className="h-24 flex-1">Применить</Button>
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => onColorize('rainbow')}>Радуга</Button>
                    <Button variant="outline" onClick={() => onColorize('random')}>Случайно</Button>
                </div>
            </div>
        </>
    );
}
