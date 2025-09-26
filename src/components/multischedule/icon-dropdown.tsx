'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SmilePlus } from 'lucide-react';
import {
  IconName,
  ScheduleEventIcon,
  ICONS,
} from './schedule-event-icons';

interface IconDropdownProps {
  value?: IconName;
  onChange: (value: IconName | undefined) => void;
}

export function IconDropdown({ value, onChange }: IconDropdownProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
          {value ? (
            <ScheduleEventIcon icon={value} className="h-4 w-4" />
          ) : (
            <SmilePlus className="h-4 w-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" data-radix-popover-content-wrapper>
        <div className="grid grid-cols-5 gap-2">
          <Button
            variant={!value ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => onChange(undefined)}
            className="h-8 w-8"
          >
            <SmilePlus className="h-4 w-4" />
          </Button>
          {Object.keys(ICONS).map((icon) => (
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
