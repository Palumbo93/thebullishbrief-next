export interface Room {
  id: string;
  name: string;
  topic: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  displayName: string;
  description: string;
  memberCount: number;
  onlineCount: number;
  sentimentScore: number;
  sentimentChange24h: number;
  isActive: boolean;
  isJoined: boolean;
  lastActivity: Date;
  moderators: string[];
  rules: string[];
  tags: string[];
  createdAt: Date;
}

export interface RoomMember {
  id: string;
  username: string;
  reputation: number;
  karma: number;
  expertise: string[];
  isVerified: boolean;
  isModerator: boolean;
  isOnline: boolean;
  lastActive: Date;
  joinDate: Date;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  sentimentScore?: number;
  parentId?: string;
  reactions: Record<string, number>;
  createdAt: Date;
  user: {
    username: string;
    reputation: number;
    isVerified: boolean;
    expertise: string[];
  };
}

export interface RoomSentiment {
  roomId: string;
  currentScore: number;
  change24h: number;
  distribution: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
  topInfluencers: string[];
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: Date;
}

export type RoomType = 'topic' | 'sentiment' | 'hybrid' | 'custom';

export interface RoomFilters {
  topic?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  isJoined?: boolean;
  isActive?: boolean;
  search?: string;
} 