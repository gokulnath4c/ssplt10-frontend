# SSPL Website - Technical Stack & Documentation

## 📋 Project Overview

The **Southern Street Premier League (SSPL)** website is a comprehensive platform for managing and showcasing a T10 Tennis Ball Cricket tournament. The platform provides player registration, team management, match scheduling, analytics, and administrative tools for running a professional cricket league.

### 🎯 Key Objectives
- **Player Registration**: Seamless registration system with payment integration
- **Tournament Management**: Complete league management with standings, matches, and statistics
- **Analytics & Reporting**: Real-time analytics and performance tracking
- **Admin Dashboard**: Comprehensive admin panel for content and data management
- **Public Website**: Engaging user experience with live updates and interactive features

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom cricket-themed design system
- **UI Components**: Radix UI primitives with ShadCN/UI
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization

### Backend & Database
- **Backend-as-a-Service**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Edge Functions**: Deno runtime for serverless functions

### Payments & Integrations
- **Payment Gateway**: Razorpay
- **Analytics**: Google Analytics 4 (react-ga4)
- **Deployment**: Lovable platform

### Development Tools
- **Package Manager**: npm/bun
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier (implied)
- **Version Control**: Git

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN/UI components
│   ├── charts/         # Chart components
│   └── debug/          # Debug utilities
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── services/           # Business logic services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── lib/                # Core library functions

supabase/
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── config.toml         # Supabase configuration
```

### Data Flow
1. **Frontend** makes requests via Supabase client
2. **Supabase** handles authentication, database queries, and real-time subscriptions
3. **Edge Functions** process payments and complex business logic
4. **Database** stores all application data with proper relationships and constraints

## 🎯 Key Features

### Public Features
- **Hero Section**: Tournament overview with key statistics
- **Player Registration**: Multi-step registration form with payment
- **Team Showcase**: Display team information and player profiles
- **Match Schedule**: Upcoming and live match information
- **Standings**: League table with team rankings
- **News & Updates**: Latest tournament news and announcements
- **Interactive Chatbot**: AI-powered assistant for user queries

### Admin Features
- **Dashboard**: Analytics and key metrics overview
- **Content Management**: Manage news, FAQs, and static content
- **User Management**: Admin user role management
- **Data Management**: CRUD operations for teams, players, matches
- **Analytics Dashboard**: Detailed reporting and insights
- **Google Analytics Integration**: Track user behavior and performance

### Technical Features
- **Responsive Design**: Mobile-first approach with custom breakpoints
- **Real-time Updates**: Live match scores and standings
- **Payment Processing**: Secure payment integration with Razorpay
- **Form Validation**: Comprehensive client and server-side validation
- **Error Handling**: Graceful error handling with user feedback
- **Performance Optimization**: Code splitting, lazy loading, and caching
- **QR Code Generation**: Dynamic QR code creation with analytics tracking
- **Security Framework**: Rate limiting, access controls, and audit logging

## 🗄️ Database Schema

### Core Tables

#### Teams (`sspl_teams`)
- Team information, logos, social media links
- Relationships: Players, Matches, Standings

#### Players (`sspl_players`)
- Player profiles with statistics and positions
- Relationships: Teams, Matches

#### Matches (`sspl_matches`)
- Match scheduling and results
- Score tracking and match metadata

#### Standings (`sspl_standings`)
- League table with points and rankings
- Calculated fields for net run rate

#### News (`sspl_news`)
- Articles and announcements
- Categories and featured content

#### Tournaments (`sspl_tournaments`)
- Tournament metadata and configuration

### Supporting Tables

#### Chatbot (`chatbot_conversations`, `chatbot_settings`)
- Conversation history and bot configuration

#### Analytics (`scraping_logs`)
- Data scraping and processing logs

## 🔌 API Endpoints

### Supabase Edge Functions

#### Payment Functions
- `create-razorpay-order`: Creates payment orders
  - **Input**: `{ amount: number }`
  - **Output**: Razorpay order object
  - **Auth**: Required

- `verify-razorpay-payment`: Verifies payment signatures
  - **Input**: `{ paymentId, orderId, signature }`
  - **Output**: `{ verified: boolean }`
  - **Auth**: Required

### Supabase Client API

#### Authentication
- User registration and login
- Password reset and email verification
- Role-based access control

#### Database Operations
- CRUD operations on all tables
- Real-time subscriptions for live updates
- Row Level Security (RLS) policies

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account and project
- Razorpay account (for payments)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sspl-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file with:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
   VITE_GA_TRACKING_ID=your-ga-tracking-id
   ```

4. **Supabase Setup**
   - Run migrations: `supabase db push`
   - Start local Supabase: `supabase start`

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy via Lovable**
   - Push changes to repository
   - Deploy through Lovable platform
   - Configure custom domain if needed

