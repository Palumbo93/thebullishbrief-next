# The Bullish Brief

A modern financial news platform built with Next.js, focusing on investment insights, market analysis, and financial education.

## Overview

The Bullish Brief provides curated financial content including:
- **Articles**: In-depth market analysis and investment insights
- **Briefs**: Quick market updates and trading opportunities
- **AI Vault**: AI-powered prompts for financial analysis
- **Bull Room**: Real-time chat for market discussions
- **Author Profiles**: Expert financial writers and analysts

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS Custom Properties with modern design system
- **Analytics**: Microsoft Clarity & Custom Analytics
- **Email**: Postmark SMTP
- **Storage**: Supabase Storage for media files
- **Real-time**: Supabase Realtime for chat features
- **Audio**: ElevenLabs Audio Native for text-to-speech

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd thebullishbrief-next
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Copy `.env.example` to `.env.local` and configure:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID=your_elevenlabs_public_user_id
```

4. Run database migrations
```bash
# Apply Supabase migrations
npx supabase db push
```

5. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── contexts/              # React contexts (Auth, Theme, etc.)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── page-components/       # Page-specific components
├── services/              # API and business logic
├── styles/                # Global styles
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions

design/                    # Design documents and architecture
docs/                      # Documentation
supabase/                  # Database migrations and functions
```

## Key Features

### Content Management
- Rich text editor with media support
- Article and brief publishing workflow
- Author management and profiles
- Category and tag organization
- SEO optimization with metadata

### User Experience
- Responsive design for all devices
- Dark/light theme support
- Bookmarking and reading lists
- Social sharing functionality
- Advanced search and filtering

### Real-time Features
- Bull Room chat with reactions
- Typing indicators and presence
- Real-time message updates
- Admin moderation tools

### Analytics & Performance
- Microsoft Clarity integration
- Custom analytics tracking
- Performance monitoring
- SEO optimization

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database

This project uses Supabase for the database. Key tables:
- `articles` - Published articles and content
- `briefs` - Quick market updates
- `authors` - Author profiles and information
- `categories` - Content categorization
- `tags` - Content tagging system
- `bull_room_messages` - Chat messages
- `user_profiles` - User account information

### Authentication

Built on Supabase Auth with:
- Email/password authentication
- Email verification
- Password reset functionality
- Profile management
- Admin role system

## Deployment

This application is optimized for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables

Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- `POSTMARK_API_TOKEN`
- `NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID` (for audio features)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.