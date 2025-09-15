import { LegalDocument } from './types';

export const aboutDocument: LegalDocument = {
  slug: 'about',
  title: 'About',
  sections: [
    {
      id: 'about-the-bullish-brief',
      title: 'Our Approach',
      body: `
        <p>The Bullish Brief is a modern finance publication built for serious investors. We deliver sharp, useful insights on markets, companies, and trends. High-signal content that earns your attention.</p>
        <br />
        <p>Every article is crafted to inform and engage. We focus on clarity, honesty, and relevance while also being enjoyable to read. Whether it's a breakdown of a public company, an analysis of market sentiment, or a deep dive into macro trends, you can expect content that cuts through the noise.</p>
        <br />
        <p><strong>What makes us different?</strong><br />
        We hold a higher standard. Our work is filtered, focused, and built to last. We draw inspiration from digital platforms that value clean design and strong ideas. But we raise the bar by refusing to compromise on substance.</p>
        <br />
        <p><strong>More than articles.</strong><br />
        The Bullish Brief is also building tools, sentiment analysis, and a growing community of investors who want to go deeper.</p>
      `
    }
  ]
};
