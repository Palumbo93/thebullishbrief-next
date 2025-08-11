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
import { PromptManager } from '../components/admin/PromptManager';
import { PromptCategoryManager } from '../components/admin/PromptCategoryManager';
import { AdminTabs, AdminTab } from '../components/admin/AdminTabs';

interface AdminPageProps {
  onCreateAccountClick?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onCreateAccountClick }) => {
  const { user, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('articles');

  // Check if user has admin role
  const isAdmin = hasRole('admin');

  // Handle URL-based routing - simplified to avoid page reloads
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['articles', 'categories', 'authors', 'tags', 'briefs', 'users', 'prompts', 'prompt-categories'].includes(hash)) {
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
      case 'prompts':
        return <PromptManager />;
      case 'prompt-categories':
        return <PromptCategoryManager />;
      default:
        return <ArticleManager />;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'articles':
        return 'Manage your publication content and articles';
      case 'categories':
        return 'Organize content by topics and categories';
      case 'authors':
        return 'Manage contributor profiles and author information';
      case 'tags':
        return 'Add metadata and tags to articles';
      case 'briefs':
        return 'Manage investor briefs and featured content';
      case 'users':
        return 'Manage user accounts and permissions';
      case 'prompts':
        return 'Manage AI prompt templates and configurations';
      case 'prompt-categories':
        return 'Organize AI prompts by category';
      default:
        return 'Manage your publication content and analytics';
    }
  };

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
      <div style={{
        
      }}>
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