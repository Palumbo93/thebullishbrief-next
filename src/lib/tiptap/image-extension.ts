import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, ReactNodeViewProps } from '@tiptap/react';
import { ImagePreview } from '../../components/images/ImagePreview';
import React from 'react';

export interface ImageOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image with optional figcaption
       */
      setImage: (options: { 
        src: string; 
        alt?: string; 
        title?: string;
        figcaption?: string;
        width?: string;
        height?: string;
      }) => ReturnType;
      /**
       * Update an existing image
       */
      updateImage: (options: { 
        src?: string; 
        alt?: string; 
        title?: string;
        figcaption?: string;
        width?: string;
        height?: string;
      }) => ReturnType;
    };
  }
}

export const Image = Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addNodeView() {
    // Create a wrapper component that bridges ReactNodeViewProps and ImagePreviewProps
    const ImageWrapper: React.FC<ReactNodeViewProps> = (props) => {
      return React.createElement(ImagePreview, {
        node: props.node,
        updateAttributes: props.updateAttributes,
        selected: props.selected,
      });
    };
    
    return ReactNodeViewRenderer(ImageWrapper);
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      figcaption: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const figure = node as HTMLElement;
          const img = figure.querySelector('img');
          const figcaption = figure.querySelector('figcaption');
          
          if (img) {
            return {
              src: img.getAttribute('src'),
              alt: img.getAttribute('alt'),
              title: img.getAttribute('title'),
              figcaption: figcaption?.textContent || null,
              width: img.getAttribute('width'),
              height: img.getAttribute('height'),
            };
          }
          
          return false;
        },
      },
      {
        tag: 'img',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const img = node as HTMLElement;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, figcaption, width, height } = HTMLAttributes;
    
    // If there's a figcaption, wrap in a figure element
    if (figcaption) {
      return [
        'figure',
        mergeAttributes(this.options.HTMLAttributes, {
          style: `
            margin: var(--space-4) 0;
            text-align: center;
            max-width: 100%;
          `,
        }),
        [
          'img',
          mergeAttributes(this.options.HTMLAttributes, {
            src,
            alt: alt || '',
            title: title || '',
            width: width || undefined,
            height: height || undefined,
            style: `
              max-width: 100%;
              height: auto;
              border-radius: var(--radius-lg);
              display: block;
              margin: 0 auto;
            `,
            loading: 'lazy',
          }),
        ],
        [
          'figcaption',
          {
            style: `
              font-size: var(--text-sm);
              color: var(--color-text-secondary);
              margin-top: var(--space-2);
              font-style: italic;
              text-align: center;
              line-height: 1.4;
            `,
          },
          figcaption,
        ],
      ];
    }
    
    // No figcaption, just render the image
    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, {
        src,
        alt: alt || '',
        title: title || '',
        width: width || undefined,
        height: height || undefined,
        style: `
          max-width: 100%;
          height: auto;
          border-radius: var(--radius-lg);
          display: block;
          margin: var(--space-4) auto;
        `,
        loading: 'lazy',
      }),
    ];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      updateImage:
        (options) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options);
        },
    };
  },
});
