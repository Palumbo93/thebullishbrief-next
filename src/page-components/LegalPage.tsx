"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LegalPageTemplate } from '../components/legal/LegalPageTemplate';
import type { LegalDocument } from '../data/legal/types';
import { LegalFooter } from '../components/LegalFooter';
import { PageSkeleton } from '@/components/PageSkeleton';

interface LegalPageProps {
  doc: LegalDocument;
}

export const LegalPage: React.FC<LegalPageProps> = ({ doc }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const navItems: Array<{ slug: LegalDocument['slug']; label: string; to: string }> = [
    { slug: 'contact', label: 'Contact', to: '/contact' },
    { slug: 'about', label: 'About', to: '/about' },
    { slug: 'terms', label: 'Terms & Conditions', to: '/terms' },
    { slug: 'privacy', label: 'Privacy Policy', to: '/privacy' },
    { slug: 'disclaimer', label: 'Disclaimer', to: '/disclaimer' },
  ];

  // Add null check for doc
  if (!doc || !doc.slug) {
    return <PageSkeleton />;
  }

  const currentSlug = doc.slug;

  return (
    <>
      <style>{`
        .legal-container {
          min-height: 100vh;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-family: var(--font-primary);
          display: flex;
        }

        .legal-header {
          display: block;
        }

        .legal-sidebar {
          width: 300px;
          border-right: 0.5px solid var(--color-border-primary);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
        }

        .legal-content {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .legal-content-inner {
          flex: 1;
          max-width: 100%;
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .legal-container {
            flex-direction: column;
          }

          .legal-header {
            display: none;
          }
          
          .legal-sidebar {
            width: 100%;
            height: auto;
            position: sticky;
            top: 56px; /* Below mobile header */
            border-right: none;
            background: var(--color-bg-primary);
            z-index: 10;
          }
          
          .legal-content {
            height: auto;
          }
          
          .sidebar-navigation {
            display: flex;
            overflow-x: auto;
            padding: var(--space-4) !important;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }
          
          .sidebar-navigation::-webkit-scrollbar {
            display: none; /* Safari and Chrome */
          }
          
          .sidebar-navigation > div {
            display: flex !important;
            flex-direction: row !important;
            gap: var(--space-2) !important;
            min-width: max-content;
          }
          
          .nav-item {
            min-width: max-content !important;
            white-space: nowrap !important;
          }
          
          .nav-item-content {
            display: flex !important;
            align-items: center !important;
            gap: var(--space-2) !important;
          }
          
          .nav-arrow {
            display: none !important;
          }
        }
      `}</style>
      
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="legal-container">
        {/* Left Sidebar */}
        <aside className="legal-sidebar">
          {/* Header */}
          <div 
            className="legal-header"
            style={{
              padding: 'var(--space-4)',
            }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}>
              <button 
                onClick={handleBack}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'background var(--transition-base), color var(--transition-base)',
                  marginRight: 'var(--space-3)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Back"
              >
                <ArrowLeft style={{ width: '24px', height: '24px' }} />
              </button>
              <h1 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-bold)',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
                Company & Legal
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-navigation" style={{ flex: 1, padding: '0 var(--space-4)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {navItems.map((item) => {
                const isActive = currentSlug === item.slug || pathname === item.to;
                return (
                  <Link
                    key={item.slug}
                    href={item.to}
                    className="nav-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-4)',
                      background: isActive ? 'var(--color-bg-tertiary)' : 'transparent',
                      borderRadius: 'var(--radius-lg)',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      textDecoration: 'none',
                      transition: 'all var(--transition-base)',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-bg-card)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                                      >
                    <div className="nav-item-content">
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)'
                      }}>
                        {item.label}
                      </div>
                    </div>
                    <div className="nav-arrow" style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)', opacity: isActive ? 1 : 0.5 }}>→</div>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Right Content (column with footer below content only) */}
        <div className="legal-content">
          <div className="legal-content-inner">
            <LegalPageTemplate doc={doc} />
          </div>
          <LegalFooter />
        </div>
      </div>
    </section>
    </>
  );
};

export default LegalPage;
