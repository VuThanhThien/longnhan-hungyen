'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '@/features/media/api/media-api';

const MEDIA_QUERY_KEY = ['media-library'] as const;
const MEDIA_FOLDERS_QUERY_KEY = ['media-library-folders'] as const;

export function useMediaLibrary(folder?: string) {
  return useQuery({
    queryKey: [...MEDIA_QUERY_KEY, folder ?? 'all'],
    queryFn: () => mediaApi.list({ page: 1, limit: 120, folder }),
    enabled: Boolean(folder),
  });
}

export function useMediaFolders() {
  return useQuery({
    queryKey: MEDIA_FOLDERS_QUERY_KEY,
    queryFn: () => mediaApi.listFolders(),
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      mediaApi.upload(file, folder),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
    },
  });
}

export function useCreateMediaFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => mediaApi.createFolder(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
    },
  });
}

export function useDeleteMediaFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => mediaApi.removeFolder(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MEDIA_FOLDERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY });
    },
  });
}
