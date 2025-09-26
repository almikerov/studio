'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Languages, Loader2 } from 'lucide-react';

const AVAILABLE_LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'Английский' },
  { code: 'es', name: 'Испанский' },
  { code: 'fr', name: 'Французский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'ja', name: 'Японский' },
  { code: 'zh', name: 'Китайский' },
];

interface TranslationControlsProps {
  isLoading: boolean;
  onTranslate: (languages: string[]) => void;
  onDownload: () => void;
  hasTranslations: boolean;
}

export function TranslationControls({ isLoading, onTranslate, onDownload, hasTranslations }: TranslationControlsProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code) ? prev.filter(lang => lang !== code) : [...prev, code]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Перевод и экспорт</CardTitle>
        <CardDescription>Выберите языки для перевода и скачайте результат в виде изображения.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-6">
            <Label>Языки для перевода</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {AVAILABLE_LANGUAGES.map(lang => (
                    <div key={lang.code} className="flex items-center space-x-2">
                        <Checkbox
                            id={`lang-${lang.code}`}
                            checked={selectedLanguages.includes(lang.code)}
                            onCheckedChange={() => handleLanguageToggle(lang.code)}
                        />
                        <Label htmlFor={`lang-${lang.code}`} className="font-normal cursor-pointer">{lang.name}</Label>
                    </div>
                ))}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => onTranslate(selectedLanguages)} disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Languages className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Переводим...' : 'Перевести'}
        </Button>
        {hasTranslations && (
          <Button onClick={onDownload} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Скачать изображение
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
