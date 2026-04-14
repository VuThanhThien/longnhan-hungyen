'use client';

import { useState } from 'react';
import { Folder, FolderPlus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  useCreateMediaFolder,
  useDeleteMediaFolder,
  useMediaFolders,
  useDeleteMedia,
  useMediaLibrary,
  useUploadMedia,
} from '@/features/media/hooks/use-media-library';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MediaManager() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const { data: folders = [], isLoading: isFoldersLoading } = useMediaFolders();
  const { data: items = [], isLoading } = useMediaLibrary(
    selectedFolder ?? undefined,
  );
  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();
  const createFolderMutation = useCreateMediaFolder();
  const deleteFolderMutation = useDeleteMediaFolder();

  async function upload(file: File) {
    if (!selectedFolder) {
      toast({
        title: 'Hãy chọn thư mục trước khi upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadMutation.mutateAsync({ file, folder: selectedFolder });
      toast({ title: 'Upload thành công' });
    } catch {
      toast({ title: 'Upload thất bại', variant: 'destructive' });
    }
  }

  async function remove(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Xóa ảnh thành công' });
    } catch {
      toast({ title: 'Xóa ảnh thất bại', variant: 'destructive' });
    }
  }

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) {
      toast({ title: 'Nhập tên thư mục', variant: 'destructive' });
      return;
    }

    try {
      const folder = await createFolderMutation.mutateAsync(name);
      setSelectedFolder(folder.name);
      setNewFolderName('');
      toast({ title: 'Tạo thư mục thành công' });
    } catch {
      toast({ title: 'Tạo thư mục thất bại', variant: 'destructive' });
    }
  }

  async function removeFolder(name: string) {
    try {
      await deleteFolderMutation.mutateAsync(name);
      if (selectedFolder === name) setSelectedFolder(null);
      toast({ title: 'Đã xóa thư mục' });
    } catch {
      toast({
        title: 'Không thể xóa thư mục (hãy xóa hết ảnh trước)',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={newFolderName}
          onChange={(event) => setNewFolderName(event.target.value)}
          placeholder="Tên thư mục mới (vd: products/banner)"
          className="sm:max-w-sm"
        />
        <Button
          type="button"
          onClick={createFolder}
          disabled={createFolderMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          {createFolderMutation.isPending ? 'Đang tạo...' : 'Tạo thư mục'}
        </Button>
      </div>

      {!selectedFolder ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Chọn thư mục để xem ảnh</p>
          {isFoldersLoading ? (
            <p className="text-sm text-gray-500">Đang tải thư mục...</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <button
                key={folder.name}
                type="button"
                onClick={() => setSelectedFolder(folder.name)}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-green-300 hover:bg-green-50"
              >
                <div className="flex items-center gap-3">
                  <Folder className="h-5 w-5 text-green-700" />
                  <div>
                    <p className="font-medium text-gray-900">{folder.name}</p>
                    <p className="text-xs text-gray-500">
                      {folder.itemCount} files
                    </p>
                  </div>
                </div>
                <Trash2
                  className="h-4 w-4 text-red-500"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void removeFolder(folder.name);
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedFolder(null)}
            >
              Quay lại thư mục
            </Button>
            <span className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm">
              <Folder className="h-4 w-4" />
              {selectedFolder}
            </span>
            <input
              id="media-gallery-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = '';
              }}
            />
            <label
              htmlFor="media-gallery-upload"
              className="inline-flex h-10 cursor-pointer items-center rounded-md bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-700"
            >
              {uploadMutation.isPending ? 'Đang upload...' : 'Upload ảnh mới'}
            </label>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500">Đang tải ảnh...</p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-md border border-gray-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.filename || 'media'}
                  className="h-36 w-full object-cover"
                />
                <div className="space-y-2 p-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.url).catch(() => {});
                      toast({ title: 'Đã copy URL' });
                    }}
                    className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    disabled={deleteMutation.isPending}
                    className="w-full rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && items.length === 0 ? (
              <div className="col-span-full rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                <ImageIcon className="mx-auto mb-2 h-5 w-5" />
                Thư mục này chưa có ảnh
              </div>
            ) : null}
          </div>
        </div>
      )}

      {!isFoldersLoading && folders.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Chưa có thư mục nào. Hãy tạo thư mục đầu tiên để upload ảnh.
        </div>
      ) : null}
    </div>
  );
}
