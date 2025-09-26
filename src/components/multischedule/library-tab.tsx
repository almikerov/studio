
'use client';

import { SavedTemplates } from '@/components/multischedule/saved-templates';
import { SavedEvents } from '@/components/multischedule/saved-events';

export function LibraryTab(props: any) {
    const {
        savedTemplates,
        handleLoadTemplate,
        handleDeleteTemplate,
        savedEvents,
        handleAddFromSaved,
        handleDeleteSaved,
        handleUpdateSaved,
      } = props;

  return (
    <div className="space-y-8">
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
    </div>
  );
}

    