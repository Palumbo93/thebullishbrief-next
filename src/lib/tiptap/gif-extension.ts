import { Node, mergeAttributes } from '@tiptap/core';

export interface GifOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    gif: {
      /**
       * Add a GIF
       */
      setGif: (options: { src: string; alt?: string; width?: string; height?: string }) => ReturnType;
    };
  }
}

export const Gif = Node.create<GifOptions>({
  name: 'gif',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-gif]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const img = node as HTMLElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            width: img.style.width || '100%',
            height: img.style.height || 'auto',
          };
        },
      },
      {
        tag: 'div[data-gif]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const div = node as HTMLElement;
          const img = div.querySelector('img');
          
          if (img) {
            // Strip the old margin from the style if it exists
            let divStyle = div.style.cssText || '';
            divStyle = divStyle.replace(/margin:\s*var\(--space-4\)\s*0;?\s*/g, '');
            
            return {
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              width: div.style.width || '100%',
              height: div.style.height || 'auto',
            };
          }
          
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, width, height } = HTMLAttributes;
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-gif': 'true',
        style: `width: ${width}; height: ${height}; max-width: 100%;`,
      }),
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, {
          src,
          alt: alt || 'GIF',
          style: 'width: 100%; height: auto; border-radius: var(--radius-lg); display: block;',
          loading: 'lazy',
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setGif:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
