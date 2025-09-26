'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Link, ImagePlus, X, Edit } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
}

export function ImageUploader({ imageUrl, setImageUrl }: ImageUploaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput) {
      setImageUrl(urlInput);
      setDialogOpen(false);
      setUrlInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUrlSubmit();
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(null);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center relative group overflow-hidden">
            {imageUrl ? (
                <>
                    <Image
                        src={imageUrl}
                        alt="Uploaded schedule image"
                        fill
                        className="object-cover"
                        crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 hover:text-white">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <Button variant="ghost" size="icon" onClick={handleRemoveImage} className="h-7 w-7 text-white hover:bg-destructive/80 hover:text-white">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full h-full">
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </Button>
                </DialogTrigger>
            )}
        </div>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить изображение</DialogTitle>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
