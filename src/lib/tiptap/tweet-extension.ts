import { Node, mergeAttributes } from '@tiptap/core';

export interface TweetOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tweet: {
      /**
       * Add a tweet embed
       */
      setTweet: (options: { embedCode: string }) => ReturnType;
    };
  }
}

export const Tweet = Node.create<TweetOptions>({
  name: 'tweet',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      embedCode: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-tweet]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const div = node as HTMLElement;
          return {
            embedCode: div.getAttribute('data-embed-code'),
          };
        },
      },
    ];
  },

    renderHTML({ HTMLAttributes }) {
    const { embedCode } = HTMLAttributes;
    
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-tweet': 'true',
        'data-embed-code': embedCode,
        style: 'margin: var(--space-4) 0; display: flex; justify-content: center;',
      }),
      [
        'div',
        {
          innerHTML: embedCode,
        },
      ],
    ];
  },

  addCommands() {
    return {
      setTweet:
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
