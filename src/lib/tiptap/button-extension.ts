import { Node, mergeAttributes } from '@tiptap/core';

export interface ButtonOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    button: {
      /**
       * Add a button
       */
      setButton: (options: { text: string; href: string; variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'base' | 'lg'; target?: '_blank' | '_self'; icon?: string; iconSide?: 'left' | 'right' }) => ReturnType;
    };
  }
}

export const Button = Node.create<ButtonOptions>({
  name: 'button',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      text: {
        default: null,
      },
      href: {
        default: null,
      },
      variant: {
        default: 'primary',
      },
      size: {
        default: 'base',
      },
      target: {
        default: '_self',
      },
      icon: {
        default: null,
      },
      iconSide: {
        default: 'left',
      },
    };
  },

  parseHTML() {
    console.log('🔄 Button extension parseHTML called');
    return [
      {
        tag: 'div[data-button]',
        getAttrs: (node) => {
          console.log('🔄 Button extension parsing div[data-button]:', node);
          if (typeof node === 'string') return false;
          const div = node as HTMLElement;
          const link = div.querySelector('a');
          
          if (link) {
            return {
              text: link.textContent?.trim() || '',
              href: link.getAttribute('href') || '',
              target: link.getAttribute('target') || '_self',
              variant: link.className.includes('btn-primary') ? 'primary' : 
                      link.className.includes('btn-secondary') ? 'secondary' : 'ghost',
              size: link.className.includes('btn-sm') ? 'sm' : 
                   link.className.includes('btn-lg') ? 'lg' : 'base',
            };
          }
          
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { text, href, variant, size, target, icon, iconSide } = HTMLAttributes;
    
    // Map variant to CSS classes
    const variantClass = 
      variant === 'primary' ? 'btn-primary' :
      variant === 'secondary' ? 'btn-secondary' :
      'btn-ghost';
    
    // Map size to CSS classes
    const sizeClass = 
      size === 'sm' ? 'btn-sm' :
      size === 'lg' ? 'btn-lg' :
      '';
    
    const buttonClasses = ['btn', variantClass, sizeClass].filter(Boolean).join(' ');
    
    // Get the appropriate background and text colors based on variant
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            background: '#fff', // Black background for primary
            color: '#000', // White text for primary
            border: 'none',
          };
        case 'secondary':
          return {
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: 'none',
          };
        case 'ghost':
        default:
          return {
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: 'none',
          };
      }
    };
    
    const variantStyles = getVariantStyles();
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-button': 'true',
        style: 'margin: var(--space-4) 0; text-align: center;',
      }),
      [
        'a',
        {
          href,
          target,
          rel: target === '_blank' ? 'noopener noreferrer' : undefined,
          className: buttonClasses,
          style: `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
            text-decoration: none;
            transition: all var(--transition-base);
            height: var(--btn-height-base);
            padding: 0 var(--btn-padding-x-base);
            font-family: var(--font-primary);
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            line-height: 1;
            border-radius: var(--radius-full);
            cursor: pointer;
            white-space: nowrap;
            background: ${variantStyles.background} !important;
            color: ${variantStyles.color} !important;
            border: ${variantStyles.border};
          `,
        },
        [
          'span',
          {},
          text,
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setButton:
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
