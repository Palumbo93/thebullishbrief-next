import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useTrackBriefEngagement } from '../hooks/useClarityAnalytics';
import brokerageConfig from '../data/brokerageConfig.json';

interface BrokerageWidgetProps {
  brokerageLinks: BrokerageLinksData | null;
  className?: string;
  briefId?: string;
  briefTitle?: string;
  location?: 'action_panel' | 'inline';
  // Country context (passed from parent)
  country?: string;
  countryLoading?: boolean;
  geolocationError?: string | null;
}

interface BrokerageLinksData {
  [brokerageId: string]: string; // brokerage id -> direct link
}

interface BrokerageConfig {
  id: string;
  name: string;
  logoUrl: string;
  logoUrlDark?: string;
}



const BrokerageWidget: React.FC<BrokerageWidgetProps> = ({ 
  brokerageLinks, 
  className = '',
  briefId,
  briefTitle,
  location = 'action_panel',
  country: propCountry,
  countryLoading: propCountryLoading,
  geolocationError: propGeolocationError
}) => {
  const { theme } = useTheme();
  const { trackBrokerageClick } = useTrackBriefEngagement();
  
  // Use props for country context, with fallback defaults
  const country = propCountry || 'CA';
  const loading = propCountryLoading || false;
  const geolocationError = propGeolocationError || null;
  

  
  if (!brokerageLinks || Object.keys(brokerageLinks).length === 0) {
    return null;
  }

  // Get brokerages for the detected country
  const countryBrokerages = brokerageConfig.brokerages[country as keyof typeof brokerageConfig.brokerages] || brokerageConfig.brokerages.CA;
  
  // Get available brokerages that have links, maintaining order from config
  const availableBrokerages = countryBrokerages
    .map(config => {
      const url = brokerageLinks[config.id];
      return url ? { config, url } : null;
    })
    .filter(Boolean) as Array<{ config: BrokerageConfig; url: string }>;

  if (availableBrokerages.length === 0) {
    return null;
  }

  // Show loading state while fetching geolocation
  if (loading) {
    return (
      <div className={`brokerage-widget brokerage-widget-isolated ${className}`}>
        <h3 className="brokerage-section-title">Quick Links To Preferred Brokerages</h3>
        <div className="brokerage-loading">
          <div className="brokerage-loading-spinner"></div>
          <p>Loading brokerages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`brokerage-widget brokerage-widget-isolated ${className}`}>
      <h3 className="brokerage-section-title">
        Quick Links To Preferred Brokerages
        {geolocationError && (
          <span className="geolocation-error"> (Showing {country === 'US' ? 'US' : 'Canadian'} brokerages)</span>
        )}
      </h3>
      
      <div className="brokerage-grid">
        {availableBrokerages.map(({ config, url }) => (
          <a
            key={config.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="brokerage-item"
            aria-label={`View on ${config.name}`}
            onClick={() => {
              if (briefId && briefTitle) {
                trackBrokerageClick(briefId, briefTitle, config.name, config.id, location);
              }
            }}
          >
            <div className="brokerage-logo-container">
              <img
                src={theme === 'dark' && config.logoUrlDark ? config.logoUrlDark : config.logoUrl}
                alt={`${config.name} logo`}
                className="brokerage-logo"
                loading="lazy"
              />
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .brokerage-widget {
          padding: 2rem 1.5rem;
          border-top: 0.5px solid var(--color-border-primary);
        }

        .brokerage-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 1rem 0;
          letter-spacing: 0.02em;
        }

        .geolocation-error {
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--color-text-secondary);
          font-style: italic;
        }

        .brokerage-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: var(--color-text-secondary);
        }

        .brokerage-loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--color-border-primary);
          border-top: 2px solid var(--color-brand-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .brokerage-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
        }

        .brokerage-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 0.5px solid var(--color-border-primary);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          text-decoration: none;
          position: relative;
          aspect-ratio: 1;
          min-height: 80px;
        }

        .brokerage-item:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .brokerage-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brokerage-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 4px;
        }

        .brokerage-item:hover .brokerage-external-icon {
          opacity: 1;
          color: var(--color-brand-primary);
        }

        .brokerage-item:hover .brokerage-name {
          color: var(--color-text-primary);
        }

        /* Override html-content styles that interfere with brokerage widget */
        .brokerage-widget-isolated .brokerage-logo {
          margin: 0 !important;
          opacity: 1 !important;
          transition: none !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
        .brokerage-widget {
          padding: 1rem var(--container-padding);
          border-top: 0.5px solid var(--color-border-primary);
        }
          
          .brokerage-grid {
            gap: 2px;
          }
          
          .brokerage-item {
            min-height: 70px;
          }
        }
      `}</style>
    </div>
  );
};

export default BrokerageWidget;
