'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { translateSchedule } from '@/ai/flows/translate-schedule';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

export type ScheduleItem = { id: string; time: string; description: string };
export type TranslatedSchedules = Record<string, string>;

export default function Home() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { id: '1', time: '09:00', description: 'Утренняя встреча' },
    { id: '2', time: '12:30', description: 'Обед' },
    { id: '3', time: '18:00', description: 'Завершение рабочего дня' },
  ]);
  const [translatedSchedules, setTranslatedSchedules] = useState<TranslatedSchedules | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const [mainTitle, setMainTitle] = useState('Название');
  const [cardTitle, setCardTitle] = useState('Расписание на день');
  const [cardDescription, setCardDescription] = useState('Ваш план на сегодня. Нажмите на событие, чтобы редактировать.');

  const handleUpdateEvent = (id: string, time: string, description: string) => {
    setSchedule(prev => prev.map(item => (item.id === id ? { ...item, time, description } : item)).sort((a,b) => a.time.localeCompare(b.time)));
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
        backgroundColor: '#1C1917', // dark theme background
        scale: 2,
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'multischedule.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };
  
  const EditableTitle = ({ value, setValue, className }: { value: string, setValue: (val: string) => void, className: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleBlur = () => {
      setValue(text);
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleBlur();
      if (e.key === 'Escape') {
        setText(value);
        setIsEditing(false);
      }
    };
    
    if (isEditing) {
      return <input 
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-transparent outline-none ring-2 ring-ring rounded-md`}
        autoFocus
      />
    }

    return <h1 onClick={() => setIsEditing(true)} className={`${className} cursor-pointer`}>{value}</h1>
  }

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <header className="text-center mb-12">
        <EditableTitle value={mainTitle} setValue={setMainTitle} className="font-headline text-4xl sm:text-5xl font-bold tracking-tight" />
      </header>
      
      <div className="max-w-4xl mx-auto">
        <section className="space-y-8">
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
              />
              <TranslatedSchedulesView translatedSchedules={translatedSchedules} />
            </div>
          </DragDropContext>

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
