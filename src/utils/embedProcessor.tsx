import React from 'react';
import { createRoot } from 'react-dom/client';
import { EmbedRenderer } from '../components/embeds/EmbedRenderer';

/**
 * Process embed containers in article/brief content and render them using React components
 */
export function processEmbedContainers(container: HTMLElement): void {
  // Find all embed containers
  const embedContainers = container.querySelectorAll('[data-embed="true"], .embed-container, [data-embed-content]');
  
  embedContainers.forEach((embedContainer) => {
    const element = embedContainer as HTMLElement;
    
    // Skip if already processed
    if (element.hasAttribute('data-embed-processed')) {
      return;
    }
    
    // Extract embed data from attributes
    const content = element.getAttribute('data-embed-content') || '';
    const title = element.getAttribute('data-embed-title') || '';
    const width = element.getAttribute('data-embed-width') || '100%';
    const height = element.getAttribute('data-embed-height') || 'auto';
    const type = element.getAttribute('data-embed-type') as 'iframe' | 'script' | 'html' || 'html';
    
    // Only process if we have content
    if (!content) {
      return;
    }
    
    // Mark as processed to prevent re-processing
    element.setAttribute('data-embed-processed', 'true');
    
    // Clear the element and create a React root
    element.innerHTML = '';
    const root = createRoot(element);
    
    // Render the EmbedRenderer component
    root.render(
      <EmbedRenderer
        content={content}
        title={title}
        width={width}
        height={height}
        type={type}
      />
    );
  });
}
