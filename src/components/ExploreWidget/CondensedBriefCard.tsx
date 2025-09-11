import React from 'react';
import { Brief } from '../../lib/database.aliases';
import { getTickers } from '../../utils/tickerUtils';
import { CompanyLogoImage } from '../ui/OptimizedImage';

interface CondensedBriefCardProps {
  brief: Brief | null | undefined;
  onBriefClick: (briefSlug: string) => void;
  isLoading?: boolean;
}

export const CondensedBriefCard: React.FC<CondensedBriefCardProps> = ({ 
  brief, 
  onBriefClick, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div style={{
        padding: 'var(--space-3)',
        border: '0.5px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-4)'
      }}>
        <div style={{
          width: '100%',
          height: '60px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-bg-tertiary)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>
    );
  }

  if (!brief) {
    return null;
  }

  const tickers = getTickers(brief.tickers);

  return (
    <div style={{
      padding: 'var(--space-3)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-4)',
      cursor: 'pointer',
      transition: 'all var(--transition-base)'
    }}
    onClick={() => onBriefClick(brief.slug)}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--color-bg-tertiary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'var(--color-bg-secondary)';
    }}
    >
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Company Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 'var(--space-2)',
        gap: 'var(--space-2)'
      }}>
        {brief.company_logo_url ? (
          <CompanyLogoImage
            src={brief.company_logo_url}
            alt={`${brief.company_name} Logo`}
            size="sm"
          />
        ) : (
          <div style={{
            height: '24px',
            width: '24px',
            borderRadius: '50%',
            background: 'var(--color-bg-tertiary)',
            marginRight: 'var(--space-2)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)'
          }}>
            {brief.company_name?.charAt(0) || 'B'}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ 
            fontWeight: 'var(--font-semibold)', 
            color: 'var(--color-text-primary)', 
            fontSize: 'var(--text-sm)', 
            lineHeight: 1.2,
            marginBottom: '2px'
          }}>
            {brief.company_name || 'Brief'}
          </div>
          {tickers && tickers.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              flexWrap: 'wrap'
            }}>
              {tickers.slice(0, 2).map((ticker) => (
                <span
                  key={`${ticker.exchange}-${ticker.symbol}`}
                  style={{
                    background: 'var(--color-bg-tertiary)',
                    padding: '1px 4px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  {ticker.symbol}
                </span>
              ))}
              {tickers.length > 2 && (
                <span style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)'
                }}>
                  +{tickers.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
        {/* Sponsored Badge */}
        {brief.sponsored && (
        <div style={{
          background: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-medium)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-full)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 'var(--space-2)',
          width: 'fit-content'
        }}>
          Sponsored
        </div>
      )}
      </div>

      {/* Title */}
      <h3 style={{
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-2)',
        fontWeight: 'var(--font-semibold)',
        overflow: 'hidden'
      }}>
        {brief.title}
      </h3>

      {/* Continue Reading */}
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        fontWeight: 'var(--font-medium)'
      }}>
        Continue Reading →
      </div>
    </div>
  );
};
