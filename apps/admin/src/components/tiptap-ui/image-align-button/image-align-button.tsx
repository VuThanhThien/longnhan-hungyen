'use client';

import { forwardRef, useCallback, useEffect, useState } from 'react';

import type { ImageAlign } from '@/components/tiptap-node/image-node/image-node-extension';
import type { UseImageAlignConfig } from '@/components/tiptap-ui/image-align-button/use-image-align';
import { useImageAlign } from '@/components/tiptap-ui/image-align-button/use-image-align';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';

import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';

export interface ImageAlignButtonProps
  extends Omit<ButtonProps, 'type'>, UseImageAlignConfig {}

export const ImageAlignButton = forwardRef<
  HTMLButtonElement,
  ImageAlignButtonProps
>(
  (
    {
      editor: providedEditor,
      align,
      hideWhenUnavailable = true,
      onAligned,
      onClick,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, isActive, canApply, handleAlign, label, Icon } =
      useImageAlign({
        editor,
        align,
        hideWhenUnavailable,
        onAligned,
      });

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleAlign();
      },
      [handleAlign, onClick],
    );

    if (!isVisible) return null;

    return (
      <Button
        type="button"
        disabled={!canApply}
        variant="ghost"
        data-style="ghost"
        data-active-state={isActive ? 'on' : 'off'}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? <Icon className="tiptap-button-icon" />}
      </Button>
    );
  },
);

ImageAlignButton.displayName = 'ImageAlignButton';

export function ImageAlignToolbarGroup() {
  const { editor } = useTiptapEditor();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const sync = () => {
      setShow(editor.isActive('image'));
    };

    sync();
    editor.on('transaction', sync);
    return () => {
      editor.off('transaction', sync);
    };
  }, [editor]);

  if (!show) return null;

  const aligns: ImageAlign[] = ['left', 'center', 'right'];
  return (
    <>
      {aligns.map((align) => (
        <ImageAlignButton
          key={align}
          align={align}
          hideWhenUnavailable={false}
        />
      ))}
    </>
  );
}
