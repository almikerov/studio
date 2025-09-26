'use client';

import {
  PlaneTakeoff,
  PlaneLanding,
  Video,
  Utensils,
  Bed,
  Dumbbell,
  Landmark,
  FileText,
  LucideProps,
} from 'lucide-react';
import React from 'react';

const FootballField = (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
);


export const ICONS = {
  'football-field': FootballField,
  dumbbell: Dumbbell,
  passport: FileText,
  'plane-takeoff': PlaneTakeoff,
  'plane-landing': PlaneLanding,
  camera: Video,
  utensils: Utensils,
  bed: Bed,
  stadium: Landmark,
};

export type IconName = keyof typeof ICONS;

interface ScheduleEventIconProps extends LucideProps {
  icon: IconName;
}

export const ScheduleEventIcon = ({
  icon,
  ...props
}: ScheduleEventIconProps) => {
  const IconComponent = ICONS[icon];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