## 🔄 Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### Development Process
1. Create feature branch from `develop`
2. Implement changes with proper TypeScript types
3. Write/update tests if applicable
4. Ensure code passes linting
5. Create pull request to `develop`
6. Code review and approval
7. Merge to `develop`, then to `main` for releases

### Testing
- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical user flows
- Manual testing for UI/UX

## 📊 Deployment & CI/CD

### Environments
- **Development**: Local development and feature testing
- **Staging**: Pre-production testing
- **Production**: Live application

### Deployment Process
1. **Automated Deployment**: Via Lovable platform
2. **Environment Variables**: Managed per environment
3. **Database Migrations**: Applied automatically
4. **Asset Optimization**: Automatic minification and optimization

### Monitoring
- **Error Tracking**: Console logs and error boundaries
- **Performance Monitoring**: Google Analytics and Lighthouse
- **Uptime Monitoring**: External monitoring services

## 🤝 Contributing

### Guidelines
1. Follow the established code standards
2. Write clear, concise commit messages
3. Update documentation for new features
4. Test changes thoroughly
5. Follow the branching strategy

### Code Review Process
- All changes require pull request review
- At least one approval required for merge
- Automated checks must pass
- Manual testing may be required for UI changes

## 📈 Performance Considerations

### Frontend Optimization
- Code splitting with dynamic imports
- Image optimization and lazy loading
- Bundle analysis and tree shaking
- Caching strategies for static assets

### Database Optimization
- Proper indexing on frequently queried columns
- Efficient queries with joins and aggregations
- Connection pooling and prepared statements
- Data archiving for historical records

### Monitoring & Analytics
- Real user monitoring (RUM)
- Core Web Vitals tracking
- Error rate monitoring
- Performance budget enforcement

## 🔒 Security

### Authentication & Authorization
- Supabase Auth with JWT tokens
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- Secure password policies

### Data Protection
- HTTPS encryption in production
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Payment Security
- PCI DSS compliant payment processing
- Secure key management
- Payment verification and reconciliation

## 🎯 QR Code Management System

### Overview
The SSPL Website includes a comprehensive QR code management system that allows administrators to create, manage, and track QR codes for player registration and marketing campaigns.

### Key Features

#### QR Code Generation
- **Dynamic Creation**: Generate QR codes with custom templates and styling
- **Multiple Formats**: Support for PNG and SVG export formats
- **Template System**: Pre-defined templates (Classic, Colored, Compact)
- **Custom Styling**: Configurable colors, sizes, and error correction levels
- **Bulk Generation**: Create multiple QR codes simultaneously with batch processing

#### Channel Mapping System
- **Channel Categories**: Pre-defined channels (Website, Social Media, Email, Print, Events, etc.)
- **Channel Assignment**: Each QR code mapped to specific marketing channel
- **Channel Analytics**: Track performance by channel and campaign
- **Channel Management**: Admin interface for managing channel definitions
- **Channel Reporting**: Channel-specific analytics and conversion tracking

#### Analytics & Tracking
- **Real-time Analytics**: Track scan counts, locations, and device information
- **Scan History**: Detailed logs of all QR code scans with timestamps
- **Geographic Data**: Location-based analytics for scan origins
- **Device Analytics**: Browser, OS, and device type breakdown
- **Conversion Tracking**: Monitor user engagement and conversion rates
- **Channel Performance**: Compare performance across different channels

#### Security & Access Control
- **Rate Limiting**: Prevent abuse with configurable rate limits
- **Access Validation**: Verify QR code ownership and permissions
- **Audit Logging**: Complete audit trail for all QR code operations
- **Expiration Control**: Set expiration dates and scan limits
- **Secure Generation**: Cryptographically secure QR code identifiers
- **Channel Permissions**: Role-based access to channel management

#### Administrative Features
- **Bulk Operations**: Create and manage multiple QR codes with channel mapping
- **Category Management**: Organize QR codes by categories and channels
- **Status Management**: Activate/deactivate QR codes as needed
- **Download Options**: Export QR codes in multiple formats (PNG, SVG, PDF)
- **Batch Download**: Download multiple QR codes as ZIP files
- **Integration**: Seamless integration with gallery and payment systems

### Technical Implementation

#### Database Schema
```sql
-- Core QR code tables
sspl_qr_codes          -- QR code metadata and settings
sspl_qr_analytics      -- Scan tracking and analytics data
sspl_qr_categories     -- Category organization
sspl_qr_templates      -- Template configurations
sspl_qr_access_logs    -- Security and audit logging
```

#### API Endpoints
- `POST /functions/v1/generate-qr-code` - Create individual QR codes
- `POST /functions/v1/bulk-generate-qr-codes` - Create multiple QR codes with channel mapping
- `POST /functions/v1/bulk-download-qr-codes` - Download multiple QR codes as ZIP
- `POST /functions/v1/track-qr-scan` - Track QR code scans
- `GET /functions/v1/get-qr-analytics` - Retrieve analytics data
- `GET /functions/v1/manage-qr-codes` - List and manage QR codes
- `PUT /functions/v1/manage-qr-codes` - Update QR code settings
- `DELETE /functions/v1/manage-qr-codes` - Delete QR codes

