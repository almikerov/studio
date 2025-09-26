
'use client';

import { DragDropContext } from '@hello-pangea/dnd';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';
import { SavedTemplates } from '@/components/multischedule/saved-templates';
import { SavedEvents } from '@/components/multischedule/saved-events';
import { AiScheduleParser } from '@/components/multischedule/ai-schedule-parser';

export function DesktopLayout(props: any) {
  const {
    onDragEnd,
    printableAreaRef,
    schedule,
    handleUpdateEvent,
    handleDeleteEvent,
    handleAddNewEvent,
    cardTitle,
    setCardTitle,
    selectedDate,
    setSelectedDate,
    imageUrl,
    setImageUrl,
    handleSaveEvent,
    comment,
    setComment,
    handleSaveTemplate,
    translatedSchedules,
    handleDeleteTranslation,
    handleUpdateTranslation,
    isLoading,
    isDownloading,
    handleTranslate,
    handleDownloadImage,
    handleCopyImage,
    savedTemplates,
    handleLoadTemplate,
    handleDeleteTemplate,
    savedEvents,
    handleAddFromSaved,
    handleDeleteSaved,
    handleUpdateSaved,
    handleAiParse,
  } = props;

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <section className="lg:col-span-2 space-y-8">
          <DragDropContext onDragEnd={onDragEnd}>
            <div ref={printableAreaRef} className="space-y-8 bg-background p-0 rounded-lg">
              <ScheduleView
                schedule={schedule}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onAddNewEvent={handleAddNewEvent}
                cardTitle={cardTitle}
                setCardTitle={setCardTitle}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onSaveEvent={handleSaveEvent}
                comment={comment}
                setComment={setComment}
                onSaveTemplate={handleSaveTemplate}
              />
              <TranslatedSchedulesView 
                translatedSchedules={translatedSchedules}
                onDelete={handleDeleteTranslation}
                onUpdate={handleUpdateTranslation}
              />
            </div>
          </DragDropContext>

          <TranslationControls
            isLoading={isLoading}
            isDownloading={isDownloading}
            onTranslate={handleTranslate}
            onDownload={handleDownloadImage}
            onCopy={handleCopyImage}
          />
        </section>

        <aside className="space-y-8">
            <SavedTemplates 
              templates={savedTemplates}
              onLoad={handleLoadTemplate}
              onDelete={handleDeleteTemplate}
            />
            <SavedEvents 
                savedEvents={savedEvents}
                onAdd={handleAddFromSaved}
                onDelete={handleDeleteSaved}
                onUpdate={handleUpdateSaved}
            />
            <AiScheduleParser onParse={handleAiParse} isLoading={isLoading} />
        </aside>
      </div>
    </main>
  );
}

    