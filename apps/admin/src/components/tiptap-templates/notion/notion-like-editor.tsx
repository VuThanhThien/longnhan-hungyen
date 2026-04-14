'use client';

import {
  SimpleEditor,
  type SimpleEditorProps,
} from '@/components/tiptap-templates/simple/simple-editor';
import { cn } from '@/lib/utils';

export type NotionEditorProps = Omit<SimpleEditorProps, 'layout'> & {
  /**
   * Kept for API-compat with Tiptap's Notion-like template.
   * In our implementation (OSS), it's currently used only as an identifier.
   */
  room: string;
};

export function NotionEditor({
  room,
  documentHtml,
  onDocumentHtmlChange,
  placeholder = 'Start writing…',
  className,
  showThemeToggle = true,
}: NotionEditorProps) {
  void room;
  return (
    <SimpleEditor
      documentHtml={documentHtml}
      onDocumentHtmlChange={onDocumentHtmlChange}
      placeholder={placeholder}
      showThemeToggle={showThemeToggle}
      layout="fullpage"
      className={cn('tiptap-notion-editor-root', className)}
    />
  );
}