#### Frontend Components
- **QRCodeManagement**: Admin dashboard for QR code management
- **QRScan**: Public page for processing QR code scans
- **GallerySection**: Integrated QR code display in gallery
- **AnalyticsDashboard**: Real-time analytics visualization

#### Security Measures
- **Input Validation**: Sanitize all user inputs and URLs
- **Rate Limiting**: Prevent abuse with configurable limits
- **Access Control**: Role-based permissions for QR operations
- **Audit Logging**: Complete audit trail for compliance
- **Encryption**: Secure storage of sensitive data

### Integration Points

#### Gallery Integration
- QR codes displayed alongside regular gallery content
- Scan count badges for visual feedback
- Direct integration with existing gallery UI

#### Payment System Integration
- QR codes can link to payment pages
- Track conversion from scan to payment
- Analytics integration with Razorpay data

#### Analytics Integration
- Google Analytics integration for QR tracking
- Custom events for scan tracking
- Conversion funnel analysis

### Performance Considerations

#### Optimization Strategies
- **Lazy Loading**: QR codes loaded on demand
- **Caching**: QR code images cached for performance
- **Compression**: Optimized image formats and sizes
- **Batch Processing**: Efficient bulk operations

#### Monitoring
- **Scan Rate Monitoring**: Track scanning patterns
- **Performance Metrics**: Response times and error rates
- **Security Alerts**: Automated alerts for suspicious activity
- **Usage Analytics**: Track feature adoption and usage

### Usage Examples

#### Creating Individual QR Code
```typescript
const qrCode = await QRCodeService.generateQRCode({
  title: 'Player Registration',
  description: 'Register for SSPL T10 Tournament',
  targetUrl: 'https://ssplt10.co.in/register',
  channelId: 'website',
  templateId: 'classic',
  expiresAt: '2025-12-31T23:59:59Z',
  maxScans: 1000,
  tags: ['registration', 'main']
});
```

#### Bulk QR Code Generation
```typescript
const bulkRequest = {
  qrCodes: [
    {
      title: 'Website Registration',
      targetUrl: 'https://ssplt10.co.in/register',
      channelId: 'website',
      templateId: 'classic',
      tags: ['registration', 'website']
    },
    {
      title: 'Social Media Campaign',
      targetUrl: 'https://ssplt10.co.in/social',
      channelId: 'social-media',
      templateId: 'colored',
      tags: ['social', 'campaign']
    },
    {
      title: 'Email Newsletter',
      targetUrl: 'https://ssplt10.co.in/newsletter',
      channelId: 'email-marketing',
      templateId: 'compact',
      tags: ['email', 'newsletter']
    }
  ],
  options: {
    batchSize: 5,
    skipDuplicates: true,
    notifyOnComplete: true
  }
};

const bulkResult = await QRCodeService.bulkGenerateQRCodes(bulkRequest);
console.log(`Generated ${bulkResult.summary.successful} QR codes successfully`);
```

#### Bulk Download QR Codes
```typescript
const qrCodes = await QRCodeService.getQRCodes();
const successfulQRCodes = qrCodes.qrCodes.filter(qr => qr.isActive);

await QRCodeService.bulkDownloadQRCodes(
  successfulQRCodes,
  'png',
  {
    filename: `bulk_qr_codes_${new Date().toISOString().split('T')[0]}`,
    includeMetadata: true
  }
);
```

#### Tracking Analytics by Channel
```typescript
const analytics = await QRCodeService.getQRAnalytics(qrCodeId, {
  startDate: '2025-01-01',
  endDate: '2025-12-31'
});

// Analytics include channel information
console.log('Channel:', analytics.qrCode?.channelName);
console.log('Total Scans:', analytics.summary.totalScans);
console.log('Top Country:', analytics.summary.topCountry);
```

### Future Enhancements

#### Planned Features
- **Dynamic QR Codes**: Update target URLs without regenerating
- **Advanced Bulk Operations**: Template-based bulk generation with CSV import
- **Advanced Analytics**: Heat maps, conversion funnels, and predictive analytics
- **Mobile App**: Native QR scanning with offline capabilities
- **API Integration**: Third-party marketing and analytics integrations
- **Campaign Management**: Multi-channel campaign tracking and optimization

#### Scalability Considerations
- **Database Sharding**: Handle high scan volumes and bulk operations
- **CDN Integration**: Global QR code distribution with edge caching
- **Caching Layer**: Redis integration for performance and session management
- **Microservices**: Separate QR service for scalability and bulk processing
- **Queue System**: Background processing for large bulk operations
- **Load Balancing**: Distribute bulk generation across multiple instances

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Razorpay Integration Guide](https://razorpay.com/docs)

---

**Last Updated**: 2025-08-31
**Version**: 1.0.0
**Maintainer**: SSPL Development Team