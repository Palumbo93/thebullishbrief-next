import { processContentWithWidgets, contentHasWidgets, removeWidgetMarkers } from '../contentProcessor';
import { Brief } from '../../lib/database.aliases';

// Mock brief data for testing
const mockBrief: Brief = {
  id: 'test-123',
  title: 'Test Brief',
  slug: 'test-brief',
  content: 'Test content',
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tickers: null,
  view_count: 0,
  reading_time_minutes: 5,
  sponsored: false,
  show_cta: false,
  featured: false,
  subtitle: null,
  disclaimer: null,
  featured_image_url: null,
  featured_image_alt: null,
  video_url: null,
  widget_code: null,
  investor_deck_url: null,
  company_name: 'Test Company',
  company_logo_url: null,
  published_at: null,
  feature_featured_video: false,
  featured_video_thumbnail: null,
  video_thumbnail_url: null,
  popup_copy: null,
  popup_featured_image: null,
  mailchimp_audience_tag: null,

};

describe('contentProcessor', () => {
  describe('contentHasWidgets', () => {
    it('should return true when content contains INSERT_CTA_BLOCK', () => {
      const content = '<p>Some content</p>{INSERT_CTA_BLOCK}<p>More content</p>';
      expect(contentHasWidgets(content)).toBe(true);
    });

    it('should return false when content does not contain INSERT_CTA_BLOCK', () => {
      const content = '<p>Some content without widgets</p>';
      expect(contentHasWidgets(content)).toBe(false);
    });
  });

  describe('processContentWithWidgets', () => {
    it('should split content correctly with single INSERT_CTA_BLOCK', () => {
      const content = '<p>Before CTA</p>{INSERT_CTA_BLOCK}<p>After CTA</p>';
      const result = processContentWithWidgets(content, { brief: mockBrief });

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('html');
      expect(result[0].content).toBe('<p>Before CTA</p>');
      expect(result[1].type).toBe('component');
      expect(result[2].type).toBe('html');
      expect(result[2].content).toBe('<p>After CTA</p>');
    });

    it('should handle multiple INSERT_CTA_BLOCK markers', () => {
      const content = '<p>Part 1</p>{INSERT_CTA_BLOCK}<p>Part 2</p>{INSERT_CTA_BLOCK}<p>Part 3</p>';
      const result = processContentWithWidgets(content, { brief: mockBrief });

      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('html');
      expect(result[1].type).toBe('component');
      expect(result[2].type).toBe('html');
      expect(result[3].type).toBe('component');
      expect(result[4].type).toBe('html');
    });

    it('should handle content without INSERT_CTA_BLOCK markers', () => {
      const content = '<p>Just regular content</p>';
      const result = processContentWithWidgets(content, { brief: mockBrief });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('html');
      expect(result[0].content).toBe('<p>Just regular content</p>');
    });

    it('should skip empty segments', () => {
      const content = '{INSERT_CTA_BLOCK}<p>Only content after</p>';
      const result = processContentWithWidgets(content, { brief: mockBrief });

      // Should only have the content after CTA, not an empty segment before
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('html');
      expect(result[0].content).toBe('<p>Only content after</p>');
    });
  });

  describe('removeWidgetMarkers', () => {
    it('should remove single INSERT_CTA_BLOCK marker', () => {
      const content = '<p>Before</p>{INSERT_CTA_BLOCK}<p>After</p>';
      const result = removeWidgetMarkers(content);
      expect(result).toBe('<p>Before</p><p>After</p>');
    });

    it('should remove multiple INSERT_CTA_BLOCK markers', () => {
      const content = '<p>Part 1</p>{INSERT_CTA_BLOCK}<p>Part 2</p>{INSERT_CTA_BLOCK}<p>Part 3</p>';
      const result = removeWidgetMarkers(content);
      expect(result).toBe('<p>Part 1</p><p>Part 2</p><p>Part 3</p>');
    });

    it('should return unchanged content when no markers present', () => {
      const content = '<p>No markers here</p>';
      const result = removeWidgetMarkers(content);
      expect(result).toBe('<p>No markers here</p>');
    });

    it('should handle empty content', () => {
      const result = removeWidgetMarkers('');
      expect(result).toBe('');
    });
  });
});
