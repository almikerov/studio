'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Save } from 'lucide-react';

interface EventFormProps {
  onAddEvent: (time: string, description: string, save: boolean) => void;
}

export function EventForm({ onAddEvent }: EventFormProps) {
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [saveForLater, setSaveForLater] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(time, description, saveForLater);
    setDescription('');
    setTime('');
    setSaveForLater(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить событие</CardTitle>
        <CardDescription>Заполните детали вашего нового события.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-time">Время</Label>
            <Input
              id="event-time"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-description">Описание</Label>
            <Input
              id="event-description"
              placeholder="Например, встреча с командой"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="save-for-later" checked={saveForLater} onCheckedChange={checked => setSaveForLater(Boolean(checked))} />
            <Label htmlFor="save-for-later" className="flex items-center gap-2 text-sm font-normal text-muted-foreground cursor-pointer">
              <Save className="h-4 w-4" />
              Сохранить для повторного использования
            </Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Добавить в расписание
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
