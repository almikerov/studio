
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EditableFieldProps {
  value: string;
  setValue: (val: string) => void;
  className?: string;
  as?: 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span';
  inputType?: 'text' | 'time';
  placeholder?: string;
  isTextarea?: boolean;
  isMobile?: boolean | undefined;
  'data-id'?: string;
  disableEditing?: boolean;
}

export const EditableField = ({ 
    value, 
    setValue, 
    className, 
    as: Component = 'p', 
    inputType = 'text',
    placeholder,
    isTextarea = false,
    isMobile,
    disableEditing = false,
    ...props
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);
  
  useEffect(() => {
    if (isEditing) {
      if (isTextarea && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, isTextarea]);

  const handleBlur = () => {
    setValue(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleBlur();
    }
    if (e.key === 'Escape') {
      setText(value);
      setIsEditing(false);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableEditing) return;
    setIsEditing(true);
  }

  if (isEditing) {
    if (isTextarea) {
        return <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`${className} h-auto p-0 bg-transparent outline-none ring-2 ring-ring rounded-md`}
            placeholder={placeholder}
            onClick={(e) => e.stopPropagation()}
            rows={1}
        />
    }
    return <Input
      ref={inputRef}
      type={inputType}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} h-auto p-0 bg-transparent outline-none ring-2 ring-ring rounded-md`}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
    />
  }

  return <Component onClick={handleClick} className={`${className} ${!disableEditing ? 'cursor-pointer' : ''} min-h-[1em]`} {...props}>{value || placeholder}</Component>
}
