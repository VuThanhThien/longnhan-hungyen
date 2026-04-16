'use client';

import { useCallback, useMemo, useState } from 'react';
import type { EmojiItem } from '@tiptap/extension-emoji';

import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { Input } from '@/components/tiptap-ui-primitive/input';
import {
  Card,
  CardBody,
  CardHeader,
} from '@/components/tiptap-ui-primitive/card';
import { getFilteredEmojis } from '@/components/tiptap-ui/emoji-menu/get-filtered-emojis';

export interface EmojiMenuProps {
  emojis: EmojiItem[];
  onSelect: (emoji: EmojiItem) => void;
  onClose?: () => void;
  showSearch?: boolean;
}

export function EmojiMenu({
  emojis,
  onSelect,
  onClose,
  showSearch = true,
}: EmojiMenuProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => getFilteredEmojis({ query, emojis }),
    [query, emojis],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    },
    [onClose],
  );

  return (
    <Card className="tiptap-emoji-menu-card" onKeyDown={handleKeyDown}>
      {showSearch ? (
        <CardHeader>
          <Input
            type="search"
            placeholder="Search emojis…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search emojis"
          />
        </CardHeader>
      ) : null}
      <CardBody>
        <div className="tiptap-emoji-menu-list" aria-label="Emoji list">
          {filtered.map((emoji) => (
            <button
              key={emoji.name}
              type="button"
              className="tiptap-emoji-menu-item"
              onClick={() => onSelect(emoji)}
            >
              <span className="tiptap-emoji-menu-char" aria-hidden>
                {emoji.fallbackImage ? (
                  // eslint-disable-next-line @next/next/no-img-element -- extension-provided emoji image URL
                  <img
                    src={emoji.fallbackImage}
                    alt=""
                    width={20}
                    height={20}
                  />
                ) : (
                  emoji.emoji
                )}
              </span>
              <span className="tiptap-emoji-menu-name">:{emoji.name}:</span>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function EmojiMenuPopoverContent({
  emojis,
  onInserted,
}: {
  emojis: EmojiItem[];
  onInserted?: () => void;
}) {
  const { editor } = useTiptapEditor();

  const handleSelect = useCallback(
    (emoji: EmojiItem) => {
      if (!editor) return;
      const ok = editor
        .chain()
        .focus()
        .insertContent({
          type: 'emoji',
          attrs: { name: emoji.name },
        })
        .run();
      if (ok) onInserted?.();
    },
    [editor, onInserted],
  );

  return <EmojiMenu emojis={emojis} showSearch onSelect={handleSelect} />;
}
