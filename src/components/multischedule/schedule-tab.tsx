

'use client';

import { DragDropContext } from '@hello-pangea/dnd';
import { ScheduleView } from '@/components/multischedule/schedule-view';
import { TranslatedSchedulesView } from '@/components/multischedule/translated-schedules-view';
import { TranslationControls } from '@/components/multischedule/translation-controls';

export function ScheduleTab(props: any) {
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
      editingEvent,
      handleOpenEditModal,
      handleCloseEditModal,
      savedEvents,
    } = props;
  
    return (
      <div className="space-y-8">
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
              editingEvent={editingEvent}
              handleOpenEditModal={handleOpenEditModal}
              handleCloseEditModal={handleCloseEditModal}
              savedEvents={savedEvents}
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
      </div>
    );
  }

    
