import { LegalDocument } from './types';

export const privacyDocument: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  effectiveDate: '2024-12-31',
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      body: 'This Privacy Policy explains how The Bullish Brief ("we", "our", or "us") collects, uses, shares, and sells your personal information when you use our website (www.bullishbrief.com) and related services. We are committed to being transparent about our practices so you can make informed choices about your data.'
    },
    {
      id: 'information-collected',
      title: 'Information We Collect',
      body: 'We collect only the personal information necessary to provide and improve our services:\n• Email Address – Required for account creation and service delivery; may also be shared or sold for marketing and business purposes\n• Account Information – Username, profile details, and any preferences you provide\n• Usage Data – Anonymous information about how you interact with our site, collected via Datafa.st (a cookie-free, GDPR-compliant analytics tool)\n• User-Generated Content – Comments, "bull room" messages, and other submissions you make'
    },
    {
      id: 'how-we-collect',
      title: 'How We Collect Information',
      body: 'Directly from you – When you create an account, submit content, or contact us.\nAutomatically – Through Datafa.st analytics, which collects anonymous, cookie-free data such as page views and session duration.\nFrom interactions – When you participate in bull rooms or engage with our content.'
    },
    {
      id: 'how-we-use',
      title: 'How We Use Your Information',
      body: 'We use your personal data to:\n• Provide services – Deliver content, enable commenting, and facilitate discussions\n• Improve our platform – Analyze usage to enhance performance and user experience\n• Communicate with you – Send service updates and, with your consent, marketing emails\n• Business and marketing purposes – Share or sell personal data, including email addresses and preferences, to selected third parties for advertising, lead generation, or other commercial purposes'
    },
    {
      id: 'sharing-information',
      title: 'Sharing and Selling Your Information',
      body: 'We may share or sell your personal information in the following ways:\n• Service Providers – For hosting, analytics, email delivery, and other operational support\n• Business Partners and Third Parties – We may share or sell personal data, including email addresses and user preferences, for marketing, advertising, and related business activities\n• Legal Requirements – If required by law or to protect our rights\nWe will only share or sell your personal information where permitted by law and, where applicable, with your consent. You may withdraw consent or opt out of such sharing at any time by contacting info@bullishbrief.com.'
    },
    {
      id: 'data-retention',
      title: 'Data Retention and Deletion',
      body: 'We keep personal data only as long as necessary for the purposes described above.\nDeleting your account permanently removes your profile, comments, and bull room messages.\nWe do not keep backups of deleted user data.\nMinimal records may be retained if required by law.'
    },
    {
      id: 'your-rights',
      title: 'Your Rights',
      body: 'You may:\n• Request access to your personal data\n• Request corrections to inaccurate information\n• Request deletion of your data\n• Withdraw consent for marketing or data sharing/selling\nContact us at info@bullishbrief.com to exercise your rights. We will respond within the timeframes required by law.'
    },
    {
      id: 'data-security',
      title: 'Data Security',
      body: 'We use access controls, secure hosting, and operational safeguards to protect your personal information. While we collect minimal sensitive data, we follow security best practices to reduce the risk of unauthorized access.'
    },
    {
      id: 'cookies-tracking',
      title: 'Cookies & Tracking',
      body: 'We do not use traditional tracking cookies. Analytics are collected via Datafa.st, which is privacy-friendly and cookie-free.'
    },
    {
      id: 'children-privacy',
      title: 'Children\'s Privacy',
      body: 'We do not knowingly collect information from anyone under 18. If we discover such data, we will delete it.'
    },
    {
      id: 'international-users',
      title: 'International Users',
      body: 'Our services are operated from Canada. If you are outside Canada, your information may be transferred to and processed in Canada, where privacy laws may differ from those in your country.'
    },
    {
      id: 'policy-updates',
      title: 'Updates to This Policy',
      body: 'We may update this Privacy Policy periodically. Material changes will be posted on our website with a new effective date.'
    },
    {
      id: 'contact-information',
      title: 'Contact Us',
      body: 'Email: info@bullishbrief.com\nWebsite: www.bullishbrief.com'
    }
  ]
};
