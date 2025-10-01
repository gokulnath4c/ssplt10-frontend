# SSPL Website - Deployment Guide

## 🚀 Deployment Overview

This guide covers the deployment process for the SSPL Website across different environments using the Lovable platform and Supabase.

## 📋 Prerequisites

### Required Accounts
- **Lovable Account**: For hosting and deployment
- **Supabase Account**: For backend services
- **Razorpay Account**: For payment processing
- **Google Analytics**: For analytics tracking
- **Git Repository**: GitHub, GitLab, or Bitbucket

### System Requirements
- Node.js 18+ and npm
- Git
- Supabase CLI (optional, for local development)

## 🏗️ Environment Setup

### 1. Supabase Configuration

#### Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `sspl-website`
   - **Database Password**: Generate a strong password
   - **Region**: Select appropriate region (e.g., `us-east-1`)

#### Database Setup
1. **Run Migrations**:
   ```bash
   # Connect to your Supabase project
   supabase link --project-ref YOUR_PROJECT_REF

   # Push migrations
   supabase db push
   ```

2. **Environment Variables**:
   In Supabase Dashboard → Settings → API:
   - Copy `Project URL`
   - Copy `anon/public` key
   - Copy `service_role` key (keep secret)

#### Edge Functions Setup
1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Deploy Edge Functions**:
   ```bash
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF

   # Deploy functions
   supabase functions deploy create-razorpay-order
   supabase functions deploy verify-razorpay-payment
   ```

4. **Set Function Secrets**:
   ```bash
   # Set Razorpay credentials
   supabase secrets set RAZORPAY_KEY_ID=your_razorpay_key_id
   supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

### 2. Razorpay Configuration

1. **Create Razorpay Account**:
   - Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Complete KYC verification

2. **Get API Keys**:
   - **Test Mode**: Use for development
   - **Live Mode**: Use for production
   - Copy `Key ID` and `Key Secret`

### 3. Google Analytics Setup

1. **Create GA4 Property**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create new GA4 property for SSPL Website

2. **Get Tracking ID**:
   - Property → Data Streams → Web
   - Copy `Measurement ID` (format: G-XXXXXXXXXX)

## 🌐 Lovable Deployment

### Method 1: Direct Deployment

1. **Connect Repository**:
   - Set up your Git repository on GitHub/GitLab
   - Configure CI/CD pipeline for automated deployment
   - Set up deployment environment (AWS, Vercel, Netlify, etc.)

2. **Configure Build Settings**:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "nodeVersion": "18"
   }
   ```

3. **Environment Variables**:
   In Lovable Dashboard → Project Settings → Environment:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

4. **Deploy**:
   - Click **"Deploy"** button
   - Monitor deployment logs
   - Access your live site

### Method 2: Git-based Deployment

1. **Push Code to Repository**:
   ```bash
   git add .
   git commit -m "Deploy: Update SSPL website"
   git push origin main
   ```

2. **Automatic Deployment**:
   - Lovable automatically detects changes
   - Runs build process
   - Deploys to production

## 🔧 Environment-Specific Configurations

### Development Environment

**Supabase Project**: `sspl-dev`
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_GA_TRACKING_ID=G-DEVXXXXXXX
NODE_ENV=development
```

### Staging Environment

**Supabase Project**: `sspl-staging`
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
VITE_GA_TRACKING_ID=G-STAGINGXXXXXXX
NODE_ENV=staging
```

### Production Environment

**Supabase Project**: `sspl-prod`
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx
VITE_GA_TRACKING_ID=G-PRODXXXXXXX
NODE_ENV=production
```

## 📊 Database Migration Strategy

### Migration Files Structure
```
supabase/migrations/
├── 20250830043145_initial_setup.sql
├── 20250830043340_auth_setup.sql
├── 20250831000000_create_sspl_tables.sql
└── 20250831010000_seed_data.sql
```

### Running Migrations
```bash
# For development
supabase db reset

# For production
supabase db push
```

### Backup Strategy
1. **Automatic Backups**: Supabase provides daily backups
2. **Manual Backups**: Before major changes
3. **Data Export**: Regular data exports for analytics

## 🔒 Security Configuration

### Supabase Security
1. **Row Level Security (RLS)**:
   ```sql
   ALTER TABLE sspl_teams ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Public read" ON sspl_teams FOR SELECT USING (true);
   ```

2. **Service Role Key**: Keep secret, only for server-side operations

### Environment Variables Security
- Never commit secrets to version control
- Use different keys for each environment
- Rotate keys regularly
- Monitor key usage

### Payment Security
- Use HTTPS only
- Validate payment signatures
- Implement proper error handling
- Regular security audits

## 📈 Monitoring & Analytics

### Application Monitoring
1. **Lovable Analytics**: Built-in performance monitoring
2. **Google Analytics**: User behavior tracking
3. **Supabase Dashboard**: Database performance metrics

### Error Tracking
```javascript
// Error boundary implementation
import { ErrorBoundary } from 'react-error-boundary';

function logError(error, errorInfo) {
  // Send to error tracking service
  console.error('Error caught by boundary:', error, errorInfo);
}
```

### Performance Monitoring
- **Core Web Vitals**: Monitor in Google Search Console
- **Lighthouse Scores**: Regular performance audits
- **Bundle Size**: Monitor with `npm run build`

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
**Issue**: `npm run build` fails
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Verify environment variables
echo $VITE_SUPABASE_URL
```

#### Supabase Connection Issues
**Issue**: Unable to connect to Supabase
**Solution**:
```bash
# Check Supabase status
supabase status

# Verify project link
supabase link --project-ref YOUR_PROJECT_REF

# Test connection
supabase db health
```

#### Payment Integration Issues
**Issue**: Razorpay payments not working
**Solution**:
- Verify API keys are correct
- Check if keys match environment (test/live)
- Ensure webhook endpoints are configured
- Test with Razorpay dashboard

### Rollback Strategy
1. **Immediate Rollback**:
   ```bash
   git revert HEAD~1
   git push origin main
   ```

2. **Database Rollback**:
   ```sql
   -- Use Supabase backup restore
   -- Or run reverse migrations
   ```

3. **Environment-specific Rollback**:
   - Keep previous deployment active
   - Gradually route traffic
   - Monitor for issues

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Lovable
        run: |
          # Deployment command here
          echo "Deploying to production..."
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Dependency Updates**:
   ```bash
   npm audit
   npm update
   ```

2. **Security Patches**:
   - Monitor security advisories
   - Apply patches promptly

3. **Performance Optimization**:
   - Regular Lighthouse audits
   - Bundle size monitoring
   - Database query optimization

### Support Contacts
- **Supabase Support**: support@supabase.com
- **Razorpay Support**: support@razorpay.com
- **SSPL Development Team**: contact@ssplt10.co.in

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Payment integration tested
- [ ] Analytics tracking configured

### Deployment
- [ ] Code pushed to repository
- [ ] Build process completed successfully
- [ ] Application accessible
- [ ] Payment flow working
- [ ] Admin panel accessible

### Post-Deployment
- [ ] Smoke tests passed
- [ ] Performance metrics checked
- [ ] Error monitoring active
- [ ] Backup verified
- [ ] Team notified

---

**Last Updated**: 2025-08-31
**Deployment Version**: 1.0.0