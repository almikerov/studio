

'use client';

import { useState, type ReactNode, useRef, useEffect } from 'react';
import type { ScheduleItem, SavedEvent, TranslationDisplayMode, RenderOptions } from '@/app/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, GripVertical, Bookmark, Palette, Save, ImagePlus, X, Check, ArrowUp, ArrowDown, Menu, ChevronDown, Type, CalendarIcon } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { EditableField } from './editable-field';
import { ImageUploader } from './image-uploader';
import Image from 'next/image';
import { IconDropdown } from './icon-dropdown';
import { IconName, ScheduleEventIcon } from './schedule-event-icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import html2canvas from 'html2canvas';



interface ScheduleViewProps {
  schedule: ScheduleItem[];
  onUpdateEvent: (id: string, updatedValues: Partial<Omit<ScheduleItem, 'id'>>) => void;
  onDeleteEvent: (id: string) => void;
  onAddNewEvent: (config?: Partial<ScheduleItem>) => void;
  cardTitle: string;
  setCardTitle: (title: string) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  onSaveEvent: (item: Partial<ScheduleItem>) => void;
  editingEvent: ScheduleItem | null;
  handleOpenEditModal: (item: ScheduleItem) => void;
  handleCloseEditModal: () => void;
  isMobile: boolean | undefined;
  onMoveEvent: (index: number, direction: 'up' | 'down') => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isAddEventDialogOpen: boolean;
  setIsAddEventDialogOpen: (open: boolean) => void;
  translationDisplayMode: TranslationDisplayMode;
  selectedLanguages: string[];
  itemColors: string[];
  renderOptions?: RenderOptions;
}

