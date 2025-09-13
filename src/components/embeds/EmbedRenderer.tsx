import React, { useEffect, useRef } from 'react';

interface EmbedRendererProps {
  content: string;
  title?: string;
  width?: string;
  height?: string;
  type?: 'iframe' | 'script' | 'html';
}

export const EmbedRenderer: React.FC<EmbedRendererProps> = ({
  content,
  title,
  width = '100%',
  height = 'auto',
  type = 'html'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    const container = containerRef.current;
    
    // Clear any existing content
    container.innerHTML = '';
    
    try {
      // Decode HTML entities if needed
      const decodedContent = content
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = decodedContent;
      
      // Handle script tags specially
      const scripts = tempDiv.querySelectorAll('script');
      const hasScripts = scripts.length > 0;
      
      if (hasScripts) {
        // For content with scripts, we need to handle them carefully
        
        // First, add all non-script content
        const clonedDiv = tempDiv.cloneNode(true) as HTMLElement;
        const clonedScripts = clonedDiv.querySelectorAll('script');
        clonedScripts.forEach(script => script.remove());
        
        container.innerHTML = clonedDiv.innerHTML;
        
        // Then, recreate and execute scripts
        scripts.forEach((script) => {
          // Skip if already executed
          if (script.hasAttribute('data-executed')) return;
          
          const newScript = document.createElement('script');
          
          // Copy all attributes
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Mark as executed to prevent re-execution
          newScript.setAttribute('data-executed', 'true');
          
          // Copy script content
          if (script.src) {
            // External script
            newScript.src = script.src;
          } else {
            // Inline script
            newScript.textContent = script.textContent;
          }
          
          // Append to container to execute
          container.appendChild(newScript);
        });
      } else {
        // No scripts, just set the content directly
        container.innerHTML = decodedContent;
      }
    } catch (error) {
      console.error('Error rendering embed:', error);
      container.innerHTML = ``;
    }
  }, [content]);

  if (!content) {
    return (
      <div></div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        maxWidth: '100%',
        position: 'relative'
      }}
    />
  );
};
