

'use client';

import { SavedTemplates } from '@/components/multischedule/saved-templates';

export function LibraryTab(props: any) {
    const {
        savedTemplates,
        handleLoadTemplate,
        handleDeleteTemplate,
      } = props;

  return (
    <div className="space-y-8">
        <SavedTemplates 
            templates={savedTemplates}
            onLoad={handleLoadTemplate}
            onDelete={handleDeleteTemplate}
        />
    </div>
  );
}
