'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import type { ImageAlign } from '@/components/tiptap-node/image-node/image-node-extension';

import { AlignCenterIcon } from '@/components/tiptap-icons/align-center-icon';
import { AlignLeftIcon } from '@/components/tiptap-icons/align-left-icon';
import { AlignRightIcon } from '@/components/tiptap-icons/align-right-icon';

export const IMAGE_ALIGN_ORDER: ImageAlign[] = ['left', 'center', 'right'];

export const imageAlignIcons = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
} as const;

export const imageAlignLabels: Record<ImageAlign, string> = {
  left: 'Align image left',
  center: 'Align image center',
  right: 'Align image right',
};

export function getImageAlign(editor: Editor | null): ImageAlign {
  if (!editor || !editor.isActive('image')) return 'left';
  const align = editor.getAttributes('image')?.align as ImageAlign | undefined;
  if (align === 'center' || align === 'right') return align;
  return 'left';
}

export function canSetImageAlign(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('image');
}

export function setImageAlign(
  editor: Editor | null,
  align: ImageAlign,
): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!editor.isActive('image')) return false;
  return editor.chain().focus().updateAttributes('image', { align }).run();
}

export interface UseImageAlignConfig {
  editor?: Editor | null;
  align: ImageAlign;
  hideWhenUnavailable?: boolean;
  onAligned?: () => void;
}

export function useImageAlign(config: UseImageAlignConfig) {
  const {
    editor: providedEditor,
    align,
    hideWhenUnavailable = false,
    onAligned,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);
  const active = getImageAlign(editor) === align;
  const canApply = canSetImageAlign(editor);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (!hideWhenUnavailable) {
        setIsVisible(true);
        return;
      }
      setIsVisible(editor.isActive('image'));
    };

    handleUpdate();
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleAlign = useCallback(() => {
    if (!editor) return false;
    const success = setImageAlign(editor, align);
    if (success) onAligned?.();
    return success;
  }, [editor, align, onAligned]);

  return {
    isVisible,
    isActive: active,
    canApply,
    handleAlign,
    label: imageAlignLabels[align],
    Icon: imageAlignIcons[align],
  };
}
