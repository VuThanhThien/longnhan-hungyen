import { httpClient } from '@/lib/http-client';
import type { MediaFolder, MediaItem } from '@/lib/media';

interface PaginatedResponse<T> {
  data: T[];
}

export const mediaApi = {
  async list(params?: { page?: number; limit?: number; folder?: string }) {
    const response = await httpClient.get<PaginatedResponse<MediaItem>>(
      '/media',
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 60,
          ...(params?.folder ? { folder: params.folder } : {}),
        },
      },
    );
    return response.data.data ?? [];
  },

  async listFolders() {
    const response = await httpClient.get<
      { data: MediaFolder[] } | MediaFolder[]
    >('/media/folders');
    return Array.isArray(response.data)
      ? response.data
      : (response.data.data ?? []);
  },

  async createFolder(name: string) {
    const response = await httpClient.post<{ data: MediaFolder } | MediaFolder>(
      '/media/folders',
      { name },
    );
    return 'data' in (response.data as Record<string, unknown>)
      ? (response.data as { data: MediaFolder }).data
      : (response.data as MediaFolder);
  },

  async removeFolder(name: string) {
    await httpClient.delete(`/media/folders/${encodeURIComponent(name)}`);
  },

  async upload(
    file: File,
    folder = 'general',
    options?: {
      onProgress?: (event: { progress: number }) => void;
      abortSignal?: AbortSignal;
    },
  ) {
    const payload = new FormData();
    payload.set('file', file);

    const response = await httpClient.post<{ data: MediaItem } | MediaItem>(
      `/media/upload?folder=${folder}`,
      payload,
      {
        signal: options?.abortSignal,
        onUploadProgress: (event) => {
          const total = event.total ?? 0;
          const loaded = event.loaded ?? 0;

          if (!total) return;
          const progress = Math.round((loaded / total) * 100);
          options?.onProgress?.({ progress });
        },
      },
    );
    const data = response.data as unknown;
    if (
      data &&
      typeof data === 'object' &&
      'data' in (data as Record<string, unknown>)
    ) {
      return (data as { data: MediaItem }).data;
    }
    return data as MediaItem;
  },

  async remove(id: string) {
    await httpClient.delete(`/media/${id}`);
  },
};
