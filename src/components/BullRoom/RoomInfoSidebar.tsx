import React, { useState } from 'react';
import { Hash, Info, Users } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { UserRow } from '../ui/UserRow';
import { UserProfilePopUp } from '../ui/UserProfilePopUp';
import { useTheme } from '../../contexts/ThemeContext';

interface RoomInfoSidebarProps {
  room: BullRoom;
  messages: BullRoomMessage[];
}

export const RoomInfoSidebar: React.FC<RoomInfoSidebarProps> = ({ room, messages }) => {
  const { theme } = useTheme();
  const [selectedUser, setSelectedUser] = useState<{
    userId: string;
    username: string;
    profile_image?: string | null;
  } | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | undefined>();

  // Use design system variables instead of hardcoded colors


  // Calculate active members from messages
  const calculateActiveMembers = () => {
    const memberMap = new Map<string, { 
      userId: string;
      username: string; 
      lastActive: string;
      profile_image?: string | null;
    }>();
    
    // Only consider messages from the last 48 hours
    const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    messages.forEach(message => {
      if (!message.created_at) return;
      
      const messageTime = new Date(message.created_at);
      if (messageTime < cutoffTime) return; // Skip messages older than 48 hours
      
      const userId = message.user_id;
      const existing = memberMap.get(userId);
      
      if (existing) {
        if (messageTime > new Date(existing.lastActive)) {
          existing.lastActive = message.created_at;
        }
      } else {
        memberMap.set(userId, {
          userId: message.user_id,
          username: message.username,
          lastActive: message.created_at,
          profile_image: message.user?.profile_image || null,
        });
      }
    });
    
    return Array.from(memberMap.values())
      .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
      .slice(0, 5); // Show top 5 active members
  };
  
  const activeMembers = calculateActiveMembers();

  const handleUserClick = (event: React.MouseEvent, member: any) => {
    event.preventDefault();
    setSelectedUser({
      userId: member.userId,
      username: member.username,
      profile_image: member.profile_image
    });
    setPopupPosition({ x: event.clientX, y: event.clientY });
  };

  const handleClosePopup = () => {
    setSelectedUser(null);
    setPopupPosition(undefined);
  };

  return (
    <div style={{
      borderLeft: '0.5px solid var(--color-border-primary)',
      position: 'relative',
      height: '100%'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        overflowY: 'auto',
      }} className="hide-scrollbar">
      
      {/* Room Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h3 style={{ 
          fontWeight: 'var(--font-normal)', 
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-lg)',
          fontFamily: 'var(--font-editorial)'
        }}>{room.name}</h3>
        
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--leading-relaxed)',
          margin: 0
        }}>
          {room.topic}
        </p>
      </div>

      {/* Room Description */}
      {room.description && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Info style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
            <h4 style={{ 
              fontWeight: 'var(--font-normal)', 
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-editorial)'
            }}>About</h4>
          </div>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-relaxed)',
            margin: 0
          }}>
            {room.description}
          </p>
        </div>
      )}

      {/* Room Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <h4 style={{ 
          fontWeight: 'var(--font-normal)', 
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-editorial)'
        }}>Room Rules</h4>
        <div style={{
        }}>
          {room.rules && Array.isArray(room.rules) && room.rules.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)'
            }}>
              {room.rules.map((rule: any, index: number) => {
                // Handle different rule formats
                let ruleNumber = index + 1;
                let ruleTitle = '';
                let ruleDescription = '';

                if (typeof rule === 'string') {
                  // Legacy string format
                  ruleTitle = `Rule ${ruleNumber}`;
                  ruleDescription = rule;
                } else if (rule && typeof rule === 'object' && 'title' in rule && 'description' in rule) {
                  // New structured format
                  ruleNumber = (rule as any).number || index + 1;
                  ruleTitle = (rule as any).title || `Rule ${ruleNumber}`;
                  ruleDescription = (rule as any).description || '';
                } else {
                  // Fallback for unknown format
                  ruleTitle = `Rule ${ruleNumber}`;
                  ruleDescription = JSON.stringify(rule);
                }

                return (
                  <div key={index} style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '0.5px solid var(--color-border-primary)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)',
                        fontWeight: 'var(--font-medium)',
                        minWidth: '16px'
                      }}>
                        {ruleNumber}.
                      </span>
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 'var(--font-medium)'
                      }}>
                        {ruleTitle}
                      </span>
                    </div>
                    <div style={{
                      paddingLeft: 'calc(16px + var(--space-2))'
                    }}>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: 'var(--leading-relaxed)'
                      }}>
                        {ruleDescription}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--leading-relaxed)',
              margin: 0
            }}>
              No specific rules set for this room.
            </p>
          )}
        </div>
      </div>



      {/* Active Members */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h4 style={{ 
          fontWeight: 'var(--font-normal)', 
          color: 'var(--color-text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-editorial)'
        }}>Active Members</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {activeMembers.length > 0 ? (
            activeMembers.map((member, index) => (
                              <UserRow
                  key={member.username}
                  user={{
                    userId: member.userId,
                    username: member.username,
                    profile_image: member.profile_image
                  }}
                  onClick={handleUserClick}
                  size="sm"
                  showMessageCount={false}
                />
            ))
          ) : (
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: '0.5px solid var(--color-border-primary)',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                margin: 0
              }}>
                No active members
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fine Print */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid var(--color-border-secondary)'
      }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          lineHeight: 'var(--leading-relaxed)',
          margin: 0,
          textAlign: 'center'
        }}>
          Messages disappear after 48 hours
        </p>
      </div>

      {/* User Profile Popup */}
      {selectedUser && (
        <UserProfilePopUp
          userId={selectedUser.userId}
          username={selectedUser.username}
          profile_image={selectedUser.profile_image}
          isOpen={!!selectedUser}
          onClose={handleClosePopup}
          position={popupPosition}
        />
      )}
      </div>
    </div>
  );
};
