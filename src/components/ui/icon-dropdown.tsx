
'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SmilePlus, SquareDashed } from 'lucide-react';
import {
  IconName,
  ScheduleEventIcon,
  ICONS,
} from '../multischedule/schedule-event-icons';

interface IconDropdownProps {
  value?: IconName;
  onChange: (value: IconName | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function IconDropdown({ value, onChange, open, onOpenChange }: IconDropdownProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
          {value ? (
            <ScheduleEventIcon icon={value} className="h-4 w-4" />
          ) : (
            <SmilePlus className="h-4 w-4" data-id="placeholder-icon" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-5 gap-2">
          <Button
            variant={!value ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onChange(undefined)}
            className="h-8 w-8"
          >
            <SquareDashed className="h-4 w-4 text-muted-foreground" />
          </Button>
          {ICONS.map((icon) => (
            <Button
              key={icon}
              variant={value === icon ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => onChange(icon as IconName)}
              className="h-8 w-8"
            >
              <ScheduleEventIcon icon={icon as IconName} className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
