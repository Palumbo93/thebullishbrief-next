"use client";

import { useDatafast } from '../../contexts/DatafastContext';
import { useTrackArticleEngagement, useTrackUserActions } from '../../hooks/useDatafastAnalytics';

export default function TestAnalyticsPage() {
  const { debug } = useDatafast();
  const { trackBookmark, trackShare } = useTrackArticleEngagement();
  const { trackSignup, trackLogin } = useTrackUserActions();

  const debugServer = async () => {
    try {
      const response = await fetch('/api/analytics/debug');
      const data = await response.json();
      console.log('Server-side debug info:', data);
    } catch (error) {
      console.error('Failed to get server debug info:', error);
    }
  };

  const debugCookies = () => {
    console.log('=== CLIENT-SIDE COOKIES ===');
    console.log('All cookies:', document.cookie);
    console.log('Datafa.st visitor ID:', document.cookie
      .split('; ')
      .find(row => row.startsWith('datafast_visitor_id='))
      ?.split('=')[1] || 'NOT FOUND');
    
    // Check if Datafa.st script is loaded
    console.log('=== DATAFA.ST SCRIPT CHECK ===');
    console.log('window.datafast exists:', !!window.datafast);
    console.log('Script tag exists:', !!document.querySelector('script[data-website-id]'));
    
    // Check for any Datafa.st related cookies
    const allCookies = document.cookie.split('; ');
    const datafastCookies = allCookies.filter(cookie => 
      cookie.toLowerCase().includes('datafast') || 
      cookie.toLowerCase().includes('df_')
    );
    console.log('Datafa.st related cookies:', datafastCookies);
  };

  const testArticleBookmark = () => {
    trackBookmark('test-article-123', 'Test Article Title');
  };

  const testArticleShare = () => {
    trackShare('test-article-123', 'Test Article Title', 'twitter');
  };

  const testUserSignup = () => {
    trackSignup('email');
  };

  const testUserLogin = () => {
    trackLogin('email');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Datafa.st Analytics Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Debug Info</h2>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={debug}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Debug Client (Datafa.st)
          </button>
          
          <button 
            onClick={debugServer}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Debug Server (Environment)
          </button>
          
          <button 
            onClick={debugCookies}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Debug Cookies
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test Goals</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={testArticleBookmark}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Test Article Bookmark
          </button>
          
          <button 
            onClick={testArticleShare}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Test Article Share
          </button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={testUserSignup}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#ffc107', 
              color: 'black', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Test User Signup
          </button>
          
          <button 
            onClick={testUserLogin}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#6f42c1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test User Login
          </button>
        </div>
      </div>

      <div>
        <h2>Instructions</h2>
        <ol>
          <li>Open browser console (F12)</li>
          <li>Click "Debug Datafa.st" to check if script is loaded</li>
          <li>Click any test button to trigger a goal</li>
          <li>Check console for logs and any errors</li>
          <li>Check your Datafa.st dashboard for the goals</li>
        </ol>
      </div>
    </div>
  );
}
