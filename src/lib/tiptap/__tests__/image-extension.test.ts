import { Image } from '../image-extension';

describe('Image Extension', () => {
  describe('renderHTML', () => {
    it('should render image without figcaption when figcaption is not provided', () => {
      const extension = Image.create();
      const result = extension.renderHTML({
        HTMLAttributes: {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          title: 'Test title'
        }
      });

      expect(result).toEqual([
        'img',
        {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          title: 'Test title',
          width: undefined,
          height: undefined,
          style: expect.stringContaining('max-width: 100%'),
          loading: 'lazy'
        }
      ]);
    });

    it('should render figure with figcaption when figcaption is provided', () => {
      const extension = Image.create();
      const result = extension.renderHTML({
        HTMLAttributes: {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          title: 'Test title',
          figcaption: 'This is a test caption'
        }
      });

      expect(result).toEqual([
        'figure',
        {
          style: expect.stringContaining('margin: var(--space-4) 0')
        },
        [
          'img',
          {
            src: 'https://example.com/image.jpg',
            alt: 'Test image',
            title: 'Test title',
            width: undefined,
            height: undefined,
            style: expect.stringContaining('max-width: 100%'),
            loading: 'lazy'
          }
        ],
        [
          'figcaption',
          {
            style: expect.stringContaining('font-size: var(--text-sm)')
          },
          'This is a test caption'
        ]
      ]);
    });

    it('should handle empty figcaption gracefully', () => {
      const extension = Image.create();
      const result = extension.renderHTML({
        HTMLAttributes: {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          figcaption: ''
        }
      });

      // Should render as regular image without figure wrapper
      expect(result).toEqual([
        'img',
        {
          src: 'https://example.com/image.jpg',
          alt: 'Test image',
          title: '',
          width: undefined,
          height: undefined,
          style: expect.stringContaining('max-width: 100%'),
          loading: 'lazy'
        }
      ]);
    });
  });

  describe('parseHTML', () => {
    it('should parse figure with figcaption correctly', () => {
      const extension = Image.create();
      const figureElement = document.createElement('figure');
      const imgElement = document.createElement('img');
      const figcaptionElement = document.createElement('figcaption');
      
      imgElement.setAttribute('src', 'https://example.com/image.jpg');
      imgElement.setAttribute('alt', 'Test image');
      figcaptionElement.textContent = 'Test caption';
      
      figureElement.appendChild(imgElement);
      figureElement.appendChild(figcaptionElement);

      const parseRules = extension.parseHTML();
      const figureRule = parseRules.find(rule => rule.tag === 'figure');
      
      expect(figureRule).toBeDefined();
      
      const attrs = figureRule?.getAttrs?.(figureElement);
      expect(attrs).toEqual({
        src: 'https://example.com/image.jpg',
        alt: 'Test image',
        title: null,
        figcaption: 'Test caption',
        width: null,
        height: null
      });
    });

    it('should parse regular img element correctly', () => {
      const extension = Image.create();
      const imgElement = document.createElement('img');
      imgElement.setAttribute('src', 'https://example.com/image.jpg');
      imgElement.setAttribute('alt', 'Test image');
      imgElement.setAttribute('title', 'Test title');

      const parseRules = extension.parseHTML();
      const imgRule = parseRules.find(rule => rule.tag === 'img');
      
      expect(imgRule).toBeDefined();
      
      const attrs = imgRule?.getAttrs?.(imgElement);
      expect(attrs).toEqual({
        src: 'https://example.com/image.jpg',
        alt: 'Test image',
        title: 'Test title',
        width: null,
        height: null
      });
    });
  });
});
