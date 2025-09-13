import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EmbedPreview } from '../../components/embeds/EmbedPreview';

// Sanitization function to clean potentially dangerous content
function sanitizeContent(content: string): string {
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  // Remove dangerous attributes and elements
  const elements = tempDiv.querySelectorAll('*');
  elements.forEach(element => {
    // Remove dangerous attributes
    const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'];
    dangerousAttrs.forEach(attr => {
      element.removeAttribute(attr);
    });
    
    // Remove style attributes that could be dangerous
    const style = element.getAttribute('style');
    if (style) {
      // Remove potentially dangerous CSS properties
      const dangerousStyles = ['expression', 'javascript:', 'vbscript:', 'data:'];
      const hasDangerousStyle = dangerousStyles.some(dangerous => 
        style.toLowerCase().includes(dangerous)
      );
      
      if (hasDangerousStyle) {
        element.removeAttribute('style');
      }
    }
  });
  
  // For iframes, ensure they have proper sandbox attributes
  const iframes = tempDiv.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    // Add sandbox attribute for security
    if (!iframe.hasAttribute('sandbox')) {
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    }
  });
  
  return tempDiv.innerHTML;
}

export interface EmbedOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      /**
       * Add an embed (iframe, script, or custom HTML)
       */
      setEmbed: (options: {
        content: string;
        title?: string;
        width?: string;
        height?: string;
        type?: 'iframe' | 'script' | 'html';
      }) => ReturnType;
      /**
       * Update an existing embed
       */
      updateEmbed: (options: {
        content: string;
        title?: string;
        width?: string;
        height?: string;
        type?: 'iframe' | 'script' | 'html';
      }) => ReturnType;
    };
  }
}

export const Embed = Node.create<EmbedOptions>({
  name: 'embed',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addNodeView() {
    return ReactNodeViewRenderer(EmbedPreview);
  },

  addAttributes() {
    return {
      content: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: '400px',
      },
      type: {
        default: 'html',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-embed]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const div = node as HTMLElement;
          const content = div.getAttribute('data-embed-content') || '';
          const title = div.getAttribute('data-embed-title') || '';
          const width = div.getAttribute('data-embed-width') || '100%';
          const height = div.getAttribute('data-embed-height') || '400px';
          const type = div.getAttribute('data-embed-type') || 'html';
          
          return {
            content,
            title,
            width,
            height,
            type,
          };
        },
      },
      {
        tag: 'iframe',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const iframe = node as HTMLElement;
          const src = iframe.getAttribute('src') || '';
          const title = iframe.getAttribute('title') || '';
          const width = iframe.style.width || '100%';
          const height = iframe.style.height || '400px';
          
          // Convert iframe to our embed format
          const content = iframe.outerHTML;
          
          return {
            content,
            title,
            width,
            height,
            type: 'iframe',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { content, title, width, height, type } = HTMLAttributes;
    
    // For published pages, output a clean container that the EmbedRenderer will process
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-embed': 'true',
        'data-embed-type': type || 'html',
        'data-embed-content': content || '',
        'data-embed-title': title || '',
        'data-embed-width': width || '100%',
        'data-embed-height': height || 'auto',
        'class': 'embed-container',
      }),
      // Empty content - will be filled by EmbedRenderer component
    ];
  },

  addCommands() {
    return {
      setEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      updateEmbed:
        (options) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, options);
        },
    };
  },

});
