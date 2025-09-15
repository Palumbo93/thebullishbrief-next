/**
 * Home page components barrel export
 */

export { HeroSection } from './HeroSection';
export { FeaturedStoriesGrid } from './FeaturedStoriesGrid';
export { LatestNewsGrid } from './LatestNewsGrid';
export type { 
  HeroSectionProps, 
  FeaturedStoriesGridProps, 
  LatestNewsGridProps,
  HeroContent,
  HomeComponentProps
} from './types';
export { 
  formatMetadata, 
  shouldShowDate, 
  isBrief, 
  getAuthorDisplay,
  generateMetadata 
} from './types';
