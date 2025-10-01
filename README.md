# Southern Street Premier League (SSPL) - Reorganized Project

A comprehensive React + Node.js application for managing the Southern Street Premier League tournament system.

## 🏗️ Project Structure

```
/var/www/vhosts/ssplt10.cloud/
├── httpdocs/              # Frontend (React/Vite SPA)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env
│   ├── .env.preview
│   ├── .env.production
│   └── vite.config.ts
├── backend/               # Backend (Node.js/Express)
│   ├── src/
│   │   └── app.js
│   ├── package.json
│   ├── .env
│   ├── .env.preview
│   ├── .env.production
│   └── ecosystem.config.js
├── logs/                  # PM2 and application logs
├── deploy-scripts/        # Deployment automation
│   ├── deploy.sh
│   └── sync_env.sh
├── nginx.conf            # Nginx configuration
└── README.md
```

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Start development servers:**
   ```bash
   npm run dev:full
   ```
   This starts both frontend (port 5173) and backend (port 3001).

### Environment-Specific Commands

- **Development:** `npm run dev`
- **Preview:** `npm run build:preview`
- **Production:** `npm run build:production`

## 🌍 Environments

### Development
- **Domain:** `http://localhost:3001`
- **Frontend:** `http://localhost:5173`
- **API:** `http://localhost:3001/api`

### Preview
- **Domain:** `https://preview.ssplt10.cloud`
- **API:** `https://preview.ssplt10.cloud/api`

### Production
- **Domain:** `https://www.ssplt10.cloud`
- **API:** `https://www.ssplt10.cloud/api`

## 📋 Deployment

### Automated Deployment

```bash
# Deploy to production
./deploy-scripts/deploy.sh production

# Deploy to preview
./deploy-scripts/deploy.sh preview

# Sync environment files
./deploy-scripts/sync_env.sh production
```

### Manual Deployment Steps

1. **Build frontend:**
   ```bash
   cd httpdocs
   npm run build:production
   ```

2. **Deploy frontend:**
   ```bash
   sudo cp -r httpdocs/dist/* /var/www/vhosts/ssplt10.cloud/httpdocs/
   ```

3. **Deploy backend:**
   ```bash
   cd backend
   npm ci --production
   pm2 start ecosystem.config.js --env production
   pm2 save
   ```

4. **Reload Nginx:**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env files)
- `NODE_ENV`: Environment name
- `PORT`: Backend port (3001)
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `DOMAIN`: Application domain
- `VITE_API_URL`: API base URL
- `VITE_SUPABASE_*`: Supabase configuration

#### Frontend (.env files)
- `VITE_API_URL`: API endpoint
- `VITE_SUPABASE_*`: Supabase configuration
- `VITE_RAZORPAY_KEY_ID`: Razorpay public key
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

### PM2 Process Management

```bash
# Start backend
pm2 start backend/ecosystem.config.js --env production

# View logs
pm2 logs sspl-backend

# Monitor processes
pm2 monit

# Restart
pm2 restart sspl-backend
```

### Nginx Configuration

The `nginx.conf` file includes:
- SSL/TLS configuration
- SPA routing with `try_files`
- API proxy to backend
- Rate limiting
- Security headers
- Separate configurations for production and preview

## 📊 Monitoring & Logs

### PM2 Logs
- `logs/pm2-backend-out.log`: Standard output
- `logs/pm2-backend-error.log`: Error logs

### Nginx Logs
- `/var/log/nginx/ssplt10_access.log`: Access logs
- `/var/log/nginx/ssplt10_error.log`: Error logs

### Health Checks
- **Backend:** `GET /health`
- **PM2:** `pm2 status`
- **Nginx:** `sudo systemctl status nginx`

## 🔒 Security Features

- Rate limiting on API endpoints
- Security headers (CSP, HSTS, etc.)
- CORS configuration
- Input validation
- Environment variable validation

## 🧪 Testing

```bash
# Run frontend tests
npm run --workspace=httpdocs test

# Run backend tests
npm run --workspace=backend test
```

## 📝 API Documentation

### Endpoints
- `POST /api/create-order`: Create Razorpay order
- `POST /api/verify-payment`: Verify payment
- `GET /api/health`: Health check

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Deploy to preview environment
5. Create pull request

## 📞 Support

For issues or questions:
1. Check PM2 logs: `pm2 logs sspl-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/ssplt10_error.log`
3. Verify environment variables
4. Test API endpoints with curl

## 📋 Deployment Checklist

- ✅ Build frontend for target environment
- ✅ Copy dist/ to httpdocs/
- ✅ Install backend dependencies
- ✅ Sync environment variables
- ✅ Start/restart PM2 process
- ✅ Verify PM2 logs
- ✅ Reload Nginx
- ✅ Test SPA routing
- ✅ Verify API endpoints
- ✅ Check environment variables
- ✅ Monitor logs

## 🔄 Updates

When updating the application:
1. Update environment variables if needed
2. Run deployment script
3. Verify health checks
4. Monitor logs for errors
5. Test critical user flows
