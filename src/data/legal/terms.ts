import { LegalDocument } from './types';

export const termsDocument: LegalDocument = {
  slug: 'terms',
  title: 'Terms and Conditions',
  effectiveDate: '2024-12-31',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      body: 'Welcome to The Bullish Brief ("we", "our", or "us"). These Terms and Conditions govern your use of our website (www.bullishbrief.com) and related services. By accessing, browsing, or using our site, you agree to be bound by these terms. If you do not agree, do not use our services.'
    },
    {
      id: 'account-registration',
      title: 'Account Registration',
      body: 'You may need to create an account to access certain features. You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate information when registering. You may delete your account at any time through account settings, which will permanently remove your profile, comments, and bull room messages.'
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use',
      body: 'You agree not to:\n• Violate any applicable laws or regulations\n• Infringe upon the rights of others\n• Post unlawful, harmful, or offensive content\n• Attempt unauthorized access to our systems\n• Disrupt, damage, or impair our services'
    },
    {
      id: 'content-ownership',
      title: 'Content and Intellectual Property',
      body: 'All content on our website, including articles, briefs, comments, and other materials, is owned by The Bullish Brief or our licensors.\nYou retain rights to your own submissions but grant us a license to use, display, and distribute that content in connection with our services. You may not reproduce, distribute, or create derivative works from our content without our written permission.'
    },
    {
      id: 'privacy-data',
      title: 'Privacy & Data Use',
      body: 'Your personal information is collected, used, shared, and sold in accordance with our Privacy Policy. This includes the sharing and sale of certain personal information, such as email addresses, for marketing and business purposes.\nBy using our services, you agree to the practices outlined in our Privacy Policy, which is available at all times on our website.'
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      body: 'All content is provided for informational and educational purposes only and is not intended as financial advice. Our services are provided "as is" without warranties of any kind. We do not guarantee uninterrupted, secure, or error-free service.'
    },
    {
      id: 'limitation-liability',
      title: 'Limitation of Liability',
      body: 'To the maximum extent permitted by law, we are not liable for any damages arising from your use of our services, including but not limited to loss of profits, data, or use.'
    },
    {
      id: 'termination',
      title: 'Termination',
      body: 'We may suspend or terminate your access to our services at any time, with or without cause or notice. You may terminate your account at any time via account settings. Upon termination, your right to use our services ends immediately.'
    },
    {
      id: 'governing-law',
      title: 'Governing Law',
      body: 'These terms are governed by the laws of the Province of British Columbia, Canada. Any disputes will be resolved exclusively in the courts of British Columbia.'
    },
    {
      id: 'changes-terms',
      title: 'Changes to These Terms',
      body: 'We may update these terms by posting a revised version on our website. Your continued use of our services after updates constitutes acceptance of the new terms.'
    },
    {
      id: 'contact',
      title: 'Contact Us',
      body: 'Email: info@bullishbrief.com'
    }
  ]
};