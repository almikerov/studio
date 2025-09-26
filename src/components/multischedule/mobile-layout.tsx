
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleTab } from './schedule-tab';
import { LibraryTab } from './library-tab';
import { AiTab } from './ai-tab';

const TABS = [
  { id: 'schedule', icon: Calendar, label: 'Расписание' },
  { id: 'library', icon: BookOpen, label: 'Библиотека' },
  { id: 'ai', icon: Wand2, label: 'ИИ-редактор' },
];

export function MobileLayout(props: any) {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4">
          {activeTab === 'schedule' && <ScheduleTab {...props} />}
          {activeTab === 'library' && <LibraryTab {...props} />}
          {activeTab === 'ai' && <AiTab {...props} onScheduleParsed={() => setActiveTab('schedule')} />}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-t-lg">
        <nav className="flex justify-around items-center h-16">
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'flex flex-col items-center justify-center h-full w-full rounded-none',
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{tab.label}</span>
            </Button>
          ))}
        </nav>
      </footer>
    </div>
  );
}

    