
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
  Home,
  Bus,
  Lock,
  Moon,
  CakeSlice,
  Shirt,
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
  <svg fill="currentColor" viewBox="-32 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M129.62 176h39.09c1.49-27.03 6.54-51.35 14.21-70.41-27.71 13.24-48.02 39.19-53.3 70.41zm0 32c5.29 31.22 25.59 57.17 53.3 70.41-7.68-19.06-12.72-43.38-14.21-70.41h-39.09zM224 286.69c7.69-7.45 20.77-34.42 23.43-78.69h-46.87c2.67 44.26 15.75 71.24 23.44 78.69zM200.57 176h46.87c-2.66-44.26-15.74-71.24-23.43-78.69-7.7 7.45-20.78 34.43-23.44 78.69zm64.51 102.41c27.71-13.24 48.02-39.19 53.3-70.41h-39.09c-1.49 27.03-6.53 51.35-14.21 70.41zM416 0H64C28.65 0 0 28.65 0 64v384c0 35.35 28.65 64 64 64h352c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32zm-80 416H112c-8.8 0-16-7.2-16-16s7.2-16 16-16h224c8.8 0 16 7.2 16 16s-7.2 16-16 16zm-112-96c-70.69 0-128-57.31-128-128S153.31 64 224 64s128 57.31 128 128-57.31 128-128 128zm41.08-214.41c7.68 19.06 12.72 43.38 14.21 70.41h39.09c-5.28-31.22-25.59-57.17-53.3-70.41z"/>
  </svg>
);

const SoccerBall = (props: LucideProps) => (
  <svg version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" {...props}>
    <circle cx="16" cy="16" r="13"/>
    <polygon points="16,11 10,15.2 12.3,22 19.7,22 22,15.2 "/>
    <polyline points="22,15 26,13 27,9.1 "/>
    <polyline points="12,4 16,6 16,11 "/>
    <line x1="20" y1="4" x2="16" y2="6"/>
    <line x1="26" y1="13" x2="28.9" y2="14.8"/>
    <polyline points="9.9,15 5.9,13 4.9,9.2 "/>
    <line x1="5.9" y1="13" x2="3.1" y2="14.7"/>
    <polyline points="5.3,23.4 10,24 12,22 "/>
    <line x1="12" y1="28" x2="10" y2="24"/>
    <polyline points="26.6,23.5 22,24 20,22 "/>
    <line x1="20" y1="28" x2="22" y2="24"/>
  </svg>
);


const ICONS_COMPONENTS = {
  'football-field': FootballField,
  dumbbell: Dumbbell,
  passport: PassportIcon,
  'plane-takeoff': PlaneTakeoff,
  'plane-landing': PlaneLanding,
  camera: Video,
  utensils: Utensils,
  bed: Bed,
  stadium: Landmark,
  document: FileText,
  home: Home,
  bus: Bus,
  'soccer-ball': SoccerBall,
  lock: Lock,
  moon: Moon,
  cake: CakeSlice,
  shirt: Shirt,
};

export type IconName = keyof typeof ICONS_COMPONENTS;

export const ICONS = Object.keys(ICONS_COMPONENTS) as IconName[];


interface ScheduleEventIconProps extends LucideProps {
  icon: IconName;
}

export const ScheduleEventIcon = ({
  icon,
  ...props
}: ScheduleEventIconProps) => {
  const IconComponent = ICONS_COMPONENTS[icon];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};
