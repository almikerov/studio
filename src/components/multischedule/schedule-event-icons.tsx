'use client';

import {
  PlaneTakeoff,
  PlaneLanding,
  Video,
  Utensils,
  Bed,
  Dumbbell,
  Landmark,
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

const PassportIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 17.5v-13Z" />
    <circle cx="11" cy="12" r="4" />
    <path d="M11 8v8" />
    <path d="M7 12h8" />
    <path d="M18 6h2" />
    <path d="M18 10h2" />
    <path d="M18 14h2" />
  </svg>
);


export const ICONS = {
  'football-field': FootballField,
  dumbbell: Dumbbell,
  passport: PassportIcon,
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
