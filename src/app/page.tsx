

'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { translateSchedule } from '@/ai/flows/translate-schedule';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { SavedEvents } from '@/components/multischedule/saved-events';
import { SavedTemplates } from '@/components/multischedule/saved-templates';
import type { IconName } from '@/components/multischedule/schedule-event-icons';
import { AiScheduleParser } from '@/components/multischedule/ai-schedule-parser';
import { parseScheduleFromText } from '@/ai/flows/parse-schedule-text';
import { useIsMobile } from '@/hooks/use-mobile';


export type ScheduleItem = { 
  id: string; 
  time: string; 
  description: string; 
  icon?: IconName; 
  color?: string;
  isUntimed?: boolean;
};
export type TranslatedSchedule = { lang: string; text: string };

export type SavedEvent = {
  id: string;
  description: string;
  icon?: IconName;
};

export type ScheduleTemplate = {
  id: string;
  name: string;
  schedule: ScheduleItem[];
  cardTitle: string;
  comment: string;
  imageUrl: string | null;
};

export default function Home() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: '1', time: '09:00', description: 'Утренняя встреча', icon: 'camera', color: 'blue' },
    { id: '2', time: '12:30', description: 'Обед', icon: 'utensils' },
    { id: '3', time: '18:00', description: 'Завершение рабочего дня', icon: 'bed' },
    { id: '4', time: '', description: 'Купить билеты', icon: 'passport', isUntimed: true },
  ]);
  const [translatedSchedules, setTranslatedSchedules] = useState<TranslatedSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const [cardTitle, setCardTitle] = useState('Расписание на день');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<ScheduleTemplate[]>([]);

  const [editingEvent, setEditingEvent] = useState<ScheduleItem | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem('savedEvents');
      if (storedEvents) {
        setSavedEvents(JSON.parse(storedEvents));
      }
      const storedTemplates = localStorage.getItem('savedTemplates');
      if (storedTemplates) {
        setSavedTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
    }
  }, []);
  
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
  }


  const languageMap = useMemo(() => new Map(translatedSchedules.map(t => [t.lang, t.text])), [translatedSchedules]);

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
  

  const handleAddNewEvent = (fromSaved?: SavedEvent) => {
    const newEvent: ScheduleItem = {
      id: Date.now().toString(),
      time: fromSaved ? '' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: fromSaved ? fromSaved.description : 'Новое событие',
      icon: fromSaved?.icon,
      isUntimed: !!fromSaved,
    };
    setSchedule(prev => [...prev, newEvent]);
    if (isMobile) {
      setEditingEvent(newEvent);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
    if (editingEvent?.id === id) {
      setEditingEvent(null);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    
    setSchedule(prev => {
      const items = Array.from(prev);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      return items;
    });
  };

  const handleTranslate = async (languages: string[]) => {
    if (schedule.length === 0) {
      toast({ title: 'Ошибка', description: 'Ваше расписание пустое.', variant: 'destructive' });
      return;
    }
    const languagesToTranslate = languages.filter(lang => !languageMap.has(lang));
    
    if (languagesToTranslate.length === 0) {
      toast({ title: 'Перевод не требуется', description: 'Все выбранные языки уже переведены.' });
      return;
    }

    setIsLoading(true);

    const scheduleText = schedule.map(item => `${item.time}: ${item.description}`).join('\n');

    try {
      const result = await translateSchedule({ scheduleText, targetLanguages: languagesToTranslate });
      const newTranslations = Object.entries(result).map(([lang, text]) => ({ lang, text }));
      setTranslatedSchedules(prev => [...prev, ...newTranslations]);
    } catch (error) {
      console.error('Translation failed:', error);
      toast({
        title: 'Ошибка перевода',
        description: 'Не удалось перевести расписание. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const element = printableAreaRef.current;
    if (!element) return null;

    setIsDownloading(true);
    try {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      await new Promise(resolve => setTimeout(resolve, 50));
  
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
            const footer = clonedDoc.getElementById('card-footer');
            if (footer) footer.style.display = 'none';

            const dragHandles = clonedDoc.querySelectorAll('[data-drag-handle]');
            dragHandles.forEach(handle => {
                if (handle instanceof HTMLElement) handle.style.display = 'none';
            });
            const imageUploaderTrigger = clonedDoc.getElementById('image-uploader-trigger');
            if(imageUploaderTrigger) imageUploaderTrigger.style.display = 'none';

            if (!comment) {
              const commentsContainer = clonedDoc.getElementById('comments-container');
              if (commentsContainer) commentsContainer.style.display = 'none';
            }
        }
      });
      return canvas;
    } catch (err) {
      console.error("Error generating canvas: ", err);
      toast({
        title: "Ошибка обработки изображения",
        description: "Не удалось обработать изображение. Попробуйте другой URL или убедитесь, что CORS разрешен.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsDownloading(false);
    }
  }

  const handleDownloadImage = async () => {
    const canvas = await generateCanvas();
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'multischedule.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = await generateCanvas();
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Не удалось создать blob из canvas');
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        toast({
          title: "Скопировано",
          description: "Изображение скопировано в буфер обмена.",
        });
      }, 'image/png');
    } catch (err) {
      console.error("Ошибка копирования в буфер обмена: ", err);
      toast({
        title: "Ошибка копирования",
        description: "Ваш браузер может не поддерживать эту функцию, или было отказано в доступе.",
        variant: "destructive"
      });
    }
  }

  const handleDeleteTranslation = (lang: string) => {
    setTranslatedSchedules(prev => prev.filter(t => t.lang !== lang));
  };

  const handleUpdateTranslation = (lang: string, newText: string) => {
    setTranslatedSchedules(prev => prev.map(t => t.lang === lang ? { ...t, text: newText } : t));
  };
  
  const handleSaveEvent = async (scheduleItem: ScheduleItem) => {
    const { description, icon } = scheduleItem;

    // Check for duplicates
    if (savedEvents.some(e => e.description === description)) {
      toast({ title: 'Уже сохранено', description: 'Событие с таким описанием уже есть в ваших заготовках.', variant: 'default' });
      return;
    }

    const newSavedEvent: SavedEvent = {
      id: Date.now().toString(),
      description,
      icon,
    };
    updateSavedEvents([...savedEvents, newSavedEvent]);
    toast({ title: 'Сохранено', description: 'Событие добавлено в заготовки.' });
  };

  const handleAddFromSaved = (savedEvent: SavedEvent) => {
    const newScheduleEvent: ScheduleItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: savedEvent.description,
      icon: savedEvent.icon,
    };
    setSchedule(prev => [...prev, newScheduleEvent]);
  };

  const handleDeleteSaved = (id: string) => {
    updateSavedEvents(savedEvents.filter(event => event.id !== id));
  };

  const handleUpdateSaved = (updatedEvent: SavedEvent) => {
    updateSavedEvents(savedEvents.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  };

  const handleSaveTemplate = (name: string) => {
    const newTemplate: ScheduleTemplate = {
      id: Date.now().toString(),
      name,
      schedule,
      cardTitle,
      comment,
      imageUrl,
    };
    updateSavedTemplates([...savedTemplates, newTemplate]);
    toast({ title: 'Шаблон сохранен', description: `Шаблон "${name}" был сохранен.` });
  };
  
  const handleLoadTemplate = (template: ScheduleTemplate) => {
    setSchedule(template.schedule.map(item => ({...item, id: Date.now().toString() + Math.random()}))); // new IDs
    setCardTitle(template.cardTitle);
    setComment(template.comment);
    setImageUrl(template.imageUrl);
    setTranslatedSchedules([]); // Clear translations
    toast({ title: 'Шаблон загружен', description: `Загружен шаблон "${template.name}".` });
  };
  
  const handleDeleteTemplate = (id: string) => {
    updateSavedTemplates(savedTemplates.filter(template => template.id !== id));
  };

  const handleAiParse = async (text: string) => {
    setIsLoading(true);
    try {
      const result = await parseScheduleFromText({ text });
      const newScheduleItems = result.schedule.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        isUntimed: !item.time,
      }));
      setSchedule(newScheduleItems);
      setCardTitle(result.cardTitle);
      setTranslatedSchedules([]);
      toast({ title: 'Расписание сгенерировано', description: 'ИИ проанализировал ваш текст и создал расписание.' });
    } catch (error) {
      console.error('AI parsing failed:', error);
      toast({
        title: 'Ошибка генерации',
        description: 'Не удалось создать расписание из текста. Попробуйте перефразировать запрос.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div ref={printableAreaRef} className="space-y-8 bg-background p-0 rounded-lg">
            <ScheduleView
              schedule={schedule}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddNewEvent={handleAddNewEvent}
              cardTitle={cardTitle}
              setCardTitle={setCardTitle}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              onSaveEvent={handleSaveEvent}
              comment={comment}
              setComment={setComment}
              onSaveTemplate={handleSaveTemplate}
              editingEvent={editingEvent}
              handleOpenEditModal={handleOpenEditModal}
              handleCloseEditModal={handleCloseEditModal}
              savedEvents={savedEvents}
              isMobile={isMobile}
            />
            <TranslatedSchedulesView 
              translatedSchedules={translatedSchedules}
              onDelete={handleDeleteTranslation}
              onUpdate={handleUpdateTranslation}
            />
          </div>
        </DragDropContext>

        <TranslationControls
          isLoading={isLoading}
          isDownloading={isDownloading}
          onTranslate={handleTranslate}
          onDownload={handleDownloadImage}
          onCopy={handleCopyImage}
          templates={savedTemplates}
          onLoadTemplate={handleLoadTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onAiParse={handleAiParse}
        />
      </div>
    </main>
  );
}

    

    