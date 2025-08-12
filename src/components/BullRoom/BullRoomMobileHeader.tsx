import React, { useState } from 'react';
import { ChevronDown, Info, X, ArrowLeft } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';

interface BullRoomMobileHeaderProps {
  rooms: BullRoom[];
  selectedRoom: BullRoom | null;
  onSelectRoom: (roomSlug: string) => void;
  onToggleInfoPanel: () => void;
  isInfoPanelOpen: boolean;
}

export const BullRoomMobileHeader: React.FC<BullRoomMobileHeaderProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  onToggleInfoPanel,
  isInfoPanelOpen
}) => {
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);

  const handleRoomSelect = (roomSlug: string) => {
    onSelectRoom(roomSlug);
    setIsRoomDropdownOpen(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'var(--color-bg-primary)',
      borderBottom: '0.5px solid var(--color-border-primary)',
      backdropFilter: 'blur(8px)'
    }}>
              {/* Main Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          minHeight: '60px'
        }}>
          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'var(--color-bg-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
              color: 'var(--color-text-primary)',
              marginRight: 'var(--space-3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Room Selector */}
          <div style={{ flex: 1, position: 'relative' }}>
          <button
            onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-medium)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <span style={{ fontFamily: 'var(--font-editorial)' }}>
              {selectedRoom?.name || 'Select Room'}
            </span>
            <ChevronDown 
              size={16} 
              style={{ 
                transition: 'transform var(--transition-base)',
                transform: isRoomDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </button>

          {/* Room Dropdown */}
          {isRoomDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              marginTop: 'var(--space-1)',
              zIndex: 1001,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room.slug)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: selectedRoom?.id === room.id ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    borderBottom: '0.5px solid var(--color-border-primary)',
                    fontWeight: selectedRoom?.id === room.id ? 'var(--font-medium)' : 'var(--font-normal)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedRoom?.id !== room.id) {
                      e.currentTarget.style.background = 'var(--color-bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedRoom?.id !== room.id) {
                      e.currentTarget.style.background = 'none';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: selectedRoom?.id === room.id ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)'
                    }} />
                    <span>{room.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel Toggle */}
        <button
          onClick={onToggleInfoPanel}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            background: isInfoPanelOpen ? 'var(--color-brand-primary)' : 'var(--color-bg-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
            color: isInfoPanelOpen ? 'white' : 'var(--color-text-primary)'
          }}
        >
          {isInfoPanelOpen ? <X size={20} /> : <Info size={20} />}
        </button>
      </div>

      {/* Backdrop for dropdown */}
      {isRoomDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsRoomDropdownOpen(false)}
        />
      )}
    </div>
  );
};
