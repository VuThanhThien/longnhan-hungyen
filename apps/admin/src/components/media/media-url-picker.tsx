'use client';

import { useMemo, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  useMediaLibrary,
  useUploadMedia,
} from '@/features/media/hooks/use-media-library';

interface MediaUrlPickerProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function MediaUrlPicker({
  value,
  onChange,
  folder = 'products',
}: MediaUrlPickerProps) {
  const [open, setOpen] = useState(false);
  const { data: library = [], isLoading } = useMediaLibrary();
  const uploadMutation = useUploadMedia();

  const preview = useMemo(() => value.trim(), [value]);

  function toggleLibrary() {
    if (library.length === 0 && !isLoading) {
      toast({
        title: 'Không có media hoặc chưa tải xong',
        variant: 'destructive',
      });
      return;
    }
    setOpen((prev) => !prev);
  }

  async function uploadFile(file: File) {
    try {
      const uploaded = await uploadMutation.mutateAsync({ file, folder });
      const uploadedUrl = uploaded.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast({ title: 'Upload thành công' });
      }
    } catch {
      toast({ title: 'Upload thất bại', variant: 'destructive' });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
          className="h-10 w-full rounded-md border border-border px-3 text-sm"
        />
        <button
          type="button"
          onClick={toggleLibrary}
          className="h-10 rounded-md border border-border px-3 text-sm hover:bg-background"
          disabled={isLoading}
        >
          {isLoading ? 'Đang tải...' : 'Chọn'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="media-file-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadFile(file);
            event.target.value = '';
          }}
        />
        <label
          htmlFor="media-file-upload"
          className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-sm hover:bg-background"
        >
          {uploadMutation.isPending ? 'Đang upload...' : 'Upload ảnh'}
        </label>
      </div>

      {preview ? (
        <div className="rounded-md border border-border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="preview"
            className="h-32 w-32 rounded-md object-cover"
          />
        </div>
      ) : null}

      {open ? (
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-2 md:grid-cols-4">
          {library.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                onChange(item.url);
                setOpen(false);
              }}
              className="overflow-hidden rounded-md border border-border hover:border-accent/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.filename || 'media'}
                className="h-24 w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
