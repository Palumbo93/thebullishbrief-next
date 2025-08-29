import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import brokerageConfig from '../data/brokerageConfig.json';

interface BrokerageWidgetProps {
  brokerageLinks: BrokerageLinksData | null;
  className?: string;
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
  className = '' 
}) => {
  const { theme } = useTheme();
  
  if (!brokerageLinks || Object.keys(brokerageLinks).length === 0) {
    return null;
  }

  // Get available brokerages that have links
  const availableBrokerages = Object.keys(brokerageLinks)
    .map(brokerageId => {
      const config = brokerageConfig.brokerages.find(b => b.id === brokerageId);
      const url = brokerageLinks[brokerageId];
      return config ? { config, url } : null;
    })
    .filter(Boolean) as Array<{ config: BrokerageConfig; url: string }>;

  if (availableBrokerages.length === 0) {
    return null;
  }

  return (
    <div className={`brokerage-widget ${className}`}>
      <h3 className="brokerage-section-title">Quick Links To Preferred Brokerages</h3>
      
      <div className="brokerage-grid">
        {availableBrokerages.map(({ config, url }) => (
          <a
            key={config.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="brokerage-item"
            aria-label={`View on ${config.name}`}
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
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          text-decoration: none;
          position: relative;
          aspect-ratio: 1;
          min-height: 80px;
          border: 0.5px solid var(--color-border-primary);
        }

        .brokerage-item:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .brokerage-logo-container {
          width: 100%;
          height: 100%;
          align-items: center;
          justify-content: center;
        }

        .brokerage-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }


        .brokerage-item:hover .brokerage-external-icon {
          opacity: 1;
          color: var(--color-brand-primary);
        }

        .brokerage-item:hover .brokerage-name {
          color: var(--color-text-primary);
        }

        /* Mobile responsiveness */
        @media (max-width: 480px) {
          .brokerage-grid {
            gap: 0.5rem;
          }
          
          .brokerage-item {
            padding: 0.75rem;
            min-height: 70px;
          }
          
          .brokerage-logo-container {
            width: 28px;
            height: 28px;
            margin-bottom: 0.375rem;
          }
          
          .brokerage-name {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BrokerageWidget;
