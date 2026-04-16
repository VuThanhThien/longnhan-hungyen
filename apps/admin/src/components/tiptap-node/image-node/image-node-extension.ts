import { Image } from '@tiptap/extension-image';

export type ImageAlign = 'left' | 'center' | 'right';

/**
 * Image extension with alignment (open-source alternative to Tiptap “Image node pro” UI).
 * Renders `data-align` + BEM class for styling.
 */
export const ImageWithAlign = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left' as ImageAlign,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-align');
          if (raw === 'center' || raw === 'right') return raw;
          return 'left';
        },
        renderHTML: (attributes) => {
          const align = (attributes.align as ImageAlign) || 'left';
          return {
            'data-align': align,
            class: `tiptap-image tiptap-image--align-${align}`,
          };
        },
      },
    };
  },
});
