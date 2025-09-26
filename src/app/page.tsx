'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { translateSchedule } from '@/ai/flows/translate-schedule';
import { EventForm } from '@/components/multischedule/event-form';
import { SavedEvents } from '@/components/multischedule/saved-events';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';

export type ScheduleItem = { id: number; time: string; description: string };
export type SavedEvent = { description: string };
export type TranslatedSchedules = Record<string, string>;

export default function Home() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 1, time: '09:00', description: 'Утренняя встреча' },
    { id: 2, time: '12:30', description: 'Обед' },
    { id: 3, time: '18:00', description: 'Завершение рабочего дня' },
  ]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([
    { description: 'Кофе-брейк' },
    { description: 'Проверка почты' },
  ]);
  const [translatedSchedules, setTranslatedSchedules] = useState<TranslatedSchedules | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const handleAddEvent = (time: string, description: string, save: boolean) => {
    if (!time || !description) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, укажите время и описание события.',
        variant: 'destructive',
      });
      return;
    }
    const newEvent: ScheduleItem = { id: Date.now(), time, description };
    setSchedule([...schedule].sort((a, b) => a.time.localeCompare(b.time)));
    
    setSchedule(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));


    if (save && !savedEvents.some(e => e.description === description)) {
      setSavedEvents(prev => [...prev, { description }]);
    }
  };

  const handleDeleteEvent = (id: number) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  const handleAddSavedEvent = (description: string) => {
    const defaultTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvent: ScheduleItem = { id: Date.now(), time: defaultTime, description };
    setSchedule(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleTranslate = async (languages: string[]) => {
    if (schedule.length === 0) {
      toast({ title: 'Ошибка', description: 'Ваше расписание пустое.', variant: 'destructive' });
      return;
    }
    if (languages.length === 0) {
      toast({ title: 'Ошибка', description: 'Пожалуйста, выберите хотя бы один язык для перевода.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setTranslatedSchedules(null);

    const scheduleText = schedule.map(item => `${item.time}: ${item.description}`).join('\n');

    try {
      const result = await translateSchedule({ scheduleText, targetLanguages: languages });
      setTranslatedSchedules(result);
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
        backgroundColor: '#F0F4F8',
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'multischedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">MultiSchedule</h1>
        <p className="text-muted-foreground mt-2 text-lg">Создавайте, переводите и делитесь своим расписанием</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
          <EventForm onAddEvent={handleAddEvent} />
          <SavedEvents savedEvents={savedEvents} onAddSavedEvent={handleAddSavedEvent} />
        </aside>

        <section className="lg:col-span-8 xl:col-span-9 space-y-8">
          <div ref={printableAreaRef} className="space-y-8 bg-background p-0 -m-4 sm:p-0 rounded-lg">
            <ScheduleView schedule={schedule} onDeleteEvent={handleDeleteEvent} />
            <TranslatedSchedulesView translatedSchedules={translatedSchedules} />
          </div>

          <TranslationControls
            isLoading={isLoading}
            onTranslate={handleTranslate}
            onDownload={handleDownloadImage}
            hasTranslations={!!translatedSchedules}
          />
        </section>
      </div>
    </main>
  );
}
