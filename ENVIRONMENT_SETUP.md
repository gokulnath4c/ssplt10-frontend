# SSPL Website - Environment Setup Guide

This guide provides detailed instructions for setting up development, staging, and production environments for the SSPL Website.

## 📋 Environment Overview

### Supported Environments

| Environment | Purpose | URL Pattern | Database |
|-------------|---------|-------------|----------|
| Development | Local development | `http://localhost:8080` | Local Supabase |
| Staging | Pre-production testing | `https://staging.ssplt10.co.in` | Staging Supabase |
| Production | Live application | `https://ssplt10.co.in` | Production Supabase |

## 🔧 Development Environment Setup

### Prerequisites

- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: Version 2.25.0 or higher
- **Supabase CLI**: Version 1.0.0 or higher
- **Visual Studio Code**: Recommended IDE

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/sspl-website.git
cd sspl-website

# Install dependencies
npm install

# Verify installation
npm --version
node --version
```

### 2. Supabase Local Development

#### Install Supabase CLI
```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verify installation
supabase --version
```

#### Start Local Supabase
```bash
# Initialize Supabase (if not already done)
supabase init

# Start local services
supabase start

# This will start:
# - PostgreSQL database on localhost:5432
# - Supabase API on localhost:54321
# - Supabase Studio on localhost:54323
```

#### Apply Database Migrations
```bash
# Apply all migrations
supabase db reset

# Or apply specific migrations
supabase migration up
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Razorpay Configuration (Test Keys)
VITE_RAZORPAY_KEY_ID=rzp_test_your_test_key_id

# Google Analytics (Development Property)
VITE_GA_TRACKING_ID=G-DEV12345678

# Application Configuration
NODE_ENV=development
VITE_APP_NAME="SSPL Development"
VITE_APP_VERSION=1.0.0
```

### 4. Razorpay Test Setup

1. **Create Razorpay Account**:
   - Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a new account
   - Complete basic verification

2. **Get Test API Keys**:
   - Go to Settings → API Keys
   - Copy the **Test Key ID**
   - Update your `.env` file

3. **Test Payment Flow**:
   - Use test card numbers from Razorpay documentation
   - All test payments will be in INR

### 5. Google Analytics Setup

1. **Create GA4 Property**:
   - Visit [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property for development
   - Get the **Measurement ID** (G-XXXXXXXXXX)

2. **Update Environment**:
   ```env
   VITE_GA_TRACKING_ID=G-YOUR_DEV_TRACKING_ID
   ```

### 6. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:8080

# Supabase Studio will be available at:
# http://localhost:54323
```

## 🧪 Staging Environment Setup

### Prerequisites

- Access to staging Supabase project
- Staging Razorpay account
- Staging domain/subdomain

### 1. Supabase Staging Project

```bash
# Link to staging project
supabase link --project-ref your-staging-project-ref

# Apply migrations
supabase db push

# Set environment secrets
supabase secrets set RAZORPAY_KEY_ID=rzp_test_staging_key
supabase secrets set RAZORPAY_KEY_SECRET=your_staging_secret
```

### 2. Staging Environment Variables

Create `.env.staging` file:

```env
# Supabase Staging
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_staging_anon_key

# Razorpay Staging
VITE_RAZORPAY_KEY_ID=rzp_test_staging_key_id

# Google Analytics Staging
VITE_GA_TRACKING_ID=G-STAGING123456

# Application
NODE_ENV=staging
VITE_APP_NAME="SSPL Staging"
VITE_APP_VERSION=1.0.0-staging
```

### 3. Build for Staging

```bash
# Build with staging configuration
npm run build:staging

# Or set environment and build
NODE_ENV=staging npm run build
```

## 🚀 Production Environment Setup

### Prerequisites

- Production Supabase project
- Live Razorpay account
- Production domain
- SSL certificate

### 1. Supabase Production Project

```bash
# Link to production project
supabase link --project-ref your-prod-project-ref

# Apply migrations carefully
supabase db push

# Set production secrets
supabase secrets set RAZORPAY_KEY_ID=rzp_live_prod_key
supabase secrets set RAZORPAY_KEY_SECRET=your_prod_secret
```

### 2. Production Environment Variables

Create `.env.production` file:

