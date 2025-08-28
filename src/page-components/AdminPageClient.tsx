"use client";

import React, { useState, useEffect } from 'react';
import { Crown, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ArticleManager } from '../components/admin/ArticleManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import { AuthorManager } from '../components/admin/AuthorManager';
import { TagManager } from '../components/admin/TagManager';
import { BriefManager } from '../components/admin/BriefManager';
import { UserManager } from '../components/admin/UserManager';
import { EmailManager } from '../components/admin/EmailManager';
import { PromptManager } from '../components/admin/PromptManager';
import { PromptCategoryManager } from '../components/admin/PromptCategoryManager';
import { BullRoomManager } from '../components/admin/BullRoomManager';
import { BuildTrigger } from '../components/admin/BuildTrigger';
import { AdminTabs, AdminTab } from '../components/admin/AdminTabs';

interface AdminPageClientProps {
  onCreateAccountClick?: () => void;
}

export const AdminPageClient: React.FC<AdminPageClientProps> = ({ onCreateAccountClick }) => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('articles');

  // Since server-side verification already happened, we can trust we're an admin
  // But we still check client-side for UI consistency
  const isAdmin = hasRole('admin');

  // Handle URL-based routing - simplified to avoid page reloads
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['articles', 'categories', 'authors', 'tags', 'briefs', 'users', 'emails', 'prompts', 'prompt-categories', 'bull-rooms', 'build'].includes(hash)) {
      setActiveTab(hash as AdminTab);
    } else {
      // Set default tab if no valid hash
      setActiveTab('articles');
    }
  }, []);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'articles':
        return <ArticleManager />;
      case 'categories':
        return <CategoryManager />;
      case 'authors':
        return <AuthorManager />;
      case 'tags':
        return <TagManager />;
      case 'briefs':
        return <BriefManager />;
      case 'users':
        return <UserManager />;
      case 'emails':
        return <EmailManager />;
      case 'prompts':
        return <PromptManager />;
      case 'prompt-categories':
        return <PromptCategoryManager />;
      case 'bull-rooms':
        return <BullRoomManager />;
      case 'build':
        return <BuildTrigger />;
      default:
        return <ArticleManager />;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'articles':
        return 'Manage articles, create new posts, edit existing content, and control publication status.';
      case 'categories':
        return 'Organize content by managing article categories and their hierarchical structure.';
      case 'authors':
        return 'Manage author profiles, biographical information, and content attribution.';
      case 'tags':
        return 'Create and manage tags for better content organization and discoverability.';
      case 'briefs':
        return 'Manage brief content, daily market updates, and featured financial insights.';
      case 'users':
        return 'Monitor user activity, manage accounts, and oversee community engagement.';
      case 'emails':
        return 'View and analyze collected email addresses organized by brief for lead generation tracking.';
      case 'prompts':
        return 'Curate AI prompts for the vault, organize by categories, and manage accessibility.';
      case 'prompt-categories':
        return 'Organize AI prompts into logical categories for better user navigation.';
      case 'bull-rooms':
        return 'Manage chat rooms, moderate conversations, and oversee community guidelines.';
      case 'build':
        return 'Trigger site rebuilds and cache invalidation for content updates.';
      default:
        return 'Administrative tools for managing your publication.';
    }
  };

  // If user is not loaded yet, show loading state
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 'var(--space-8) var(--content-padding)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-6)',
          border: '0.5px solid var(--color-border-primary)'
        }}>
          <Crown style={{ width: '40px', height: '40px', color: 'var(--color-text-tertiary)' }} />
        </div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-primary)'
        }}>
          Admin Access Required
        </h2>
        <p style={{
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-6)',
          maxWidth: '400px',
          lineHeight: 'var(--leading-relaxed)'
        }}>
          Please sign in with an admin account to access the publication management portal.
        </p>
        <button 
          onClick={onCreateAccountClick} 
          className="btn btn-primary"
          style={{ fontSize: 'var(--text-sm)' }}
        >
          <Crown style={{ width: '16px', height: '16px' }} />
          <span>Sign In as Admin</span>
        </button>
      </div>
    );
  }

  // Client-side fallback check (should rarely be needed due to server-side verification)
  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 'var(--space-8) var(--content-padding)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--color-error-bg)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-6)',
          border: '1px solid var(--color-error-border)'
        }}>
          <Shield style={{ width: '40px', height: '40px', color: 'var(--color-error)' }} />
        </div>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-primary)'
        }}>
          Access Denied
        </h2>
        <p style={{
          color: 'var(--color-text-tertiary)',
          maxWidth: '400px',
          lineHeight: 'var(--leading-relaxed)'
        }}>
          You don't have permission to access the admin portal. Contact an administrator to request access.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' }}>
      {/* Tab Navigation */}
      <div>
        <AdminTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content Container */}
        <div style={{
          padding: 'var(--space-8) var(--content-padding)'
        }}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPageClient;
