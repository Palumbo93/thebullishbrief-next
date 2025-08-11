import type { Metadata } from 'next';
import { AccountSettingsPage } from '../../pages/AccountSettingsPage';
import { Layout } from '../../components/Layout';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Account Settings - The Bullish Brief',
    description: 'Manage your account settings, preferences, and profile information.',
    robots: {
      index: false, // Don't index user account pages
      follow: false,
    },
  };
}

function AccountSettingsPageClient() {
  return (
    <Layout>
      <AccountSettingsPage />
    </Layout>
  );
}

export default AccountSettingsPageClient;