```env
# Supabase Production
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_prod_anon_key

# Razorpay Production
VITE_RAZORPAY_KEY_ID=rzp_live_prod_key_id

# Google Analytics Production
VITE_GA_TRACKING_ID=G-PROD123456

# Application
NODE_ENV=production
VITE_APP_NAME="Southern Street Premier League"
VITE_APP_VERSION=1.0.0
```

### 3. Razorpay Live Setup

1. **Upgrade to Live Account**:
   - Complete full KYC verification
   - Submit business documents
   - Wait for approval (usually 2-3 business days)

2. **Configure Live Keys**:
   - Get live API keys from dashboard
   - Update environment variables
   - Test live payments with small amounts

### 4. Domain Configuration

1. **DNS Setup**:
   ```
   Type: CNAME
   Name: www
   Value: ssplt10.co.in
   ```

2. **SSL Certificate**:
   - Lovable provides automatic SSL
   - Custom domain SSL through Lovable dashboard

## 🔐 Security Configuration

### Environment Variables Security

```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use different keys for each environment
# Rotate keys regularly
# Monitor key usage in Supabase dashboard
```

### Supabase Security

```sql
-- Enable Row Level Security
ALTER TABLE sspl_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sspl_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sspl_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON sspl_teams
  FOR SELECT USING (true);

CREATE POLICY "Admin full access" ON sspl_teams
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Payment Security

- Use HTTPS only in production
- Validate payment signatures server-side
- Implement proper error handling
- Regular security audits

## 📊 Monitoring Setup

### Application Monitoring

1. **Google Analytics**:
   - Track user behavior
   - Monitor conversion funnels
   - Set up custom events

2. **Supabase Monitoring**:
   - Database performance
   - API usage
   - Error rates

3. **Lovable Analytics**:
   - Application performance
   - Error tracking
   - User metrics

### Error Tracking

```typescript
// Error boundary setup
import { ErrorBoundary } from 'react-error-boundary';

function logError(error: Error, errorInfo: any) {
  // Send to error tracking service
  console.error('Application Error:', error, errorInfo);

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
  }
}
```

## 🧪 Testing Environments

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Integration Testing

```bash
# Test with Supabase
npm run test:integration

# Test payment flows
npm run test:payment
```

### E2E Testing

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

## 🔄 Environment Management

### Switching Environments

```bash
# Development
npm run dev

# Staging build
npm run build:staging

# Production build
npm run build:production
```

### Environment Validation

```typescript
// Validate environment configuration
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_RAZORPAY_KEY_ID',
  'VITE_GA_TRACKING_ID'
];

requiredEnvVars.forEach(envVar => {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

## 🚨 Troubleshooting

### Common Issues

#### Supabase Connection Issues
```bash
# Check Supabase status
supabase status

# Restart local Supabase
supabase stop
supabase start

# Check logs
supabase logs
```

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build

# Check for TypeScript errors
npm run type-check
```

#### Payment Integration Issues
- Verify API keys match environment
- Check Razorpay dashboard for errors
- Ensure webhook endpoints are configured
- Test with small amounts first

### Environment Reset

```bash
# Reset local Supabase
supabase db reset

# Clear all data and restart
rm -rf .env
npm install
```

## 📞 Support

### Getting Help

- **Documentation**: Check TECH_STACK.md and API_REFERENCE.md
- **Issues**: Create GitHub issues with detailed information
- **Discussions**: Use GitHub Discussions for questions

### Support Contacts

- **Supabase Support**: support@supabase.com
- **Razorpay Support**: support@razorpay.com
- **SSPL Development Team**: contact@ssplt10.co.in

---

## 📋 Environment Checklist

### Development Setup
- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Supabase CLI installed
- [ ] Local Supabase running
- [ ] Environment variables configured
- [ ] Development server running

### Staging Setup
- [ ] Staging Supabase project created
- [ ] Staging environment variables configured
- [ ] Staging domain configured
- [ ] Build process tested

### Production Setup
- [ ] Production Supabase project created
- [ ] Production environment variables configured
- [ ] Production domain configured
- [ ] SSL certificate active
- [ ] Live payment keys configured

---

**Last Updated**: 2025-08-31
**Environment Version**: 1.0.0