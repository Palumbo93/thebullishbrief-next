import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { SectionHeader } from '../SectionHeader';
import { supabase } from '../../lib/supabase';

export const DataSection: React.FC = () => {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const handleDeleteAccount = async () => {
    if (!user) return;

    confirm.danger(
      'Delete Account',
      `Are you sure you want to permanently delete your account? This will:
      
• Delete your profile and all personal data
• Remove all your comments and reactions
• Delete your bookmarks and preferences
• Clear your Bull Room message history

This action cannot be undone.`,
      async () => {
        try {
          // Call the Edge Function to delete user account and all related data
          const { error } = await supabase.functions.invoke('delete-user');
          
          if (error) {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account. Please contact support.');
            return;
          }

          // Sign out after successful deletion to clear the session
          await signOut();
          
          toast.success('Account deleted successfully');
        } catch (error) {
          console.error('Error deleting account:', error);
          toast.error('Failed to delete account. Please contact support.');
        }
      }
    );
  };

  const handleClearBullRoomMessages = async () => {
    if (!user) return;

    confirm.danger(
      'Clear Bull Room Messages',
      'Are you sure you want to delete all your messages from Bull Room? This will permanently remove all messages you\'ve sent across all rooms. This action cannot be undone.',
      async () => {
        try {
          // Delete all messages by this user
          const { error } = await supabase
            .from('bull_room_messages')
            .delete()
            .eq('user_id', user.id);

          if (error) {
            console.error('Error clearing messages:', error);
            toast.error('Failed to clear messages. Please try again.');
            return;
          }

          toast.success('All Bull Room messages cleared successfully');
        } catch (error) {
          console.error('Error clearing messages:', error);
          toast.error('Failed to clear messages. Please try again.');
        }
      }
    );
  };

  const dataItems = [
    {
      id: 'clear-messages',
      label: 'Clear Bull Room Messages',
      description: 'Delete all your messages from Bull Room',
      onClick: handleClearBullRoomMessages,
      type: 'warning' as const
    },
    {
      id: 'delete-account',
      label: 'Delete Account',
      description: 'Permanently delete your account and all data',
      onClick: handleDeleteAccount,
      type: 'danger' as const
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column'
    }}>
      <SectionHeader title="Data Management" />

      {/* Data Items List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {dataItems.map((item, index) => (
          <div key={item.id}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-4) 0',
                cursor: 'pointer',
                transition: 'background var(--transition-base)'
              }}
              onClick={item.onClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ flex: 1, padding: '0 var(--space-4)' }}>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: item.type === 'danger' 
                    ? 'var(--color-destructive)' 
                    : item.type === 'warning'
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-primary)',
                  marginBottom: 'var(--space-1)'
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-secondary)'
                }}>
                  {item.description}
                </div>
              </div>
              <div style={{
                color: 'var(--color-text-tertiary)',
                opacity: 0.7,
                padding: '0 var(--space-4)'
              }}>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </div>
            </div>
            {/* Divider - only show if not the last item */}
            {index < dataItems.length - 1 && (
              <div style={{
                height: '1px',
                background: 'var(--color-border-primary)'
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
