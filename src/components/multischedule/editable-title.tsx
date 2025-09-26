'use client';

import { useState, useRef } from 'react';

interface EditableTitleProps {
  value: string;
  setValue: (val: string) => void;
  className: string;
}

export const EditableTitle = ({ value, setValue, className }: EditableTitleProps) => {
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
      return <input 
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`${className} bg-transparent outline-none ring-2 ring-ring rounded-md`}
        autoFocus
      />
    }

    return <h1 onClick={() => setIsEditing(true)} className={`${className} cursor-pointer`}>{value}</h1>
  }
