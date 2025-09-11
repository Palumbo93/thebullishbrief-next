import React from 'react';
import { FileText, Folder, Users, Tag, Settings, Brain, MessageSquare, Briefcase, RefreshCw, Mail, BarChart3 } from 'lucide-react';

export type AdminTab = 'articles' | 'categories' | 'authors' | 'tags' | 'users' | 'emails' | 'prompts' | 'prompt-categories' | 'briefs' | 'bull-rooms' | 'build' | 'analytics';

interface AdminTabsProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  count?: number;
}

const tabConfigs: TabConfig[] = [
  {
    id: 'articles',
    label: 'Articles',
    icon: <FileText style={{ width: '16px', height: '16px' }} />,
    description: 'Manage your publication content'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: <Folder style={{ width: '16px', height: '16px' }} />,
    description: 'Organize content by topics'
  },
  {
    id: 'authors',
    label: 'Authors',
    icon: <Users style={{ width: '16px', height: '16px' }} />,
    description: 'Manage contributor profiles'
  },
  {
    id: 'tags',
    label: 'Tags',
    icon: <Tag style={{ width: '16px', height: '16px' }} />,
    description: 'Add metadata to articles'
  },
  {
    id: 'briefs',
    label: 'Briefs',
    icon: <Briefcase style={{ width: '16px', height: '16px' }} />,
    description: 'Manage investor briefs'
  },
  {
    id: 'prompts',
    label: 'AI Prompts',
    icon: <Brain style={{ width: '16px', height: '16px' }} />,
    description: 'Manage AI prompt templates'
  },
  {
    id: 'prompt-categories',
    label: 'Prompt Categories',
    icon: <MessageSquare style={{ width: '16px', height: '16px' }} />,
    description: 'Organize prompts by category'
  },
  {
    id: 'bull-rooms',
    label: 'Bull Rooms',
    icon: <MessageSquare style={{ width: '16px', height: '16px' }} />,
    description: 'Manage chat rooms'
  },
  {
    id: 'emails',
    label: 'Emails',
    icon: <Mail style={{ width: '16px', height: '16px' }} />,
    description: 'View collected email addresses'
  },
  {
    id: 'users',
    label: 'Users',
    icon: <Settings style={{ width: '16px', height: '16px' }} />,
    description: 'Manage user accounts'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 style={{ width: '16px', height: '16px' }} />,
    description: 'View traffic and engagement analytics'
  },
  {
    id: 'build',
    label: 'Build',
    icon: <RefreshCw style={{ width: '16px', height: '16px' }} />,
    description: 'Trigger site rebuilds'
  },
];

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div style={{
      borderBottom: '0.5px solid var(--color-border-primary)',
      padding: '0 var(--content-padding)',
      position: 'sticky',
      top: 0,
      background: 'var(--color-bg-primary)',
      zIndex: 1000
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }} className="hide-scrollbar">
        {tabConfigs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange(tab.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                border: 'none',
                borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
                position: 'relative',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-tertiary)',
                  color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text-tertiary)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-1px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-brand-primary)',
                  borderRadius: 'var(--radius-full)'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}; 