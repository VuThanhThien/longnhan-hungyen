'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

interface TiptapHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function TiptapHtmlEditor({ value, onChange }: TiptapHtmlEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: value,
    editorProps: {
      attributes: {
        class: 'min-h-[220px] rounded-md border border-gray-200 p-3 text-sm focus:outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-gray-200 px-2 py-1 text-xs"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          className="rounded-md border border-gray-200 px-2 py-1 text-xs"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
