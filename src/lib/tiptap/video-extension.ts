import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      /**
       * Add a video
       */
      setVideo: (options: { src: string; title?: string; width?: string; height?: string; controls?: boolean; autoplay?: boolean; muted?: boolean; loop?: boolean }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',

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
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
      controls: {
        default: true,
      },
      autoplay: {
        default: false,
      },
      muted: {
        default: false,
      },
      loop: {
        default: false,
      },
      poster: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const video = node as HTMLElement;
          return {
            src: video.getAttribute('src'),
            controls: video.hasAttribute('controls'),
            autoplay: video.hasAttribute('autoplay'),
            muted: video.hasAttribute('muted'),
            loop: video.hasAttribute('loop'),
            width: video.style.width || '100%',
            height: video.style.height || 'auto',
          };
        },
      },
      {
        tag: 'div[data-video]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const div = node as HTMLElement;
          const video = div.querySelector('video');
          const iframe = div.querySelector('iframe');
          
          if (video) {
            return {
              src: video.getAttribute('src'),
              controls: video.hasAttribute('controls'),
              autoplay: video.hasAttribute('autoplay'),
              muted: video.hasAttribute('muted'),
              loop: video.hasAttribute('loop'),
              poster: video.getAttribute('poster'),
              width: div.style.width || '100%',
              height: div.style.height || 'auto',
            };
          }
          
          if (iframe) {
            const src = iframe.getAttribute('src');
            if (src?.includes('youtube.com/embed/')) {
              const videoId = src.match(/embed\/([^?]+)/)?.[1];
              return {
                src: `https://www.youtube.com/watch?v=${videoId}`,
                width: div.style.width || '100%',
                height: div.style.height || '400px',
              };
            }
            if (src?.includes('vimeo.com/video/')) {
              const videoId = src.match(/video\/(\d+)/)?.[1];
              return {
                src: `https://vimeo.com/${videoId}`,
                width: div.style.width || '100%',
                height: div.style.height || '400px',
              };
            }
          }
          
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, title, width, height, controls, autoplay, muted, loop, poster } = HTMLAttributes;
    
    // Check if it's a YouTube URL
    const youtubeMatch = src?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, {
          'data-video': 'youtube',
          style: `width: ${width}; height: ${height}; max-width: 100%;`,
        }),
        [
          'iframe',
          {
            src: embedUrl,
            width: '100%',
            height: '100%',
            frameborder: '0',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowfullscreen: true,
            title: title || 'YouTube video',
            style: 'border-radius: var(--radius-lg);',
          },
        ],
      ];
    }
    
    // Check if it's a Vimeo URL
    const vimeoMatch = src?.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, {
          'data-video': 'vimeo',
          style: `width: ${width}; height: ${height}; max-width: 100%;`,
        }),
        [
          'iframe',
          {
            src: embedUrl,
            width: '100%',
            height: '100%',
            frameborder: '0',
            allow: 'autoplay; fullscreen; picture-in-picture',
            allowfullscreen: true,
            title: title || 'Vimeo video',
            style: 'border-radius: var(--radius-lg);',
          },
        ],
      ];
    }
    
    // Direct video file
    const videoAttributes: Record<string, any> = {
      src,
      style: 'width: 100%; height: 100%; border-radius: var(--radius-lg);',
      playsinline: 'playsinline', // Prevent fullscreen on mobile
      'webkit-playsinline': 'webkit-playsinline', // iOS Safari support
    };

    // Only add attributes if they are true
    if (poster) videoAttributes.poster = poster;
    if (controls) videoAttributes.controls = 'controls';
    if (autoplay) {
      videoAttributes.autoplay = 'autoplay';
      videoAttributes.muted = 'muted'; // Always mute autoplay videos for browser compliance
    } else if (muted) {
      videoAttributes.muted = 'muted';
    }
    if (loop) videoAttributes.loop = 'loop';

    const videoElement = [
      'video',
      mergeAttributes(this.options.HTMLAttributes, videoAttributes),
    ];

    // Add play button overlay if controls are enabled
    if (controls) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, {
          'data-video': 'direct',
          style: `width: ${width}; height: ${height}; max-width: 100%; position: relative;`,
        }),
        videoElement,
        [
          'div',
          {
            class: 'play-button-overlay',
            style: `
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 80px;
              height: 80px;
              background: rgba(0, 0, 0, 0.7);
              border-radius: 50%;
              z-index: 10;
              pointer-events: none;
              transition: all var(--transition-base);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
            `,
          },
          '▶',
        ],
      ];
    }

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, {
        'data-video': 'direct',
        style: `width: ${width}; height: ${height}; max-width: 100%;`,
      }),
      videoElement,
    ];
  },

  addCommands() {
    return {
      setVideo:
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
