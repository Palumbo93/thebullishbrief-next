import React from 'react';
import { Routes as RouterRoutes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { BullRoomPage } from '../pages/BullRoomPage';
import { AIVault } from '../pages/AIVault';
import { AdminPage } from '../pages/AdminPage';
import { ArticlePage } from '../pages/ArticlePage';
import { SearchPage } from '../pages/SearchPage';
import { AuthorPage } from '../pages/AuthorPage';
import { BookmarksPage } from '../pages/BookmarksPage';
import { AccountSettingsPage } from '../pages/AccountSettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { useAuth } from '../contexts/AuthContext';
import { BriefPage } from '../pages/BriefPage';
import { LegalPage } from '../pages/LegalPage';
import { getLegalDocument } from '../data/legal';

interface AppRoutesProps {
  onCreateAccountClick?: () => void;
  onTopicChange?: (topic: string) => void;
  onArticleSelect?: (articleId: number, articleTitle: string) => void;
}

/**
 * Protected route component that checks if user is admin
 */
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Memoize the component to prevent unnecessary re-renders
  const memoizedChildren = React.useMemo(() => children, [children]);
  
  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{memoizedChildren}</>;
};

/**
 * Wrapper component for ArticlePage that handles URL parameters
 */
const ArticlePageWrapper: React.FC<{ onCreateAccountClick?: () => void }> = ({ onCreateAccountClick }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <ArticlePage 
      articleId={slug || ''}
      onBack={handleBack}
      onCreateAccountClick={onCreateAccountClick}
    />
  );
};

/**
 * Wrapper component for BriefPage that handles URL parameters
 */
const BriefPageWrapper: React.FC<{ onCreateAccountClick?: () => void }> = ({ onCreateAccountClick }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <BriefPage 
      briefId={slug || ''}
      onBack={handleBack}
      onCreateAccountClick={onCreateAccountClick}
    />
  );
};

// Static wrappers for legal pages
const TermsRoute: React.FC = () => <LegalPage doc={getLegalDocument('terms')} />;
const PrivacyRoute: React.FC = () => <LegalPage doc={getLegalDocument('privacy')} />;
const CookiesRoute: React.FC = () => <LegalPage doc={getLegalDocument('cookies')} />;
const DisclaimerRoute: React.FC = () => <LegalPage doc={getLegalDocument('disclaimer')} />;

/**
 * Main routes component that defines all application routes
 */
export const AppRoutes: React.FC<AppRoutesProps> = ({ 
  onCreateAccountClick, 
  onTopicChange, 
  onArticleSelect 
}) => {
  return (
    <RouterRoutes>
      {/* Home route */}
      <Route 
        path="/" 
        element={
          <HomePage 
            onCreateAccountClick={onCreateAccountClick} 
            onArticleSelect={onArticleSelect} 
          />
        } 
      />
      
      {/* Bull Room route (deprecated, redirect to new route) */}
      <Route 
        path="/bullroom" 
        element={<Navigate to="/bull-room/general" replace />} 
      />

      {/* Bull Room base route - redirect to general room */}
      <Route 
        path="/bull-room" 
        element={<Navigate to="/bull-room/general" replace />} 
      />

      {/* Bull Room dynamic route */}
      <Route 
        path="/bull-room/:roomId" 
        element={
          <BullRoomPage onCreateAccountClick={onCreateAccountClick} />
        } 
      />
      
      {/* AI Vault route */}
      <Route 
        path="/aivault" 
        element={
          <AIVault 
            onCreateAccountClick={onCreateAccountClick} 
          />
        } 
      />
      
      
      {/* Admin route - protected */}
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminPage onCreateAccountClick={onCreateAccountClick} />
          </ProtectedAdminRoute>
        } 
      />
      
      {/* Article detail route */}
      <Route 
        path="/articles/:slug" 
        element={
          <ArticlePageWrapper 
            onCreateAccountClick={onCreateAccountClick} 
          />
        } 
      />
      
      {/* Explore route - discovery interface */}
      <Route 
        path="/explore" 
        element={
          <SearchPage 
            onCreateAccountClick={onCreateAccountClick}
            onArticleSelect={onArticleSelect}
          />
        } 
      />
      
      {/* Search route - when filters are applied */}
      <Route 
        path="/search" 
        element={
          <SearchPage 
            onCreateAccountClick={onCreateAccountClick}
            onArticleSelect={onArticleSelect}
          />
        } 
      />
      
      {/* Author route */}
      <Route 
        path="/authors/:slug" 
        element={
          <AuthorPage 
            onCreateAccountClick={onCreateAccountClick}
            onArticleSelect={onArticleSelect}
          />
        } 
      />
      
      {/* Legal routes */}
      <Route path="/terms" element={<TermsRoute />} />
      <Route path="/privacy" element={<PrivacyRoute />} />
      <Route path="/cookies" element={<CookiesRoute />} />
      <Route path="/disclaimer" element={<DisclaimerRoute />} />
      
      {/* Bookmarks route */}
      <Route 
        path="/bookmarks" 
        element={
          <BookmarksPage 
            onCreateAccountClick={onCreateAccountClick}
          />
        } 
      />
      
      {/* Account Settings route */}
      <Route 
        path="/account-settings" 
        element={
          <AccountSettingsPage 
            onCreateAccountClick={onCreateAccountClick}
          />
        } 
      />
      
      
      {/* Dynamic Brief Pages */}
      <Route 
        path="/briefs/:slug" 
        element={
          <BriefPageWrapper 
            onCreateAccountClick={onCreateAccountClick} 
          />
        } 
      />
      
      
      {/* 404 Page - catch all route */}
      <Route 
        path="*" 
        element={
          <NotFoundPage 
            onCreateAccountClick={onCreateAccountClick}
          />
        } 
      />
    </RouterRoutes>
  );
}; 