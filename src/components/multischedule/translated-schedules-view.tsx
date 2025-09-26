'use client';

import type { TranslatedSchedules } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranslatedSchedulesViewProps {
  translatedSchedules: TranslatedSchedules | null;
}

const languageNames: Record<string, string> = {
  en: 'Английский',
  es: 'Испанский',
  fr: 'Французский',
  de: 'Немецкий',
  ru: 'Русский',
  ja: 'Японский',
  zh: 'Китайский',
};

export function TranslatedSchedulesView({ translatedSchedules }: TranslatedSchedulesViewProps) {
  if (!translatedSchedules) {
    return null;
  }

  return (
    <div className="space-y-8">
      {Object.entries(translatedSchedules).map(([lang, text]) => (
        <Card key={lang} className="shadow-lg">
          <CardHeader>
            <CardTitle>Расписание на {languageNames[lang] || lang}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-body text-sm text-card-foreground">{text}</pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
