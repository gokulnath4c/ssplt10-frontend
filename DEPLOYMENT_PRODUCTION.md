# Production Deployment Guide for www.ssplt10.cloud

## Overview
This guide covers deploying your Node.js + Vite React application to production on the domain www.ssplt10.cloud.

## Prerequisites
- Node.js 18+ installed
- Git repository
- Domain name (www.ssplt10.cloud) configured
- Hosting platform account (Heroku, Vercel, DigitalOcean, etc.)

## Environment Setup

### 1. Environment Variables
Copy `.env.example` to `.env.production` and fill in your production values:

```bash
cp .env.example .env.production
```

**Important**: Replace all placeholder values with your actual production credentials:
- Razorpay live keys (not test keys)
- Supabase production project credentials
- Domain URL

### 2. Razorpay Configuration
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Switch to Live mode
3. Copy your Live Key ID and Secret
4. Update `.env.production` with live credentials

### 3. Supabase Configuration
1. Create a production Supabase project
2. Update the project ID, URL, and keys in `.env.production`

## Deployment Options

### Option 1: Heroku (Recommended for Node.js)

#### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Create Heroku App
```bash
heroku create your-app-name
```

#### 3. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set RAZORPAY_KEY_ID=rzp_live_your_key
heroku config:set RAZORPAY_KEY_SECRET=your_secret
heroku config:set PORT=3001
# Add other variables as needed
```

#### 4. Deploy
```bash
git push heroku main
```

#### 5. Domain Configuration
```bash
heroku domains:add www.ssplt10.cloud
```

### Option 2: Vercel (Frontend) + Railway/DigitalOcean (Backend)

#### Frontend Deployment (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy frontend: `vercel --prod`
3. Set domain: `vercel domains add www.ssplt10.cloud`

#### Backend Deployment (Railway)
1. Connect GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - Build command: `npm run build`
   - Start command: `npm start`
3. Set environment variables
4. Add custom domain: www.ssplt10.cloud

## Build Process

### Production Build
```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start production server
npm start
```

### Environment-Specific Builds
```bash
# Development
npm run dev

# Production
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

## Domain Configuration

### DNS Settings
Point your domain to the hosting platform:

**For Heroku:**
- CNAME: www.ssplt10.cloud → your-app.herokuapp.com

**For Vercel:**
- Configure in Vercel dashboard

**For DigitalOcean:**
- Add domain in App Platform settings

### SSL Certificate
Most platforms provide automatic SSL certificates. Ensure HTTPS is enabled.

## Monitoring & Maintenance

### Health Checks
Your application includes health check endpoints:
- `GET /health` - Server status and uptime

### Logs
- Heroku: `heroku logs --tail`
- Vercel: Dashboard logs
- DigitalOcean: App Platform logs

### Process Management
The application uses PM2 for process management in production environments.

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS Only**: Ensure all traffic uses HTTPS
3. **CORS**: Properly configured for your domain
4. **Rate Limiting**: Consider adding rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs
6. **Updates**: Keep dependencies updated

## Troubleshooting

### Common Issues

1. **Port Issues**: Ensure PORT environment variable is set
2. **CORS Errors**: Check allowed origins in server.js
3. **Build Failures**: Check Node.js version compatibility
4. **Environment Variables**: Verify all required variables are set

### Debug Commands
```bash
# Check environment
node -e "console.log(process.env)"

# Test server locally
NODE_ENV=production npm start

# Check health endpoint
curl https://www.ssplt10.cloud/health
```

## Performance Optimization

1. **Enable Compression**: Add compression middleware
2. **Caching**: Implement proper caching headers
3. **CDN**: Use CDN for static assets
4. **Database Optimization**: Monitor and optimize queries

## Backup & Recovery

1. **Database Backups**: Configure automatic Supabase backups
2. **Code Repository**: Keep code in Git
3. **Environment Config**: Document all environment variables

## Support

For issues related to:
- **Domain**: Contact your domain registrar
- **Hosting**: Check platform documentation
- **Application**: Review server logs and health checks