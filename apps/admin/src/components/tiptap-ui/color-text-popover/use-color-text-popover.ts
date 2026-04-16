'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { isExtensionAvailable } from '@/lib/tiptap-utils';

export interface TextColorOption {
  label: string;
  value: string;
}

export const DEFAULT_TEXT_COLORS: TextColorOption[] = [
  { label: 'Default', value: '' },
  { label: 'Gray', value: '#64748b' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Violet', value: '#8b5cf6' },
];

export interface UseColorTextPopoverConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onColorChanged?: (payload: { value: string }) => void;
}

export function useColorTextPopover(config: UseColorTextPopoverConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onColorChanged,
  } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = useState(true);

  const canToggle =
    !!editor &&
    editor.isEditable &&
    isExtensionAvailable(editor, 'textStyle') &&
    isExtensionAvailable(editor, 'color');

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (!hideWhenUnavailable) {
        setIsVisible(true);
        return;
      }
      setIsVisible(canToggle);
    };

    handleUpdate();
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [editor, hideWhenUnavailable, canToggle]);

  const textStyleAttrs = editor?.getAttributes('textStyle') as
    | { color?: string }
    | undefined;
  const activeColor =
    typeof textStyleAttrs?.color === 'string' ? textStyleAttrs.color : '';

  const handleColorChanged = useCallback(
    (value: string) => {
      if (!editor) return false;
      const chain = editor.chain().focus();
      const success = value
        ? chain.setColor(value).run()
        : chain.unsetColor().run();
      if (success) onColorChanged?.({ value });
      return success;
    },
    [editor, onColorChanged],
  );

  return {
    isVisible,
    canToggle,
    activeColor,
    handleColorChanged,
    label: 'Text color',
  };
}
