
'use client';

import type { ScheduleTemplate } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookOpen, Copy, Download, Languages, Loader2, Wand2 } from 'lucide-react';
import { AiScheduleParser } from './ai-schedule-parser';
import { SavedTemplates } from './saved-templates';

const AVAILABLE_LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'Английский' },
  { code: 'es', name: 'Испанский' },
  { code: 'fr', name: 'Французский' },
  { code: 'de', name: 'Немецкий' },
  { code: 'ja', name: 'Японский' },
  { code: 'zh', name: 'Китайский' },
];

interface CommonControlProps {
  isLoading: boolean;
  isDownloading: boolean;
  onTranslate: () => void;
  onDownload: () => void;
  onCopy: () => void;
  templates: ScheduleTemplate[];
  onLoadTemplate: (template: ScheduleTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onAiParse: (text: string) => Promise<void>;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
  selectedLanguages: string[];
  onLanguageToggle: (code: string) => void;
  isTemplatesOpen: boolean;
  setIsTemplatesOpen: (open: boolean) => void;
  isAiParserOpen: boolean;
  setIsAiParserOpen: (open: boolean) => void;
}

export function DesktopControls({
  isLoading,
  isDownloading,
  onTranslate,
  onDownload,
  onCopy,
  templates,
  onLoadTemplate,
  onDeleteTemplate,
  onAiParse,
  showLanguageSelector,
  setShowLanguageSelector,
  selectedLanguages,
  onLanguageToggle,
  isTemplatesOpen,
  setIsTemplatesOpen,
  isAiParserOpen,
  setIsAiParserOpen,
}: CommonControlProps) {
  
  const handleTranslateClick = () => {
    if (showLanguageSelector) {
        onTranslate();
    }
    setShowLanguageSelector(!showLanguageSelector);
  };

  return (
    <div className="p-4 bg-card border rounded-lg flex items-center justify-between gap-4">
      <div className="flex gap-2">
        <Dialog open={isTemplatesOpen} onOpenChange={setIsTemplatesOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
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
             <Button variant="outline">
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
      </div>

      <div className="flex gap-2">
        <Popover open={showLanguageSelector} onOpenChange={setShowLanguageSelector}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={isLoading || isDownloading}>
                <Languages className="mr-2 h-4 w-4" />
                Перевести
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
             <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Перевод</h4>
                    <p className="text-sm text-muted-foreground">
                        Выберите языки для перевода.
                    </p>
                </div>
                <div className="grid gap-2">
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <div key={lang.code} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-desktop-${lang.code}`}
                          checked={selectedLanguages.includes(lang.code)}
                          onCheckedChange={() => onLanguageToggle(lang.code)}
                        />
                        <Label htmlFor={`lang-desktop-${lang.code}`} className="font-normal cursor-pointer">{lang.name}</Label>
                      </div>
                    ))}
                </div>
                <Button onClick={onTranslate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Перевести
                </Button>
             </div>
          </PopoverContent>
        </Popover>

        <Button onClick={onDownload} variant="outline" disabled={isDownloading || isLoading}>
            {isDownloading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Download className="mr-2 h-4 w-4" /> )}
            Скачать
        </Button>
        <Button onClick={onCopy} variant="outline" disabled={isDownloading || isLoading}>
            {isDownloading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Copy className="mr-2 h-4 w-4" /> )}
            Копировать
        </Button>
      </div>
    </div>
  );
}
