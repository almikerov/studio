'use client';

import {
  PlaneTakeoff,
  PlaneLanding,
  Video,
  Utensils,
  Bed,
  Dumbbell,
  Landmark,
  Star
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import React from 'react';

const SoccerField = (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="12" y1="3" x2="12" y2="21"></line>
        <circle cx="12" cy="12" r="3"></circle>
        <rect x="1" y="9" width="4" height="6"></rect>
        <rect x="19" y="9" width="4" height="6"></rect>
    </svg>
);

const Stadium = (props: LucideProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4 10.4V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V10.4" />
        <path d="M20 10.4c0-4.9-3-8.4-8-8.4s-8 3.5-8 8.4" />
        <path d="M4 14h16" />
    </svg>
);


export const icons = {
  'soccer-field': SoccerField,
  dumbbell: Dumbbell,
  passport: Landmark, // Lucide doesn't have a passport, using Landmark
  'plane-takeoff': PlaneTakeoff,
  'plane-land': PlaneLanding,
  camera: Video,
  utensils: Utensils,
  bed: Bed,
  stadium: Stadium,
  star: Star, // Default icon
};

export type IconName = keyof typeof icons;

interface ScheduleEventIconProps extends LucideProps {
  icon: IconName;
}

export const ScheduleEventIcon = ({ icon, ...props }: ScheduleEventIconProps) => {
  const IconComponent = icons[icon] || Star;
  return <IconComponent {...props} />;
};
