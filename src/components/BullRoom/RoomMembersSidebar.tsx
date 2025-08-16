import React from 'react';
import { BullRoomMessage } from '../../lib/database.aliases';

interface RoomMember {
  id: string;
  username: string;
  message_count: number;
  bull_reactions_received: number;
  last_active: string;
}

interface RoomMembersSidebarProps {
  messages: BullRoomMessage[];
  currentUserId?: string;
}

export const RoomMembersSidebar: React.FC<RoomMembersSidebarProps> = ({ 
  messages, 
  currentUserId 
}) => {
  // Calculate members and their stats
  const calculateMembers = (): RoomMember[] => {
    const memberMap = new Map<string, RoomMember>();
    
    // Only consider messages from the last 48 hours
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    messages.forEach(message => {
      if (!message.created_at) return;
      
      const messageTime = new Date(message.created_at);
      if (messageTime < cutoffTime) return; // Skip messages older than 48 hours
      
      const userId = message.user_id;
      const existing = memberMap.get(userId);
      
      // Count bull reactions received (🐂 emoji)
      let bullReactionsReceived = 0;
      if (message.reactions && typeof message.reactions === 'object') {
        bullReactionsReceived = Object.entries(message.reactions as Record<string, any>)
          .filter(([emoji]) => emoji === '🐂')
          .reduce((total, [, userIds]) => total + (Array.isArray(userIds) ? userIds.length : 0), 0);
      }
      
      if (existing) {
        existing.message_count += 1;
        existing.bull_reactions_received += bullReactionsReceived;
        if (messageTime > new Date(existing.last_active)) {
          existing.last_active = message.created_at;
        }
      } else {
        memberMap.set(userId, {
          id: userId,
          username: message.username,
          message_count: 1,
          bull_reactions_received: bullReactionsReceived,
          last_active: message.created_at,
        });
      }
    });
    
    return Array.from(memberMap.values());
  };
  
  const members = calculateMembers();
  
  // Sort by bull reactions received (Top Bulls first), then by message count
  const sortedMembers = members.sort((a, b) => {
    if (b.bull_reactions_received !== a.bull_reactions_received) {
      return b.bull_reactions_received - a.bull_reactions_received;
    }
    return b.message_count - a.message_count;
  });
  
  const topBulls = sortedMembers.slice(0, 5);
  const otherMembers = sortedMembers.slice(5);
  
  return (
    <div style={{
      borderLeft: '0.5px solid rgba(31, 31, 31, 1)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-6)',
      height: '100%',
      overflowY: 'auto'
    }}>
      
      {/* Top Bulls Section */}
      {topBulls.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h4 style={{ 
              fontWeight: 'var(--font-medium)', 
              color: 'var(--color-text-primary)' 
            }}>Bulls of the day</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {topBulls.map((member, index) => (
              <div 
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${member.id === currentUserId 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(31, 31, 31, 0.2)'}`,
                  background: member.id === currentUserId 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(20, 20, 20, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    background: 'rgba(20, 20, 20, 0.4)',
                    borderRadius: '50%'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--color-text-primary)'
                      }}>
                        {member.username}
                      </span>
                      {index === 0 && (
                        <span style={{
                          fontSize: 'var(--text-xs)',
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'var(--color-brand-primary)',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          #1
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)'
                    }}>

                      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <span>🐂</span>
                        <span>{member.bull_reactions_received}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Other Members Section */}
      {otherMembers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h4 style={{ 
            fontWeight: 'var(--font-medium)', 
            color: 'var(--color-text-primary)' 
          }}>Other Members</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {otherMembers.map((member) => (
              <div 
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-lg)',
                  background: member.id === currentUserId 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(20, 20, 20, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    background: 'rgba(20, 20, 20, 0.4)',
                    borderRadius: '50%'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-text-primary)'
                    }}>
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {member.username}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)'
                }}>
                  <span>{member.message_count}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <span>🐂</span>
                    <span>{member.bull_reactions_received}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {members.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-8) 0' 
        }}>
          <div style={{ 
            fontSize: 'var(--text-4xl)', 
            marginBottom: 'var(--space-2)' 
          }}>🐂</div>
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: 'var(--text-sm)' 
          }}>No participants yet</p>
          <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: 'var(--text-xs)', 
            marginTop: 'var(--space-1)' 
          }}>Messages from the last 48 hours</p>
        </div>
      )}
    </div>
  );
};
