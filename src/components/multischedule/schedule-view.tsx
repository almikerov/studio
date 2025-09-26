'use client';

import type { ScheduleItem } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';

interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onDeleteEvent: (id: number) => void;
}

export function ScheduleView({ schedule, onDeleteEvent }: ScheduleViewProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Расписание на день</CardTitle>
        <CardDescription>Ваш план на сегодня. События отсортированы по времени.</CardDescription>
      </CardHeader>
      <CardContent>
        {schedule.length > 0 ? (
          <ul className="space-y-4">
            {schedule.map((item, index) => (
              <li key={item.id}>
                <div className="flex items-center gap-4">
                  <div className="font-mono text-lg font-semibold text-primary-foreground bg-primary rounded-md px-3 py-1 w-24 text-center">{item.time}</div>
                  <p className="flex-1 text-card-foreground">{item.description}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDeleteEvent(item.id)}
                    aria-label={`Delete event: ${item.description}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {index < schedule.length - 1 && <Separator className="mt-4" />}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg font-semibold">Ваше расписание пусто</p>
            <p>Добавьте события, чтобы начать планировать свой день.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
