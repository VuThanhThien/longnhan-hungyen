'use client';

import { forwardRef, useMemo } from 'react';
import { ALargeSmall } from 'lucide-react';

import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/tiptap-ui-primitive/popover';
import { Separator } from '@/components/tiptap-ui-primitive/separator';
import {
  Card,
  CardBody,
  CardItemGroup,
} from '@/components/tiptap-ui-primitive/card';

import type {
  TextColorOption,
  UseColorTextPopoverConfig,
} from '@/components/tiptap-ui/color-text-popover/use-color-text-popover';
import {
  DEFAULT_TEXT_COLORS,
  useColorTextPopover,
} from '@/components/tiptap-ui/color-text-popover/use-color-text-popover';

export interface ColorTextPopoverProps
  extends
    Omit<ButtonProps, 'type'>,
    Pick<UseColorTextPopoverConfig, 'editor' | 'hideWhenUnavailable'> {
  colors?: TextColorOption[];
  onColorChanged?: UseColorTextPopoverConfig['onColorChanged'];
}

export const ColorTextPopover = forwardRef<
  HTMLButtonElement,
  ColorTextPopoverProps
>(
  (
    {
      editor: providedEditor,
      hideWhenUnavailable = false,
      colors = DEFAULT_TEXT_COLORS,
      onColorChanged,
      ...buttonProps
    },
    ref,
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canToggle, activeColor, handleColorChanged, label } =
      useColorTextPopover({
        editor,
        hideWhenUnavailable,
        onColorChanged,
      });

    const swatches = useMemo(
      () => colors.filter((c) => c.value !== ''),
      [colors],
    );

    if (!isVisible) return null;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={!canToggle}
            aria-label={label}
            tooltip={label}
            ref={ref}
            {...buttonProps}
          >
            <ALargeSmall
              className="tiptap-button-icon"
              style={{ color: activeColor || undefined }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="tiptap-color-text-popover-content">
          <Card>
            <CardBody>
              <CardItemGroup
                orientation="horizontal"
                className="gap-1 flex-wrap"
              >
                {swatches.map((c) => (
                  <Button
                    key={c.value}
                    type="button"
                    size="small"
                    variant="ghost"
                    data-active-state={activeColor === c.value ? 'on' : 'off'}
                    aria-label={c.label}
                    tooltip={c.label}
                    onClick={() => handleColorChanged(c.value)}
                    className="tiptap-color-swatch"
                  >
                    <span
                      className="tiptap-color-swatch-dot"
                      style={{ backgroundColor: c.value }}
                    />
                  </Button>
                ))}
              </CardItemGroup>
              <Separator style={{ margin: '0.5rem 0' }} />
              <Button
                type="button"
                size="small"
                variant="ghost"
                onClick={() => handleColorChanged('')}
              >
                Reset color
              </Button>
            </CardBody>
          </Card>
        </PopoverContent>
      </Popover>
    );
  },
);

ColorTextPopover.displayName = 'ColorTextPopover';
