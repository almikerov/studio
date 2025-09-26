'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { translateSchedule } from '@/ai/flows/translate-schedule';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';

export type ScheduleItem = { id: number; time: string; description: string };
export type TranslatedSchedules = Record<string, string>;

export default function Home() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: 1, time: '09:00', description: 'Утренняя встреча' },
    { id: 2, time: '12:30', description: 'Обед' },
    { id: 3, time: '18:00', description: 'Завершение рабочего дня' },
  ]);
  const [translatedSchedules, setTranslatedSchedules] = useState<TranslatedSchedules | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const handleUpdateEvent = (id: number, time: string, description: string) => {
    setSchedule(prev => prev.map(item => (item.id === id ? { ...item, time, description } : item)).sort((a,b) => a.time.localeCompare(b.time)));
  };

  const handleAddNewEvent = () => {
    const newEvent: ScheduleItem = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: 'Новое событие',
    };
    setSchedule(prev => [...prev, newEvent].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const handleDeleteEvent = (id: number) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveEvent = (id: number, direction: 'up' | 'down') => {
    setSchedule(prev => {
      const scheduleCopy = [...prev];
      const index = scheduleCopy.findIndex(item => item.id === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= scheduleCopy.length) return prev;

      [scheduleCopy[index], scheduleCopy[newIndex]] = [scheduleCopy[newIndex], scheduleCopy[index]];
      return scheduleCopy;
    });
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
      
      <div className="max-w-4xl mx-auto">
        <section className="space-y-8">
          <div ref={printableAreaRef} className="space-y-8 bg-background p-0 sm:p-4 rounded-lg">
            <ScheduleView
              schedule={schedule}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              onMoveEvent={handleMoveEvent}
              onAddNewEvent={handleAddNewEvent}
            />
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
