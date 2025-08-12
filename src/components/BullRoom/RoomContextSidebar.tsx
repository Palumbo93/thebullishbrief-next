import React from 'react';
import { Brain, MessageSquare } from 'lucide-react';

/**
 * RoomContextSidebar shows market summary and top tweets for the current room.
 * @param summary - Market summary string.
 * @param topTweets - Array of top tweet objects.
 */
export interface TopTweet {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
}

export interface RoomContextSidebarProps {
  summary: string;
  topTweets: TopTweet[];
}

export const RoomContextSidebar: React.FC<RoomContextSidebarProps> = ({ summary, topTweets }) => {
  return (
    <>
      <div style={{
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'var(--color-info)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain style={{ width: '12px', height: '12px', color: 'var(--color-text-inverse)' }} />
          </div>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)'
          }}>Market Summary</h4>
        </div>
        <p style={{
          color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
          fontSize: 'var(--text-sm)'
        }}>
          {summary}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            background: 'var(--color-success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare style={{ width: '12px', height: '12px', color: 'var(--color-text-inverse)' }} />
          </div>
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--color-text-primary)'
          }}>Top Tweets</h4>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-tertiary)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: '9999px'
          }}>{topTweets.length} tweets</span>
        </div>
        
        {topTweets.map((tweet, index) => (
          <div key={tweet.id} style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3)',
            transition: 'background-color 0.2s ease'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-secondary)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  {tweet.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)'
                  }}>{tweet.author}</span>
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    marginLeft: 'var(--space-1)'
                  }}>{tweet.handle}</span>
                </div>
              </div>
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-tertiary)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: '9999px'
              }}>{tweet.timestamp}</span>
            </div>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-3)',
              lineHeight: 'var(--leading-relaxed)'
            }}>{tweet.content}</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}>
                  <span style={{ color: 'var(--color-error)' }}>❤️</span>
                  <span>{tweet.likes.toLocaleString()}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)'
                }}>
                  <span style={{ color: 'var(--color-info)' }}>🔄</span>
                  <span>{tweet.retweets.toLocaleString()}</span>
                </div>
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                background: 'var(--color-bg-tertiary)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: '9999px'
              }}>
                {tweet.likes > 1000 ? '🔥 Hot' : 'Trending'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Powered By Section */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          marginTop: 'calc(-1 * var(--space-5))'
        }}>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)'
          }}>Powered By</span>
          <img 
            src="/images/sentrol-logo.webp" 
            alt="Sentrol" 
            style={{
              height: '24px',
              width: 'auto',
              opacity: 0.7,
              marginTop: 'calc(-1 * var(--space-1))',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
          />
        </div>
      </div>
    </>
  );
}; 