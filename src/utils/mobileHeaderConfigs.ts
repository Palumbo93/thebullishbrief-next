import { Search, Bookmark, Share } from 'lucide-react';

// Define the types for mobile header configuration
export interface MobileHeaderAction {
  type: 'search' | 'bookmark' | 'share' | 'comment' | 'more';
  onClick: () => void;
  active?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export interface MobileHeaderConfig {
  leftSection: {
    showMenu: boolean;
    logo?: {
      type: 'main' | 'company';
      src?: string;
      alt?: string;
      fallback?: string;
      onClick?: () => void;
    };
    branding?: {
      companyName?: string;
      tickers?: string[];
      onClick?: () => void;
    };
  };
  centerSection?: {
    typeLogo?: {
      size?: 'sm' | 'md' | 'lg';
      onClick?: () => void;
    };
  };
  rightSection: {
    actions: MobileHeaderAction[];
  };
  onMenuClick: () => void;
}

// Configuration factory for different page types
export interface MobileHeaderFactoryProps {
  // Common props
  onMenuClick: () => void;
  onSearchClick?: (path?: string) => void;
  
  // Article page specific
  isBookmarked?: boolean;
  onBookmarkClick?: () => void;
  onShareClick?: () => void;
  bookmarkLoading?: boolean;
  onCommentClick?: () => void;
  commentsActive?: boolean;
  
  // Brief page specific
  companyName?: string;
  tickers?: any; // JSON ticker data from database
  onMoreClick?: () => void;
  moreActive?: boolean;
  
  // Navigation
  onLogoClick?: () => void;
}

/**
 * Factory functions for creating mobile header configurations for different page types
 */
export const createMobileHeaderConfig = {
  // Home Page: Menu | Type Logo | Search Icon
  home: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: props.onSearchClick ? [{
        type: 'search',
        onClick: () => props.onSearchClick?.('/search?focus=true')
      }] : []
    },
    onMenuClick: props.onMenuClick
  }),

  // Search Page: Menu | Type Logo | (no search icon)
  search: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: [] // No search icon since we're already on search page
    },
    onMenuClick: props.onMenuClick
  }),

  // Article Page: Menu | Type Logo | Comment, Bookmark, Share
  article: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: [
        ...(props.onShareClick ? [{
          type: 'share' as const,
          onClick: props.onShareClick
        }] : []),
        ...(props.onBookmarkClick ? [{
          type: 'bookmark' as const,
          onClick: props.onBookmarkClick,
          active: props.isBookmarked,
          loading: props.bookmarkLoading
        }] : []),
        ...(props.onCommentClick ? [{
          type: 'comment' as const,
          onClick: props.onCommentClick,
          active: props.commentsActive
        }] : [])
      ]
    },
    onMenuClick: props.onMenuClick
  }),

  // Brief Page: Menu | Type Logo | More, Share
  brief: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: [
        ...(props.onShareClick ? [{
          type: 'share' as const,
          onClick: props.onShareClick
        }] : []),
        ...(props.onMoreClick ? [{
          type: 'more' as const,
          onClick: props.onMoreClick,
          active: props.moreActive
        }] : [])
      ]
    },
    onMenuClick: props.onMenuClick
  }),

  // Author Page: Menu | Type Logo | Share
  author: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: props.onShareClick ? [{
        type: 'share',
        onClick: props.onShareClick
      }] : []
    },
    onMenuClick: props.onMenuClick
  }),

  // Bookmarks Page: Menu | Type Logo | Search
  bookmarks: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: props.onSearchClick ? [{
        type: 'search',
        onClick: () => props.onSearchClick?.('/search?focus=true')
      }] : []
    },
    onMenuClick: props.onMenuClick
  }),

  // Account Settings: Menu | Type Logo | (no actions)
  accountSettings: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: []
    },
    onMenuClick: props.onMenuClick
  }),

  // Default fallback configuration
  default: (props: MobileHeaderFactoryProps): MobileHeaderConfig => ({
    leftSection: {
      showMenu: true
    },
    centerSection: {
      typeLogo: {
        size: 'md',
        onClick: props.onLogoClick
      }
    },
    rightSection: {
      actions: []
    },
    onMenuClick: props.onMenuClick
  })
};

/**
 * Helper function to determine which configuration to use based on route
 */
export const getMobileHeaderConfigForRoute = (
  pathname: string,
  props: MobileHeaderFactoryProps
): MobileHeaderConfig => {
  // Article pages
  if (pathname.startsWith('/articles/')) {
    return createMobileHeaderConfig.article(props);
  }
  
  // Brief pages
  if (pathname.startsWith('/briefs/')) {
    return createMobileHeaderConfig.brief(props);
  }
  
  // Author pages
  if (pathname.startsWith('/authors/')) {
    return createMobileHeaderConfig.author(props);
  }
  
  // Specific pages
  switch (pathname) {
    case '/':
      return createMobileHeaderConfig.home(props);
    case '/search':
    case '/explore':
      return createMobileHeaderConfig.search(props);
    case '/bookmarks':
      return createMobileHeaderConfig.bookmarks(props);
    case '/account-settings':
      return createMobileHeaderConfig.accountSettings(props);
    default:
      return createMobileHeaderConfig.default(props);
  }
};
