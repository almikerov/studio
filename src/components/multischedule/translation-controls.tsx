
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Languages, Loader2, Copy, Save, BookOpen, Wand2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { SavedTemplates } from './saved-templates';
import { AiScheduleParser } from './ai-schedule-parser';
import type { ScheduleTemplate } from '@/app/page';

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
  isDownloading: boolean;
  onTranslate: (languages: string[]) => void;
  onDownload: () => void;
  onCopy: () => void;
  templates: ScheduleTemplate[];
  onLoadTemplate: (template: ScheduleTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onAiParse: (text: string) => Promise<void>;
}

export function TranslationControls({
  isLoading,
  isDownloading,
  onTranslate,
  onDownload,
  onCopy,
  templates,
  onLoadTemplate,
  onDeleteTemplate,
  onAiParse,
}: TranslationControlsProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isAiParserOpen, setIsAiParserOpen] = useState(false);

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code) ? prev.filter(lang => lang !== code) : [...prev, code]
    );
  };

  const handleTranslateClick = () => {
    if (!showLanguageSelector) {
      setShowLanguageSelector(true);
    } else {
      onTranslate(selectedLanguages);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление</CardTitle>
        <CardDescription>Переводите, экспортируйте, используйте шаблоны и ИИ.</CardDescription>
      </CardHeader>
      
      <CardContent>
        {showLanguageSelector && (
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
        )}
        <div className="flex flex-wrap gap-4">
            <Button onClick={handleTranslateClick} disabled={isLoading || isDownloading} className="flex-1 min-w-[150px]">
                {isLoading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Languages className="mr-2 h-4 w-4" /> )}
                {isLoading ? 'Переводим...' : (showLanguageSelector ? 'Подтвердить' : 'Перевести')}
            </Button>
            <Button onClick={onDownload} variant="outline" className="flex-1 min-w-[150px]" disabled={isDownloading || isLoading}>
                {isDownloading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Download className="mr-2 h-4 w-4" /> )}
                {isDownloading ? 'Загрузка...' : 'Скачать'}
            </Button>
            <Button onClick={onCopy} variant="outline" className="flex-1 min-w-[150px]" disabled={isDownloading || isLoading}>
                {isDownloading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Copy className="mr-2 h-4 w-4" /> )}
                {isDownloading ? 'Обработка...' : 'Копировать'}
            </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-4">
        <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="flex-1 min-w-[150px]">
              <BookOpen className="mr-2 h-4 w-4" />
              Шаблоны
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
            <SavedTemplates 
              templates={templates}
              onLoad={onLoadTemplate}
              onDelete={onDeleteTemplate}
              onClose={() => setIsTemplatesOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAiParserOpen} onOpenChange={setIsAiParserOpen}>
          <DialogTrigger asChild>
             <Button variant="secondary" className="flex-1 min-w-[150px]">
              <Wand2 className="mr-2 h-4 w-4" />
              ИИ-редактор
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0 max-w-2xl h-[80vh] flex flex-col">
            <AiScheduleParser 
              onParse={onAiParse} 
              isLoading={isLoading} 
              onClose={() => setIsAiParserOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

    