export function ScheduleView({ 
  schedule, onUpdateEvent, onDeleteEvent, onAddNewEvent, cardTitle, setCardTitle, 
  imageUrl, setImageUrl, onSaveEvent, 
  editingEvent, handleOpenEditModal, handleCloseEditModal,
  isMobile, onMoveEvent, setIsMobileMenuOpen, isAddEventDialogOpen, setIsAddEventDialogOpen,
  translationDisplayMode, selectedLanguages, itemColors, renderOptions
}: ScheduleViewProps) {
  const [editedTime, setEditedTime] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedTranslations, setEditedTranslations] = useState<Record<string, string>>({});
  const [editedType, setEditedType] = useState<ScheduleItem['type']>('timed');
  const [editedDate, setEditedDate] = useState<Date | undefined>(new Date());
  const [isIconPopoverOpen, setIsIconPopoverOpen] = useState(false);

  const isRenderMobile = renderOptions?.renderAsMobile ?? isMobile;

  useEffect(() => {
    if (editingEvent) { // For mobile modal
        setEditedTime(editingEvent.time);
        setEditedDescription(editingEvent.description || '');
        setEditedTranslations(editingEvent.translations || {});
        setEditedType(editingEvent.type);
        if (editingEvent.type === 'date' && editingEvent.date) {
            setEditedDate(new Date(editingEvent.date));
        }
    }
  }, [editingEvent]);

  
  const handleEdit = (item: ScheduleItem) => {
    if (isMobile) {
      handleOpenEditModal(item);
    }
  };

  const handleSave = (id: string) => {
    onUpdateEvent(id, { 
      time: editedType === 'timed' ? editedTime : '', 
      description: editedDescription,
      type: editedType,
      date: editedType === 'date' && editedDate ? editedDate.toISOString() : undefined,
      translations: editedTranslations,
    });
    
    if (isMobile) {
      handleCloseEditModal();
    }
  };

  const handleTranslationChange = (id: string, lang: string, text: string) => {
    const item = schedule.find(i => i.id === id);
    if (item) {
        const newTranslations = { ...(item.translations || {}), [lang]: text };
        onUpdateEvent(id, { translations: newTranslations });
    }
  };

  
  const handleIconChange = (id: string, icon: IconName | undefined) => {
    onUpdateEvent(id, { icon });
    setIsIconPopoverOpen(false);
  }

  const handleColorChange = (id: string, color: string | undefined) => {
    onUpdateEvent(id, { color });
  }
  
  const handleTypeChange = (id: string, type: ScheduleItem['type']) => {
    const currentTime = schedule.find(i => i.id === id)?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTime = type === 'timed' ? currentTime : '';
    
    const updatePayload: Partial<ScheduleItem> = { type, time: newTime };
    if (type === 'date') {
        updatePayload.date = new Date().toISOString();
    }

    onUpdateEvent(id, updatePayload);
    
    if (isMobile && editingEvent?.id === id) {
        setEditedType(type);
    }
  };
  
  const renderEditContent = (item: ScheduleItem) => {
    const handleSaveToPreset = () => {
        const eventToSave: Partial<ScheduleItem> = {
            id: item.id,
            description: editedDescription,
            icon: item.icon,
            color: item.color,
            time: editedType === 'timed' ? editedTime : '',
            type: editedType,
        };
        onSaveEvent(eventToSave);
        handleCloseEditModal();
    };

    const isRegularEvent = ['timed', 'untimed'].includes(editedType);
    const isTranslatable = ['timed', 'untimed', 'h1', 'h2', 'h3', 'comment', 'date'].includes(editedType);


    return (
        <div className="flex flex-col gap-4 p-1">
            
            {/* Description/Icon input */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {['timed', 'untimed'].includes(item.type) && (
                    <IconDropdown value={item.icon} onChange={(icon) => handleIconChange(item.id, icon)} open={isIconPopoverOpen} onOpenChange={setIsIconPopoverOpen} />
                  )}
                  
                  <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="flex-1 text-base h-10"
                      placeholder="Описание"
                      rows={1}
                  />
                </div>
                {isTranslatable && selectedLanguages.length > 0 && (
                   <div className="space-y-2">
                    {selectedLanguages.map(lang => (
                        <div key={lang} className="space-y-1">
                             <Label htmlFor={`translation-input-${lang}`} className="text-xs text-muted-foreground pl-1">{lang.toUpperCase()}</Label>
                             <Input
                                id={`translation-input-${lang}`}
                                value={editedTranslations[lang] || ''}
                                onChange={(e) => setEditedTranslations(prev => ({...prev, [lang]: e.target.value}))}
                                className="text-base h-10"
                                placeholder={`Перевод на ${lang}`}
                            />
                        </div>
                    ))}
                   </div>
                )}
            </div>


            {/* Type selector */}
            <div className="flex items-center gap-4 justify-between p-2 rounded-lg bg-secondary/50">
                <Label htmlFor={`type-select-native-${item.id}`} className="text-base font-normal">Тип элемента</Label>
                <div className="relative">
                    <select
                        id={`type-select-native-${item.id}`}
                        value={editedType}
                        onChange={(e) => handleTypeChange(item.id, e.target.value as ScheduleItem['type'])}
                        className="appearance-none w-full bg-transparent pr-8 text-right font-medium"
                    >
                        <option value="timed">Со временем</option>
                        <option value="untimed">Без времени</option>
                        <option value="date">Дата</option>
                        <option value="h1">Заголовок H1</option>
                        <option value="h2">Заголовок H2</option>
                        <option value="h3">Заголовок H3</option>
                        <option value="comment">Комментарий</option>
                    </select>
                    <ChevronDown className="h-4 w-4 opacity-50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
            </div>
            
            {/* Date specific inputs */}
            {editedType === 'date' && (
              <div className="space-y-2">
                {isMobile ? (
                    <Input
                        type="date"
                        value={editedDate ? format(editedDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            // Adjust for timezone offset
                            const timezoneOffset = newDate.getTimezoneOffset() * 60000;
                            const adjustedDate = new Date(newDate.getTime() + timezoneOffset);
                            setEditedDate(adjustedDate);
                            onUpdateEvent(item.id, { date: adjustedDate.toISOString() });
                        }}
                        className="w-full text-lg h-12"
                    />
                ) : (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !editedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editedDate ? format(editedDate, "dd.MM.yyyy", { locale: ru }) : <span>Выберите дату</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                             <Calendar
                                mode="single"
                                selected={editedDate}
                                onSelect={(date) => {
                                    setEditedDate(date);
                                    if (date) {
                                        onUpdateEvent(item.id, { date: date.toISOString() });
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )}
              </div>
            )}

            {/* Timed specific input */}
            { editedType === 'timed' && (
                <Input
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                className="w-full text-lg h-12"
                />
            )}
        
            {/* Color palette for regular events */}
             <div className="space-y-2">
                <Label className="text-xs text-muted-foreground ml-1">Цвет</Label>
                <div className="grid grid-cols-4 gap-2">
                    <Button variant={!item.color ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => handleColorChange(item.id, undefined)}>
                        <div className="h-6 w-6 rounded-full border" />
                    </Button>
                    {itemColors.map(color => (
                        <Button key={color} variant={item.color === color ? 'secondary' : 'ghost'} size="icon" className="h-10 w-10 rounded-full" onClick={() => handleColorChange(item.id, color)}>
                        <div className={`h-6 w-6 rounded-full bg-${color}-500`} />
                        </Button>
                    ))}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-4">
               <div className="flex gap-2">
                 <Button onClick={handleSaveToPreset} variant="outline" className="flex-1" size="lg"><Bookmark /></Button>
                 <Button onClick={() => { onDeleteEvent(item.id); handleCloseEditModal(); }} variant="destructive" className="flex-1" size="lg"><Trash2 /></Button>
               </div>
                <Button onClick={() => handleSave(item.id)} className="w-full" size="lg"><Check className="mr-2"/>Сохранить и закрыть</Button>
            </div>
        </div>
    );
  };

const showTextBlock = translationDisplayMode === 'text-block' && selectedLanguages.length > 0 && schedule.length > 0;

  return (
    <Card className={cn(
      "shadow-lg overflow-hidden sm:border sm:rounded-lg",
      showTextBlock && "rounded-b-none"
      )}
      data-id="schedule-view"
    >
       {/* These are for tailwind to detect and generate dynamic classes */}
       <div className="hidden bg-red-100 dark:bg-red-900/30 bg-orange-100 dark:bg-orange-900/30 bg-yellow-100 dark:bg-yellow-900/30 bg-green-100 dark:bg-green-900/30 bg-blue-100 dark:bg-blue-900/30 bg-purple-100 dark:bg-purple-900/30 bg-gray-100 dark:bg-gray-900/30"></div>
       <div className="hidden bg-red-500 bg-orange-500 bg-yellow-500 bg-green-500 bg-blue-500 bg-purple-500 bg-gray-500"></div>

      <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <EditableField isMobile={undefined} as="h1" value={cardTitle} setValue={setCardTitle} className="text-2xl font-bold leading-none tracking-tight" />
            </div>
             <div className="flex items-center gap-2">
                 <div data-id="schedule-image-wrapper">
                    {imageUrl ? (
                        <ImageUploader onSetImageUrl={setImageUrl}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="p-0 h-auto w-auto cursor-pointer">
                                    <Image
                                        data-id="schedule-image"
                                        src={imageUrl}
                                        alt="Schedule image"
                                        width={isRenderMobile ? 40 : 96}
                                        height={isRenderMobile ? 40 : 96}
                                        className="object-cover rounded-md aspect-square"
                                        crossOrigin="anonymous"
                                    />
                                </Button>
                            </DialogTrigger>
                        </ImageUploader>
                    ) : (
                        <ImageUploader onSetImageUrl={setImageUrl}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" data-id="image-placeholder" data-no-print="true">
                                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                                </Button>
                            </DialogTrigger>
                        </ImageUploader>
                    )}
                 </div>
                 {isMobile && (
                    <Button variant="ghost" size="icon" id="mobile-menu-trigger" data-no-print="true" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu />
                    </Button>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent data-schedule-content className="p-4 sm:p-6 pt-2 sm:pt-4">
          <Droppable droppableId="schedule" isDropDisabled={!!isMobile}>
            {(provided) => (
              <div className="space-y-2 group/list" {...provided.droppableProps} ref={provided.innerRef}>
                {schedule.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!!isMobile}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          'group/item flex items-center gap-2 p-2 rounded-md',
                          !isMobile && 'hover:bg-secondary/50',
                          snapshot.isDragging ? 'bg-secondary shadow-lg' : '',
                           item.color ? `bg-${item.color}-100 dark:bg-${item.color}-900/30` : ''
                        )}
                        onClick={() => handleEdit(item)}
                      >
                        {!isMobile && (
                          <div {...provided.dragHandleProps} data-no-print="true" data-drag-handle="true" className="flex items-center self-stretch cursor-grab active:cursor-grabbing p-2">
                             <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                         
                         {isMobile && (
                            <Button data-mobile-arrow data-no-print="true" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={(e) => { e.stopPropagation(); onMoveEvent(index, 'up'); }}>
                                <ArrowUp className="h-5 w-5" />
                            </Button>
                         )}

                        <div
                            data-id="icon-container"
                            className="w-8 h-8 flex items-center justify-center shrink-0"
                        >
                            {['timed', 'untimed'].includes(item.type) ? (
                                <IconDropdown
                                    value={item.icon}
                                    onChange={(icon) => onUpdateEvent(item.id, { icon: icon })}
                                />
                            ) : <div data-make-invisible className="w-8 h-8"/>}
                        </div>
                        
                        <div className="flex-1 w-full min-w-0">
                            {item.type === 'comment' ? (
                                <div className="flex-1 flex flex-col">
                                    <div className='flex items-center gap-2 w-full'>
                                        <EditableField
                                            isMobile={isMobile}
                                            value={item.description}
                                            setValue={(val) => onUpdateEvent(item.id, { description: val })}
                                            className={cn("text-card-foreground text-sm italic text-muted-foreground", !item.description && "w-full")}
                                            isTextarea={true}
                                            data-id="description"
                                        />
                                        {(translationDisplayMode === 'inline' && item.translations && Object.keys(item.translations).length > 0) && (
                                            <div className="flex items-center text-muted-foreground text-sm italic">
                                                ({Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text], idx) => (
                                                  <EditableField
                                                      key={lang}
                                                      isMobile={isMobile}
                                                      value={text}
                                                      setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                      className="inline"
                                                      as="span"
                                                      isTextarea={true}
                                                  />
                                                )).reduce((prev, curr) => <>{prev}, {curr}</> as any)})
                                            </div>
                                        )}
                                    </div>
                                    {(translationDisplayMode === 'block' && item.translations && Object.keys(item.translations).length > 0) && (
                                        <div className="text-sm italic text-muted-foreground mt-1 flex flex-col">
                                            {Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                              <EditableField
                                                  key={lang}
                                                  isMobile={isMobile}
                                                  value={text}
                                                  setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                  className="w-full"
                                                  as="div"
                                                  isTextarea={true}
                                              />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : item.type === 'date' && item.date ? (
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-2 w-full">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="font-semibold text-lg text-muted-foreground p-0 h-auto">
                                                    {format(new Date(item.date), 'dd.MM.yyyy', { locale: ru })}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={new Date(item.date)}
                                                    onSelect={(date) => date && onUpdateEvent(item.id, { date: date.toISOString() })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <div className="flex-1 flex flex-col w-full">
                                            <div className="flex items-center gap-2">
                                                <EditableField
                                                    isMobile={isMobile}
                                                    value={item.description || ''}
                                                    setValue={(val) => onUpdateEvent(item.id, { description: val })}
                                                    className={cn("text-base font-normal text-muted-foreground", !item.description && "w-full")}
                                                    isTextarea={true}
                                                />
                                                {(translationDisplayMode === 'inline' && item.translations && Object.keys(item.translations).length > 0) && (
                                                    <span className="text-muted-foreground text-base font-normal">
                                                        ({Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                                            <EditableField
                                                                key={lang}
                                                                isMobile={isMobile}
                                                                value={text}
                                                                setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                                className="inline"
                                                                as="span"
                                                                isTextarea={true}
                                                            />
                                                        )).reduce((prev, curr) => <>{prev}, {curr}</> as any)})
                                                    </span>
                                                )}
                                            </div>
                                             {(translationDisplayMode === 'block' && item.translations && Object.keys(item.translations).length > 0) && (
                                                <div className="text-sm text-muted-foreground mt-1 flex flex-col">
                                                    {Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                                      <EditableField
                                                          key={lang}
                                                          isMobile={isMobile}
                                                          value={text}
                                                          setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                          className="w-full"
                                                          as="div"
                                                          isTextarea={true}
                                                      />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                   
                                </div>
                            ) : item.type === 'h1' || item.type === 'h2' || item.type === 'h3' ? (
                                <div className="flex-1 flex flex-col">
                                  <div className="flex items-center gap-2 w-full">
                                    <EditableField 
                                      isMobile={isMobile}
                                      as={item.type === 'h1' ? 'h2' : item.type === 'h2' ? 'h3' : 'h4'}
                                      className={cn(
                                          'font-bold',
                                          !item.description && 'w-full',
                                          item.type === 'h1' && 'text-xl',
                                          item.type === 'h2' && 'text-lg',
                                          item.type === 'h3' && 'text-base'
                                      )}
                                      value={item.description} 
                                      setValue={(val) => onUpdateEvent(item.id, {description: val})} 
                                      data-id="description"
                                      isTextarea={true}
                                    />
                                    {(translationDisplayMode === 'inline' && item.translations && Object.keys(item.translations).length > 0) && (
                                        <div className="flex items-center text-muted-foreground font-normal">
                                            ({Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                                <EditableField
                                                    key={lang}
                                                    isMobile={isMobile}
                                                    value={text}
                                                    setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                    className="inline"
                                                    as="span"
                                                    isTextarea={true}
                                                />
                                            )).reduce((prev, curr) => <>{prev}, {curr}</> as any)})
                                        </div>
                                    )}
                                  </div>
                                    {(translationDisplayMode === 'block' && item.translations && Object.keys(item.translations).length > 0) && (
                                        <div className="text-sm text-muted-foreground mt-1 flex flex-col">
                                            {Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                              <EditableField
                                                  key={lang}
                                                  isMobile={isMobile}
                                                  value={text}
                                                  setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                  className="w-full"
                                                  as="div"
                                                  isTextarea={true}
                                              />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex w-full items-center">
                                     {item.type === 'timed' && (
                                        <div className="p-1 rounded-md w-20 sm:w-auto text-center sm:text-left min-w-[5rem] flex items-center">
                                            <EditableField
                                                isMobile={isMobile}
                                                value={item.time}
                                                setValue={(val) => onUpdateEvent(item.id, { time: val })}
                                                className="font-mono text-base font-semibold"
                                                inputType="time"
                                            />
                                        </div>
                                     )}
                                     <div className={cn("flex-1 text-card-foreground cursor-pointer py-1", item.type === 'untimed' && 'pl-1 sm:pl-0')} onClick={(e) => {
                                            if (isMobile) return;
                                            const descEl = e.currentTarget.querySelector('[data-id=description]') as HTMLElement;
                                            descEl?.click();
                                        }}>
                                        <div className={cn('flex items-center gap-2', !item.description && "w-full")}>
                                            <EditableField
                                                isMobile={isMobile}
                                                value={item.description}
                                                setValue={(val) => onUpdateEvent(item.id, { ...item, description: val })}
                                                className={cn("inline", !item.description && "w-full")}
                                                as="span"
                                                data-id="description"
                                                isTextarea={true}
                                            />
                                            {(translationDisplayMode === 'inline' && item.translations && Object.keys(item.translations).length > 0) && (
                                                <span className="text-muted-foreground">
                                                    ({Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                                        <EditableField
                                                            key={lang}
                                                            isMobile={isMobile}
                                                            value={text}
                                                            setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                            className="inline"
                                                            as="span"
                                                            isTextarea={true}
                                                        />
                                                    )).reduce((prev, curr) => <>{prev}, {curr}</> as any)})
                                                </span>
                                            )}
                                        </div>

                                        {(translationDisplayMode === 'block' && item.translations && Object.keys(item.translations).length > 0) && (
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {Object.entries(item.translations).filter(([lang]) => selectedLanguages.includes(lang)).map(([lang, text]) => (
                                                    <div key={lang} className="flex items-center">
                                                        <EditableField
                                                            isMobile={isMobile}
                                                            value={text}
                                                            setValue={(val) => handleTranslationChange(item.id, lang, val)}
                                                            className="block w-full"
                                                            as="div"
                                                            isTextarea={true}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div data-no-print={isMobile ? "true" : undefined} className={cn("items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100", isMobile ? "hidden" : "flex")}>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Type className="h-4 w-4" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                    <div className="flex flex-col gap-1">
                                        <Button variant={item.type === 'timed' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'timed')}>Со временем</Button>
                                        <Button variant={item.type === 'untimed' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'untimed')}>Без времени</Button>
                                        <Button variant={item.type === 'date' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'date')}>Дата</Button>
                                        <Button variant={item.type === 'h1' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'h1')}>H1</Button>
                                        <Button variant={item.type === 'h2' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'h2')}>H2</Button>
                                        <Button variant={item.type === 'h3' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'h3')}>H3</Button>
                                        <Button variant={item.type === 'comment' ? 'secondary' : 'ghost'} size="sm" onClick={() => handleTypeChange(item.id, 'comment')}>Комментарий</Button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Palette className="h-4 w-4" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                    <div className="flex gap-1">
                                    <Button variant={!item.color ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleColorChange(item.id, undefined)}>
                                        <div className="h-4 w-4 rounded-full border" />
                                    </Button>
                                    {itemColors.map(color => (
                                        <Button key={color} variant={item.color === color ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleColorChange(item.id, color)}>
                                        <div className={`h-4 w-4 rounded-full bg-${color}-500`} />
                                        </Button>
                                    ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            onClick={(e) => { e.stopPropagation(); onSaveEvent(item); }}
                            aria-label={`Save event: ${item.description}`}
                            >
                            <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); onDeleteEvent(item.id); }}
                            aria-label={`Delete event: ${item.description}`}
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        {isMobile && (
                            <Button data-mobile-arrow data-no-print="true" variant="ghost" size="icon" className="h-8 w-8" disabled={index === schedule.length - 1} onClick={(e) => { e.stopPropagation(); onMoveEvent(index, 'down'); }}>
                                <ArrowDown className="h-5 w-5" />
                            </Button>
                        )}
                        
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {!isMobile && (
                  <div className="h-10 flex justify-center items-center" data-no-print="true">
                    <Button
                      variant="ghost"
                      className={cn("transition-opacity w-full",
                        schedule.length > 0 ? "opacity-0 group-hover/list:opacity-100" : "opacity-100"
                      )}
                      onClick={() => onAddNewEvent()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Droppable>

        
        {schedule.length === 0 && !isMobile && (
          <div className="text-center text-muted-foreground py-16">
            <p className="text-lg font-semibold">Ваше расписание пусто</p>
            <p>Добавьте события, чтобы начать планировать свой день.</p>
          </div>
        )}
      </CardContent>
      <CardFooter id="card-footer" className={cn("gap-2 p-4 sm:p-6 justify-center", { "hidden": !isMobile })} data-no-print="true">
        <Button className="rounded-full h-16 w-16" size="icon" onClick={() => setIsAddEventDialogOpen(true)}><Plus className="h-8 w-8" /></Button>
      </CardFooter>

      <Dialog open={isMobile && !!editingEvent} onOpenChange={(open) => !open && handleCloseEditModal()}>
          <DialogContent className="max-w-sm">
              <DialogHeader>
                  <DialogTitle>Редактировать событие</DialogTitle>
              </DialogHeader>
              {editingEvent && renderEditContent(editingEvent)}
          </DialogContent>
      </Dialog>
    </Card>
  );
}
