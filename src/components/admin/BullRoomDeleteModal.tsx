"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { BullRoom } from '../../lib/database.aliases';

interface BullRoomDeleteModalProps {
  room: BullRoom;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export const BullRoomDeleteModal: React.FC<BullRoomDeleteModalProps> = ({
  room,
  onClose,
  onConfirm,
  loading
}) => {
  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 'var(--z-modal)',
      animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        width: '90%',
        maxWidth: '500px',
        border: '0.5px solid var(--color-border-primary)',
        animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)'
        }}>
          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)'
          }}>
            Delete Bull Room
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{
            padding: 'var(--space-3)',
            background: 'var(--color-error-bg)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-error)'
          }}>
            <AlertTriangle style={{ width: '24px', height: '24px' }} />
          </div>
          <div>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              Are you sure you want to delete "{room.name}"?
            </h3>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-4)'
            }}>
              This action cannot be undone. All messages in this room will be permanently deleted, and users will no longer be able to access this chat room.
            </p>
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '0.5px solid var(--color-border-primary)'
            }}>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-2)'
              }}>
                <strong>Room Details:</strong>
              </div>
              <div style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)'
              }}>
                <div>Slug: /{room.slug}</div>
                <div>Topic: {room.topic}</div>
                <div>Messages: {room.message_count || 0}</div>
                <div>Status: {room.is_active ? 'Active' : 'Inactive'}</div>
                {room.is_featured && <div>Featured: Yes</div>}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn btn-error"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
            <span>{loading ? 'Deleting...' : 'Delete Room'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
