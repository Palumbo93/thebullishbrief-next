"use client";

import React from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Layout } from '../../components/Layout';

export default function BullRoomNotFound() {
  return (
    <Layout>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        padding: 'var(--space-6)'
      }}>
        <div style={{ 
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6)'
          }}>
            <MessageSquare style={{ 
              width: '32px', 
              height: '32px', 
              color: 'var(--color-text-muted)' 
            }} />
          </div>
          
          <h1 style={{ 
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-3)',
            fontFamily: 'var(--font-editorial)'
          }}>
            Room Not Found
          </h1>
          
          <p style={{ 
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: 'var(--space-6)'
          }}>
            The Bull Room you're looking for doesn't exist or may have been removed. 
            Check the room name or try visiting a different room.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            alignItems: 'center'
          }}>
            <Link 
              href="/bull-room/general"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-6)',
                background: 'var(--color-brand-primary)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                transition: 'background-color var(--transition-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-primary)';
              }}
            >
              <MessageSquare style={{ width: '16px', height: '16px' }} />
              Go to General Room
            </Link>
            
            <Link 
              href="/bull-room"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                color: 'var(--color-text-muted)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                transition: 'color var(--transition-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              Back to Bull Room
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
