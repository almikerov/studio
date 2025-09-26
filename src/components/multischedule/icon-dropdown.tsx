'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { icons, IconName, ScheduleEventIcon } from './schedule-event-icons';
import { ImageIcon } from 'lucide-react';

interface IconDropdownProps {
  selectedIcon?: IconName;
  onIconChange: (icon?: IconName) => void;
}

export function IconDropdown({ selectedIcon, onIconChange }: IconDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-8 h-8 shrink-0">
          {selectedIcon ? <ScheduleEventIcon icon={selectedIcon} className="h-4 w-4" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="grid grid-cols-5 gap-1 p-2">
           <DropdownMenuItem
                className="flex items-center justify-center p-2 h-10 w-10 focus:bg-accent cursor-pointer"
                onClick={() => onIconChange(undefined)}
            >
                <div className="w-5 h-5 rounded-sm border border-dashed border-muted-foreground" />
            </DropdownMenuItem>
          {Object.keys(icons).map((name) => (
            <DropdownMenuItem
              key={name}
              className="flex items-center justify-center p-2 h-10 w-10 focus:bg-accent cursor-pointer"
              onClick={() => onIconChange(name as IconName)}
            >
              <ScheduleEventIcon icon={name as IconName} className="h-5 w-5" />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
