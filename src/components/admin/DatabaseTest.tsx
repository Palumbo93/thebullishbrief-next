"use client";

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    setTestResult('Testing database connection...');
    
    try {
      console.log('Testing Supabase connection...');
      
      // Test 1: Check if we can connect to Supabase
      const { data: testData, error: testError } = await supabase
        .from('ai_prompt_categories')
        .select('count')
        .limit(1);
      
      console.log('Test 1 result:', { testData, testError });
      
      if (testError) {
        setTestResult(`Connection test failed: ${testError.message}`);
        return;
      }
      
      // Test 2: Try to fetch all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('ai_prompt_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      
      console.log('Test 2 result:', { categories, categoriesError });
      
      if (categoriesError) {
        setTestResult(`Categories fetch failed: ${categoriesError.message}`);
        return;
      }
      
      setTestResult(`Success! Found ${categories?.length || 0} categories: ${categories?.map(c => c.name).join(', ')}`);
      
    } catch (error) {
      console.error('Database test error:', error);
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: 'var(--space-4)',
      border: '1px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-lg)',
      margin: 'var(--space-4)'
    }}>
      <h3 style={{ marginBottom: 'var(--space-3)' }}>Database Connection Test</h3>
      
      <button
        onClick={testDatabaseConnection}
        disabled={loading}
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-base)',
          padding: 'var(--space-2) var(--space-4)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>
      
      {testResult && (
        <div style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-3)',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-base)',
          fontSize: 'var(--text-sm)',
          whiteSpace: 'pre-wrap'
        }}>
          {testResult}
        </div>
      )}
    </div>
  );
};
