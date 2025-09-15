"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Eye, Users, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalViews: number;
  totalArticles: number;
  activeUsers: number;
  viewsThisWeek: number;
  viewsLastWeek: number;
  topArticles: Array<{
    id: string;
    title: string;
    view_count: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    action: string;
    timestamp: string;
  }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalViews: 0,
    totalArticles: 0,
    activeUsers: 0,
    viewsThisWeek: 0,
    viewsLastWeek: 0,
    topArticles: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    setupRealtimeSubscription();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch total views
      const { data: viewsData } = await supabase
        .from('articles')
        .select('view_count');

      const totalViews = viewsData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

      // Fetch total articles
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      // Fetch active users
      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch top articles by views
      const { data: topArticles } = await supabase
        .from('articles')
        .select('id, title, view_count')
        .order('view_count', { ascending: false })
        .limit(5);

      // Calculate weekly views (simplified - in real app you'd have proper analytics)
      const viewsThisWeek = Math.floor(totalViews * 0.3);
      const viewsLastWeek = Math.floor(totalViews * 0.25);

      // Mock recent activity
      const recentActivity = [
        {
          id: '1',
          title: 'New article published',
          action: 'published',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Article updated',
          action: 'updated',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ];

      setData({
        totalViews,
        totalArticles: totalArticles || 0,
        activeUsers: activeUsers || 0,
        viewsThisWeek,
        viewsLastWeek,
        topArticles: topArticles || [],
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('analytics-dashboard')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'articles' },
        () => {
          fetchAnalytics(); // Refresh analytics when articles change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType = 'neutral' }: {
    title: string;
    value: number;
    icon: any;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
  }) => (
    <div className="card animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-tertiary mb-1">{title}</p>
          <p className="text-2xl font-bold text-primary">
            {value.toLocaleString()}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === 'positive' ? (
                <ArrowUpRight className="w-4 h-4 text-success" />
              ) : changeType === 'negative' ? (
                <ArrowDownRight className="w-4 h-4 text-error" />
              ) : null}
              <span className={`text-sm ${changeType === 'positive' ? 'text-success' : changeType === 'negative' ? 'text-error' : 'text-tertiary'}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-tertiary text-primary">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-border-primary border-t-brand rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-tertiary">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const viewsChange = getPercentageChange(data.viewsThisWeek, data.viewsLastWeek);
  const viewsChangeType = viewsChange > 0 ? 'positive' : viewsChange < 0 ? 'negative' : 'neutral';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analytics</h2>
          <p className="text-tertiary">
            Track your publication performance and engagement
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Views" 
          value={data.totalViews} 
          icon={Eye}
        />
        <StatCard 
          title="Total Articles" 
          value={data.totalArticles} 
          icon={BarChart3}
        />
        <StatCard 
          title="Active Users" 
          value={data.activeUsers} 
          icon={Users}
        />
        <StatCard 
          title="Views This Week" 
          value={data.viewsThisWeek} 
          icon={TrendingUp}
          change={viewsChange}
          changeType={viewsChangeType}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Articles</h3>
            <BarChart3 className="w-5 h-5 text-tertiary" />
          </div>
          <div className="space-y-3">
            {data.topArticles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 rounded-lg bg-tertiary">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-inverse">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                    <p className="text-xs text-tertiary">{article.view_count.toLocaleString()} views</p>
                  </div>
                </div>
                <Eye className="w-4 h-4 text-tertiary" />
              </div>
            ))}
            {data.topArticles.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-tertiary mx-auto mb-4" />
                <p className="text-tertiary">No articles yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Calendar className="w-5 h-5 text-tertiary" />
          </div>
          <div className="space-y-3">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-tertiary">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-tertiary">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-tertiary mx-auto mb-4" />
                <p className="text-tertiary">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Chart Placeholder */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Engagement Over Time</h3>
          <TrendingUp className="w-5 h-5 text-tertiary" />
        </div>
        <div className="h-64 flex items-center justify-center bg-tertiary rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-tertiary mx-auto mb-4" />
            <p className="text-tertiary">Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};