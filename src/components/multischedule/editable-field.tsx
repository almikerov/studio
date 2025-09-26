'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface EditableFieldProps {
  value: string;
  setValue: (val: string) => void;
  className: string;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3';
}

export const EditableField = ({ value, setValue, className, as: Component = 'div' }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    setValue(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setText(value);
      setIsEditing(false);
    }
  };
  
  if (isEditing) {
    return <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} h-auto p-0 bg-transparent outline-none ring-2 ring-ring rounded-md`}
      autoFocus
    />
  }

  return <Component onClick={() => setIsEditing(true)} className={`${className} cursor-pointer`}>{value}</Component>
}
