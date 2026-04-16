'use client';

import { useMemo } from 'react';
import { gitHubEmojis } from '@tiptap/extension-emoji';
import { SmilePlus } from 'lucide-react';

import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/tiptap-ui-primitive/popover';
import { EmojiMenuPopoverContent } from '@/components/tiptap-ui/emoji-menu/emoji-menu';

export function EmojiToolbarPopover() {
  const emojis = useMemo(() => Object.values(gitHubEmojis), []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label="Insert emoji"
          tooltip="Emoji"
        >
          <SmilePlus className="tiptap-button-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="simple-editor-emoji-popover"
        align="start"
        sideOffset={6}
      >
        <EmojiMenuPopoverContent emojis={emojis} />
      </PopoverContent>
    </Popover>
  );
}
