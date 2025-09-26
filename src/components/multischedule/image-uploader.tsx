
'use client';

import { useState, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Link, ImagePlus, X } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';


interface ImageUploaderProps {
  children?: React.ReactNode;
  onSetImageUrl: (url: string | null) => void;
}

export function ImageUploader({ children, onSetImageUrl }: ImageUploaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSetImageUrl(reader.result as string);
        setDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput) {
      onSetImageUrl(urlInput);
      setDialogOpen(false);
      setUrlInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUrlSubmit();
  }
  
  const Trigger = children ? Slot : Button;
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
       <DialogTrigger asChild id="image-uploader-trigger">
          <Trigger variant="ghost" size="icon">{children || <ImagePlus className="h-5 w-5" />}</Trigger>
       </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Изменить изображение</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Upload className="mr-2" />
            Загрузить с устройства
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <div className="relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Или вставьте URL изображения"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button onClick={handleUrlSubmit}>Добавить по URL</Button>
          <Button onClick={() => { onSetImageUrl(null); setDialogOpen(false); }} variant="destructive">
              <X className="mr-2" />
              Удалить изображение
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
