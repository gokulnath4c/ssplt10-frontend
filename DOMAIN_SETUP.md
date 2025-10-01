# Domain Configuration Guide for www.ssplt10.cloud

## Overview
This guide covers configuring your domain www.ssplt10.cloud to point to your deployed application.

## Prerequisites
- Domain registered with a domain registrar (GoDaddy, Namecheap, etc.)
- Application deployed to a hosting platform
- Access to domain DNS settings

## DNS Configuration

### Step 1: Access Domain DNS Settings
1. Log in to your domain registrar account
2. Navigate to DNS management for www.ssplt10.cloud
3. Remove any existing A, CNAME, or ALIAS records for www

### Step 2: Configure DNS Records

#### For Heroku Deployment
```
Type: CNAME
Name: www
Value: your-app-name.herokuapp.com
TTL: 3600 (or default)
```

#### For Vercel Deployment
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

#### For DigitalOcean App Platform
```
Type: CNAME
Name: www
Value: your-app-name.ondigitalocean.app
TTL: 3600
```

#### For Railway Deployment
```
Type: CNAME
Name: www
Value: your-app-name.up.railway.app
TTL: 3600
```

### Step 3: Root Domain Configuration (Optional)
If you want ssplt10.cloud to also point to your app:

#### Option A: Redirect (Recommended)
Set up a redirect from ssplt10.cloud to www.ssplt10.cloud

#### Option B: Point to same app
```
Type: A
Name: @
Value: [Your hosting platform's IP or CNAME]
```

## SSL Certificate Setup

### Automatic SSL (Most Platforms)
- **Heroku**: Automatic SSL for custom domains
- **Vercel**: Automatic SSL included
- **DigitalOcean**: Automatic SSL included
- **Railway**: Automatic SSL included

### Manual SSL (If Required)
1. Generate SSL certificate from Let's Encrypt or your CA
2. Upload certificate to your hosting platform
3. Configure SSL settings

## Verification Steps

### 1. DNS Propagation Check
Use these tools to verify DNS propagation:
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)
- Command line: `nslookup www.ssplt10.cloud`

### 2. SSL Certificate Check
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- Browser address bar (should show secure lock icon)

### 3. Application Access Test
```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://www.ssplt10.cloud

# Test HTTPS
curl -I https://www.ssplt10.cloud

# Test health endpoint
curl https://www.ssplt10.cloud/health
```

## Troubleshooting

### DNS Issues

#### Problem: Domain not resolving
**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Check DNS records are correct
3. Clear local DNS cache: `ipconfig /flushdns` (Windows)

#### Problem: www subdomain not working
**Solution:**
1. Ensure CNAME record is for "www" not "@"
2. Check TTL settings
3. Verify hosting platform domain configuration

### SSL Issues

#### Problem: SSL certificate not valid
**Solution:**
1. Check domain ownership verification
2. Ensure DNS is fully propagated
3. Contact hosting platform support

#### Problem: Mixed content warnings
**Solution:**
1. Ensure all resources load over HTTPS
2. Update any hardcoded HTTP URLs in code
3. Check for external resources loading over HTTP

### Application Issues

#### Problem: 502 Bad Gateway
**Solution:**
1. Check application logs
2. Verify environment variables are set
3. Ensure application is running

#### Problem: CORS errors
**Solution:**
1. Update CORS origins in server.js
2. Include both www.ssplt10.cloud and ssplt10.cloud

## Advanced Configuration

### CDN Setup (Optional)
For better performance, consider using a CDN:
1. **Cloudflare**: Point domain to Cloudflare, then to your app
2. **AWS CloudFront**: Set up distribution
3. **Akamai**: Enterprise solution

### Load Balancing (For High Traffic)
1. Set up multiple app instances
2. Configure load balancer
3. Update DNS with load balancer IP

### Monitoring & Alerts
1. Set up uptime monitoring (UptimeRobot, Pingdom)
2. Configure error alerting
3. Monitor SSL certificate expiration

## Security Considerations

1. **HTTPS Only**: Redirect all HTTP traffic to HTTPS
2. **HSTS Header**: Add HTTP Strict Transport Security
3. **Security Headers**: Configure security headers in your application
4. **Regular Updates**: Keep SSL certificates updated

## Support Contacts

- **Domain Registrar**: Contact your domain provider support
- **Hosting Platform**: Use platform-specific documentation
- **SSL Certificate**: Let's Encrypt community or CA support

## Quick Reference

### DNS Record Types
- **A Record**: Points domain to IP address
- **CNAME**: Points domain to another domain
- **ALIAS/ANAME**: Similar to CNAME but for root domain

### Common TTL Values
- 300 seconds (5 minutes) - For testing
- 3600 seconds (1 hour) - Standard
- 86400 seconds (24 hours) - For stable configurations

### Testing Commands
```bash
# Check DNS
nslookup www.ssplt10.cloud

# Check SSL
openssl s_client -connect www.ssplt10.cloud:443

# Test application
curl -k https://www.ssplt10.cloud/health