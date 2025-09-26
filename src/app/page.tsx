
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
import type { IconName } from '@/components/multischedule/schedule-event-icons';

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

  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem('savedEvents');
      if (storedEvents) {
        setSavedEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error("Failed to load saved events from localStorage", error);
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


  const languageMap = useMemo(() => new Map(translatedSchedules.map(t => [t.lang, t.text])), [translatedSchedules]);

  const handleUpdateEvent = (id: string, updatedValues: Partial<Omit<ScheduleItem, 'id'>>) => {
    setSchedule(prev => prev.map(item => (item.id === id ? { ...item, ...updatedValues } : item)));
  };
  

  const handleAddNewEvent = () => {
    const newEvent: ScheduleItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: 'Новое событие',
      icon: undefined,
    };
    setSchedule(prev => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
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
      toast({ title: 'Ошибка', description: 'Все выбранные языки уже переведены.', variant: 'destructive' });
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

  const handleDownloadImage = async () => {
    const element = printableAreaRef.current;
    if (!element) return;
  
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
      
      const link = document.createElement('a');
      link.download = 'multischedule.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
  
    } catch (err) {
      console.error("Error generating canvas: ", err);
      toast({
        title: "Ошибка загрузки изображения",
        description: "Не удалось обработать изображение. Попробуйте другой URL или убедитесь, что CORS разрешен.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteTranslation = (lang: string) => {
    setTranslatedSchedules(prev => prev.filter(t => t.lang !== lang));
  };

  const handleUpdateTranslation = (lang: string, newText: string) => {
    setTranslatedSchedules(prev => prev.map(t => t.lang === lang ? { ...t, text: newText } : t));
  };
  
  const handleSaveEvent = async (scheduleItem: ScheduleItem) => {
    const { description, icon } = scheduleItem;

    const newSavedEvent: SavedEvent = {
      id: Date.now().toString(),
      description,
      icon,
    };
    updateSavedEvents([...savedEvents, newSavedEvent]);
    toast({ title: 'Сохранено', description: 'Событие сохранено.' });
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
  
  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pt-12">
        <section className="lg:col-span-2 space-y-8">
          <DragDropContext onDragEnd={onDragEnd}>
            <div ref={printableAreaRef} className="space-y-8 bg-background p-0 sm:p-4 rounded-lg">
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
          />
        </section>

        <aside className="space-y-8">
            <SavedEvents 
                savedEvents={savedEvents}
                onAdd={handleAddFromSaved}
                onDelete={handleDeleteSaved}
                onUpdate={handleUpdateSaved}
            />
        </aside>

      </div>
    </main>
  );
}
