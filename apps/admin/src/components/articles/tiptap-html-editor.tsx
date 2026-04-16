'use client';

import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { cn } from '@/lib/utils';

export interface TiptapHtmlEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapHtmlEditor({
  value,
  onChange,
  placeholder = 'Viết nội dung… Gõ / để chèn khối (tiêu đề, danh sách, trích dẫn…)',
  className,
}: TiptapHtmlEditorProps) {
  return (
    <SimpleEditor
      documentHtml={value}
      onDocumentHtmlChange={onChange}
      placeholder={placeholder}
      layout="embedded"
      className={cn('tiptap-article-editor-root', className)}
    />
  );
}
