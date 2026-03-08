import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, X, Image as ImageIcon } from 'lucide-react';
import type { ReportImage } from './RadiologyReportPDF';
import { cn } from '@/lib/utils';

interface ReportImageManagerProps {
  images: ReportImage[];
  onChange: (images: ReportImage[]) => void;
  disabled?: boolean;
}

export function ReportImageManager({ images, onChange, disabled }: ReportImageManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newImg: ReportImage = {
          id: `IMG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          dataUrl,
          caption: file.name.replace(/\.[^.]+$/, ''),
        };
        onChange([...images, newImg]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    onChange(images.filter(img => img.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(images.map(img => img.id === id ? { ...img, caption } : img));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          REPRESENTATIVE IMAGES
          <span className="text-muted-foreground font-normal">({images.length} attached)</span>
        </label>
        {!disabled && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add Images
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </>
        )}
      </div>

      {images.length === 0 ? (
        !disabled ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              Click to attach images — screenshots, key slices, annotated views
            </p>
            <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP supported</p>
          </button>
        ) : (
          <p className="text-xs text-muted-foreground italic py-2">No images attached to this report.</p>
        )
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative border border-border rounded-lg overflow-hidden bg-muted/30 group"
            >
              {/* Image preview */}
              <div className="bg-[hsl(222_47%_8%)] flex items-center justify-center h-32 overflow-hidden">
                <img
                  src={img.dataUrl}
                  alt={img.caption}
                  className="h-full w-full object-contain"
                />
              </div>
              {/* Caption */}
              <div className="p-2">
                {disabled ? (
                  <p className="text-[11px] text-muted-foreground text-center truncate">{img.caption || 'No caption'}</p>
                ) : (
                  <Input
                    value={img.caption}
                    onChange={e => updateCaption(img.id, e.target.value)}
                    placeholder="Add caption…"
                    className="h-6 text-[11px] px-2"
                  />
                )}
              </div>
              {/* Remove button */}
              {!disabled && (
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {/* Add more tile */}
          {!disabled && (
            <button
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg h-32 flex flex-col items-center justify-center gap-1.5 hover:border-primary/50 hover:bg-primary/5 transition-colors group"
            >
              <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-[11px] text-muted-foreground">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
