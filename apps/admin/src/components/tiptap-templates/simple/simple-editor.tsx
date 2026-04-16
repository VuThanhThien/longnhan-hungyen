'use client';

import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { ALargeSmall } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// --- Tiptap Core Extensions ---
import { Color } from '@tiptap/extension-color';
import Emoji, { gitHubEmojis } from '@tiptap/extension-emoji';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Typography } from '@tiptap/extension-typography';
import { UniqueID } from '@tiptap/extension-unique-id';
import { Selection } from '@tiptap/extensions';
import { StarterKit } from '@tiptap/starter-kit';

import { ArticleSlashCommands } from '@/components/articles/tiptap-editor-slash';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import { ImageWithAlign } from '@/components/tiptap-node/image-node/image-node-extension';
import '@/components/tiptap-node/image-node/image-node.scss';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from '@/components/tiptap-ui/color-highlight-popover';
import { ColorTextPopover } from '@/components/tiptap-ui/color-text-popover';
import { EmojiToolbarPopover } from '@/components/tiptap-ui/emoji-menu';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageAlignToolbarGroup } from '@/components/tiptap-ui/image-align-button';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from '@/components/tiptap-ui/link-popover';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { ImagePlusIcon } from '@/components/tiptap-icons/image-plus-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';

// --- Hooks ---
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { useWindowSize } from '@/hooks/use-window-size';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';
import { cn } from '@/lib/utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';

import content from '@/components/tiptap-templates/simple/data/content.json';

export type SimpleEditorProps = {
  documentHtml?: string;
  onDocumentHtmlChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  layout?: 'embedded' | 'fullpage';
};

function InsertImageUploadAreaButton() {
  const { editor } = useTiptapEditor();

  const handleClick = useCallback(() => {
    editor?.chain().focus().setImageUploadNode().run();
  }, [editor]);

  return (
    <Button
      type="button"
      variant="ghost"
      aria-label="Insert image upload area"
      tooltip="Insert image upload area"
      onClick={handleClick}
      disabled={!editor?.isEditable}
    >
      <ImagePlusIcon className="tiptap-button-icon" />
    </Button>
  );
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  onTextColorClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  onTextColorClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={['bulletList', 'orderedList', 'taskList']}
        />
        <BlockquoteButton showShortcut />
        <CodeBlockButton />
        <EmojiToolbarPopover />

        <ImageUploadButton hideWhenUnavailable showShortcut />
        <InsertImageUploadAreaButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageAlignToolbarGroup />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorTextPopover hideWhenUnavailable />
        ) : (
          <Button
            type="button"
            variant="ghost"
            aria-label="Text color"
            tooltip="Text color"
            onClick={onTextColorClick}
          >
            <ALargeSmall className="tiptap-button-icon" aria-hidden />
          </Button>
        )}
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link' | 'color';
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button type="button" variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : type === 'color' ? (
          <ALargeSmall className="tiptap-button-icon" aria-hidden />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? (
      <ColorHighlightPopoverContent />
    ) : type === 'color' ? (
      <div className="simple-editor-mobile-color-text">
        <ColorTextPopover hideWhenUnavailable={false} />
      </div>
    ) : (
      <LinkContent />
    )}
  </>
);

export function SimpleEditor({
  documentHtml,
  onDocumentHtmlChange,
  placeholder = 'Start writing…',
  className,
  layout = 'embedded',
}: SimpleEditorProps = {}) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<
    'main' | 'highlighter' | 'link' | 'color'
  >('main');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  const initialContent = documentHtml !== undefined ? documentHtml : content;

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        horizontalRule: false,
        hardBreak: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      UniqueID.configure({
        types: ['heading'],
      }),
      HardBreak.configure({
        keepMarks: true,
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Emoji.configure({
        emojis: gitHubEmojis,
        enableEmoticons: false,
      }),
      ImageWithAlign.configure({
        inline: false,
        allowBase64: false,
      }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => {
          console.error('Image upload node failed:', error);
        },
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      ArticleSlashCommands,
    ],
    [placeholder],
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          'aria-label': 'Main content area, start typing to enter text.',
          class: 'simple-editor',
          'data-placeholder': placeholder,
        },
      },
      extensions,
      content: initialContent,
      onUpdate: ({ editor: instance }) => {
        onDocumentHtmlChange?.(instance.getHTML());
      },
    },
    [extensions],
  );

  useEffect(() => {
    if (!editor || documentHtml === undefined) return;
    if (documentHtml === editor.getHTML()) return;
    editor.commands.setContent(documentHtml, { emitUpdate: false });
  }, [documentHtml, editor]);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;

    const update = () => setToolbarHeight(el.getBoundingClientRect().height);
    update();

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile, mobileView]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarHeight,
  });
  const activeMobileView = isMobile ? mobileView : 'main';

  return (
    <div
      className={cn('simple-editor-wrapper', className)}
      data-layout={layout}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {activeMobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              onTextColorClick={() => setMobileView('color')}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={
                activeMobileView === 'highlighter'
                  ? 'highlighter'
                  : activeMobileView === 'color'
                    ? 'color'
                    : 'link'
              }
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <div className="simple-editor-main">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </div>
      </EditorContext.Provider>
    </div>
  );
}
