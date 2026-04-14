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

  async upload(file: File, folder = 'general') {
    const payload = new FormData();
    payload.set('file', file);

    const response = await httpClient.post<{ data: MediaItem }>(
      `/media/upload?folder=${folder}`,
      payload,
    );
    return response.data.data;
  },

  async remove(id: string) {
    await httpClient.delete(`/media/${id}`);
  },
};
