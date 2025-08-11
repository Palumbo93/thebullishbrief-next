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
      <div className="bg-secondary rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-info rounded-full flex items-center justify-center">
            <Brain className="w-3 h-3 text-inverse" />
          </div>
          <h4 className="text-sm font-medium text-primary">Market Summary</h4>
        </div>
        <p className="text-secondary leading-relaxed text-sm">
          {summary}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-inverse" />
          </div>
          <h4 className="text-sm font-medium text-primary">Top Tweets</h4>
          <span className="text-xs text-muted bg-tertiary px-2 py-1 rounded-full">{topTweets.length} tweets</span>
        </div>
        
        {topTweets.map((tweet, index) => (
          <div key={tweet.id} className="bg-secondary rounded-lg p-3 hover:bg-tertiary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-tertiary rounded-full flex items-center justify-center text-xs font-medium text-primary">
                  {tweet.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className="text-sm font-medium text-primary">{tweet.author}</span>
                  <span className="text-xs text-muted ml-1">{tweet.handle}</span>
                </div>
              </div>
              <span className="text-xs text-muted bg-tertiary px-2 py-1 rounded-full">{tweet.timestamp}</span>
            </div>
            <p className="text-sm text-secondary mb-3 leading-relaxed">{tweet.content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-muted">
                <div className="flex items-center space-x-1">
                  <span className="text-error">❤️</span>
                  <span>{tweet.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-info">🔄</span>
                  <span>{tweet.retweets.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-xs text-muted bg-tertiary px-2 py-1 rounded-full">
                {tweet.likes > 1000 ? '🔥 Hot' : 'Trending'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Powered By Section */}
      <div className="mt-8">
        <div className="flex items-center justify-center space-x-2 -mt-5">
          <span className="text-xs text-muted">Powered By</span>
          <img 
            src="/images/sentrol-logo.webp" 
            alt="Sentrol" 
            className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity -mt-1"
          />
        </div>
      </div>
    </>
  );
}; 