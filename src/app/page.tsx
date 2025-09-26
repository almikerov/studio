'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { translateSchedule } from '@/ai/flows/translate-schedule';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { EditableTitle } from '@/components/multischedule/editable-title';
import { IconName } from '@/components/multischedule/schedule-event-icons';
import { SavedEvents } from '@/components/multischedule/saved-events';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { translateText } from '@/ai/flows/translate-text';

export type ScheduleItem = { id: string; time: string; description: string; icon?: IconName };
export type TranslatedSchedule = { lang: string; text: string };

export type SavedEvent = {
  id: string;
  description: string;
  icon?: IconName;
  translations: Record<string, string>;
};

export default function Home() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: '1', time: '09:00', description: 'Утренняя встреча' },
    { id: '2', time: '12:30', description: 'Обед' },
    { id: '3', time: '18:00', description: 'Завершение рабочего дня' },
  ]);
  const [translatedSchedules, setTranslatedSchedules] = useState<TranslatedSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const [mainTitle, setMainTitle] = useState('Название');
  const [cardTitle, setCardTitle] = useState('Расписание на день');
  const [cardDescription, setCardDescription] = useState('Ваш план на сегодня. Нажмите на событие, чтобы редактировать.');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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

  const handleUpdateEvent = (id: string, time: string, description: string, icon?: IconName) => {
    setSchedule(prev => prev.map(item => (item.id === id ? { ...item, time, description, icon } : item)).sort((a,b) => a.time.localeCompare(b.time)));
  };

  const handleAddNewEvent = () => {
    const newEvent: ScheduleItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: 'Новое событие',
    };
    setSchedule(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
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

  const handleDownloadImage = () => {
    const element = printableAreaRef.current;
    if (element) {
      html2canvas(element, {
        backgroundColor: '#1C1917', // dark theme background
        scale: 2,
        useCORS: true,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'multischedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error("Error generating canvas: ", err);
        toast({
          title: "Ошибка загрузки изображения",
          description: "Не удалось обработать изображение. Попробуйте другой URL или убедитесь, что CORS разрешен.",
          variant: "destructive"
        })
      });
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
    const translatedLanguages = translatedSchedules.map(t => t.lang);
  
    if (translatedLanguages.length === 0) {
      const newSavedEvent: SavedEvent = {
        id: Date.now().toString(),
        description,
        icon,
        translations: {},
      };
      updateSavedEvents([...savedEvents, newSavedEvent]);
      toast({ title: 'Сохранено', description: 'Событие сохранено без переводов.' });
      return;
    }
  
    setIsLoading(true);
    try {
      const translationResult = await translateText({ text: description, targetLanguages: translatedLanguages });
      const newSavedEvent: SavedEvent = {
        id: Date.now().toString(),
        description,
        icon,
        translations: translationResult.translations,
      };
      updateSavedEvents([...savedEvents, newSavedEvent]);
      toast({ title: 'Сохранено', description: 'Событие и его переводы сохранены.' });
    } catch (error) {
      console.error('Failed to save event with translations:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить переводы для события.',
        variant: 'destructive',
      });
      // Save without translations as a fallback
      const newSavedEvent: SavedEvent = {
        id: Date.now().toString(),
        description,
        icon,
        translations: {},
      };
      updateSavedEvents([...savedEvents, newSavedEvent]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFromSaved = (savedEvent: SavedEvent) => {
    const newScheduleEvent: ScheduleItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: savedEvent.description,
      icon: savedEvent.icon,
    };
    setSchedule(prev => [...prev, newScheduleEvent].sort((a,b) => a.time.localeCompare(b.time)));
    
    // Also update translations
    setTranslatedSchedules(prev => {
        const currentLanguages = prev.map(t => t.lang);
        const newTranslations = [...prev];

        for (const lang of currentLanguages) {
            const translatedDesc = savedEvent.translations[lang];
            if (translatedDesc) {
                const existingTranslationIndex = newTranslations.findIndex(t => t.lang === lang);
                if (existingTranslationIndex !== -1) {
                    const existingText = newTranslations[existingTranslationIndex].text;
                    const newText = `${existingText}\n${newScheduleEvent.time}: ${translatedDesc}`;
                    newTranslations[existingTranslationIndex] = { ...newTranslations[existingTranslationIndex], text: newText };
                }
            }
        }
        return newTranslations;
    });
  };

  const handleDeleteSaved = (id: string) => {
    updateSavedEvents(savedEvents.filter(event => event.id !== id));
  };
  
  return (
    <main className="container mx-auto p-4 sm:p-8">
      <header className="text-center mb-12">
        <EditableTitle value={mainTitle} setValue={setMainTitle} className="font-headline text-4xl sm:text-5xl font-bold tracking-tight" />
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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
                cardDescription={cardDescription}
                setCardDescription={setCardDescription}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onSaveEvent={handleSaveEvent}
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
            onTranslate={handleTranslate}
            onDownload={handleDownloadImage}
          />
        </section>

        <aside className="space-y-8">
            <SavedEvents 
                savedEvents={savedEvents}
                onAdd={handleAddFromSaved}
                onDelete={handleDeleteSaved}
            />
        </aside>

      </div>
    </main>
  );
}
