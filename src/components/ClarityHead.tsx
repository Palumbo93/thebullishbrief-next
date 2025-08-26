/**
 * Microsoft Clarity Head Script
 * Conditionally loads Clarity script in <head> for brief pages only
 */

'use client';

import { usePathname } from 'next/navigation';
import Head from 'next/head';

export function ClarityHead() {
  const pathname = usePathname();
  
  // Only load on brief pages
  const isBriefPage = pathname?.startsWith('/briefs/');
  
  if (!isBriefPage) {
    return null;
  }

  return (
    <Head>
      <script
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "t0h9wf1q4x");
          `
        }}
      />
    </Head>
  );
}
