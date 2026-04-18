'use client';

import { Extension, type Editor } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

export const slashCommandsPluginKey = new PluginKey('articleSlashCommands');

export type SlashItem = {
  title: string;
  description?: string;
  keywords?: string;
  command: (opts: {
    editor: Editor;
    range: { from: number; to: number };
  }) => void;
};

function slashItems(): SlashItem[] {
  return [
    {
      title: 'Đoạn văn',
      description: 'Văn bản thường',
      keywords: 'paragraph text',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Tiêu đề 1',
      keywords: 'h1 heading',
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 1 })
          .run();
      },
    },
    {
      title: 'Tiêu đề 2',
      keywords: 'h2 heading',
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 2 })
          .run();
      },
    },
    {
      title: 'Tiêu đề 3',
      keywords: 'h3 heading',
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setHeading({ level: 3 })
          .run();
      },
    },
    {
      title: 'Danh sách chấm',
      keywords: 'bullet ul',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Danh sách số',
      keywords: 'ordered ol',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Trích dẫn',
      keywords: 'quote',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: 'Khối mã',
      keywords: 'code pre',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: 'Đường kẻ ngang',
      keywords: 'divider hr',
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];
}

function filterSlashItems(query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  const items = slashItems();
  if (!q) return items;
  return items.filter((item) => {
    const hay =
      `${item.title} ${item.keywords ?? ''} ${item.description ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
}

type SlashListProps = {
  items: SlashItem[];
  command: (item: SlashItem) => void;
};

export type SlashListHandle = {
  onKeyDown: (p: { event: KeyboardEvent }) => boolean;
};

type SuggestionKeyDown = { event: KeyboardEvent };

export const SlashCommandList = forwardRef<SlashListHandle, SlashListProps>(
  function SlashCommandList({ items, command }, ref) {
    const [selected, setSelected] = useState(0);
    const itemsSignature = items.map((i) => i.title).join('\0');
    const [prevSignature, setPrevSignature] = useState(itemsSignature);
    if (itemsSignature !== prevSignature) {
      setPrevSignature(itemsSignature);
      setSelected(0);
    }

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDown) => {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelected(
            (i) => (i + items.length - 1) % Math.max(items.length, 1),
          );
          return true;
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelected((i) => (i + 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === 'Enter') {
          event.preventDefault();
          const item = items[selected];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-64 rounded-md border border-border bg-popover px-3 py-2 text-xs text-muted-foreground shadow-lg">
          Không có lệnh phù hợp
        </div>
      );
    }

    return (
      <div className="w-64 overflow-hidden rounded-md border border-border bg-popover py-1 text-sm shadow-lg">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={cn(
              'flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-foreground transition-colors',
              index === selected ? 'bg-muted' : 'hover:bg-background',
            )}
            onClick={() => command(item)}
          >
            <span className="font-medium">{item.title}</span>
            {item.description ? (
              <span className="text-xs font-normal text-muted-foreground">
                {item.description}
              </span>
            ) : null}
          </button>
        ))}
      </div>
    );
  },
);

function updateSlashListPosition(
  renderer: ReactRenderer,
  clientRect?: (() => DOMRect | null) | null,
) {
  const rect = clientRect?.();
  const el = renderer.element as HTMLElement;
  if (!rect) {
    el.style.visibility = 'hidden';
    return;
  }
  el.style.visibility = 'visible';
  el.style.position = 'fixed';
  el.style.zIndex = '100';
  el.style.left = `${rect.left}px`;
  el.style.top = `${rect.bottom + 6}px`;
}

/** Slash “/” menu — open-source analogue of Tiptap’s Notion template slash dropdown (no Cloud subscription). */
export const ArticleSlashCommands = Extension.create({
  name: 'articleSlashCommands',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: slashCommandsPluginKey,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }) => filterSlashItems(query),
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        render: () => {
          let renderer: ReactRenderer | null = null;

          return {
            onStart: (props) => {
              renderer = new ReactRenderer(SlashCommandList, {
                props: {
                  ...props,
                  items: props.items,
                },
                editor: props.editor,
              });
              document.body.appendChild(renderer.element);
              updateSlashListPosition(renderer, props.clientRect);
            },
            onUpdate(props) {
              if (!renderer) return;
              renderer.updateProps({
                ...props,
                items: props.items,
              });
              updateSlashListPosition(renderer, props.clientRect);
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                return false;
              }
              const handler = renderer?.ref as SlashListHandle | undefined;
              return handler?.onKeyDown(props) ?? false;
            },
            onExit() {
              renderer?.destroy();
              renderer = null;
            },
          };
        },
      }),
    ];
  },
});
