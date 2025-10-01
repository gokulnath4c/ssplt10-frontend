# SSPL Website - Security Guide

This comprehensive security guide covers all aspects of securing the SSPL Website, including authentication, data protection, infrastructure security, and compliance requirements.

## 🔐 Security Overview

### Security Principles

The SSPL Website follows these core security principles:

- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum required permissions for all operations
- **Fail-Safe Defaults**: Secure defaults with explicit opt-in for risky features
- **Zero Trust**: Never trust, always verify
- **Security by Design**: Security considerations in all development phases

### Security Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Backend       │
│   (React)       │◄──►│   (Supabase)    │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • JWT Tokens    │    │ • Auth Policies │    │ • RLS Policies  │
│ • CSRF Protection│   │ • Rate Limiting │   │ • Encryption     │
│ • XSS Prevention │   │ • Input Validation│  │ • Audit Logging │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Monitoring    │    │   Logging       │
│   (PostgreSQL)  │    │   & Alerting    │    │   & Auditing    │
│                 │    │                 │    │                 │
│ • Encryption    │    │ • SIEM          │    │ • Security Logs │
│ • Access Control│    │ • Threat Detection│  │ • Compliance    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔑 Authentication & Authorization

### Supabase Authentication

#### User Registration

```typescript
// src/services/authService.ts
import { supabase } from '../integrations/supabase/client';

export class AuthService {
  async signUp(email: string, password: string, userData: any) {
    // Validate input
    this.validateEmail(email);
    this.validatePassword(password);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          role: 'user', // Default role
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      throw new AuthError(error.message, error.status);
    }

    // Send verification email
    await this.sendVerificationEmail(email);

    return data;
  }

  async signIn(email: string, password: string) {
    // Rate limiting check
    await this.checkRateLimit(email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log failed attempt
      await this.logFailedAttempt(email);
      throw new AuthError('Invalid credentials', 401);
    }

    // Log successful login
    await this.logSuccessfulLogin(data.user.id);

    return data;
  }

  private validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  private validatePassword(password: string) {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain uppercase, lowercase, and number');
    }
  }

  private async checkRateLimit(identifier: string) {
    // Implement rate limiting logic
  }

  private async logFailedAttempt(email: string) {
    // Log to security audit table
  }

  private async logSuccessfulLogin(userId: string) {
    // Log successful authentication
  }
}
```

#### Password Policies

```sql
-- Supabase password policy configuration
ALTER TABLE auth.users
ADD CONSTRAINT password_policy
CHECK (
  char_length(encrypted_password) >= 8 AND
  encrypted_password ~ '[A-Z]' AND
  encrypted_password ~ '[a-z]' AND
  encrypted_password ~ '[0-9]'
);
```

#### Multi-Factor Authentication (MFA)

```typescript
// src/components/MFAVerification.tsx
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export function MFAVerification({ user, onVerified }: MFAVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId: user.factors[0].id,
        code,
      });

      if (error) throw error;

      onVerified(data);
    } catch (error) {
      console.error('MFA verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-verification">
      <h3>Enter Verification Code</h3>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
      />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  );
}
```

### Role-Based Access Control (RBAC)

#### Database Schema for Roles

```sql
-- Create roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create permissions table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  UNIQUE(role, resource, action)
);

-- Insert default permissions
INSERT INTO role_permissions (role, resource, action) VALUES
('admin', 'users', 'create'),
('admin', 'users', 'read'),
('admin', 'users', 'update'),
('admin', 'users', 'delete'),
('admin', 'matches', 'manage'),
('moderator', 'news', 'create'),
('moderator', 'news', 'update'),
('user', 'profile', 'read'),
('user', 'profile', 'update');
```

#### Permission Checking

```typescript
// src/hooks/usePermissions.ts
import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = async (resource: string, action: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const userRoles = data.map(r => r.role);

      const { data: permissions, error: permError } = await supabase
        .from('role_permissions')
        .select('*')
        .in('role', userRoles)
        .eq('resource', resource)
        .eq('action', action);

      return permissions && permissions.length > 0;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    return user?.user_metadata?.role === role;
  };

  return { hasPermission, hasRole };
}
```

### Session Management

```typescript
// src/services/sessionService.ts
export class SessionService {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  static async validateSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session) return false;

      const now = Date.now();
      const expiresAt = new Date(session.expires_at!).getTime();

      // Check if session is expired
      if (now >= expiresAt) {
        await this.refreshSession();
        return true;
      }

      // Refresh if close to expiry
      if (expiresAt - now <= this.REFRESH_THRESHOLD) {
        await this.refreshSession();
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Session refresh failed:', error);
      // Redirect to login
      window.location.href = '/auth';
    }

    return data;
  }

  static async logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout failed:', error);
    }

    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to home
    window.location.href = '/';
  }
}
```

## 🛡️ Data Protection

### Encryption at Rest

#### Database Encryption

```sql
-- Enable encryption for sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted player data table
CREATE TABLE encrypted_player_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_ssn TEXT, -- Encrypted Social Security Number
  encrypted_bank_details TEXT, -- Encrypted banking information
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encryption functions
CREATE OR REPLACE FUNCTION encrypt_data(data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(encrypt(data::bytea, key::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data TEXT, key TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN convert_from(decrypt(decode(encrypted_data, 'hex'), key::bytea, 'aes'), 'utf8');
END;
$$ LANGUAGE plpgsql;
```

#### Application-Level Encryption

```typescript
// src/services/encryptionService.ts
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static readonly ALGORITHM = 'AES';
  private static readonly KEY_SIZE = 256;

  static encrypt(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  static decrypt(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static generateKey(): string {
    return CryptoJS.lib.WordArray.random(this.KEY_SIZE / 8).toString();
  }

  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString();
  }

  static generateSecureToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
}
```

### Data Sanitization

```typescript
// src/utils/sanitization.ts
import DOMPurify from 'dompurify';

export class SanitizationService {
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: [],
    });
  }

  static sanitizeSqlInput(input: string): string {
    // Remove potentially dangerous characters
    return input.replace(/['";\\]/g, '');
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  }

  static escapeHtml(text: string): string {
    const htmlEscapes = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#x27;',
      '/': '&#x2F;',
    };

    return text.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
  }
}
```

### Input Validation

```typescript
// src/validation/schemas.ts
import { z } from 'zod';

export const userRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format'),
});

export const playerRegistrationSchema = z.object({
  position: z.enum(['batsman', 'bowler', 'all-rounder', 'wicket-keeper']),
  jerseyNumber: z.number()
    .int()
    .min(1)
    .max(999)
    .optional(),
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 50;
    }, 'Player must be between 18 and 50 years old'),
});

export const paymentSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(100000, 'Amount too large'),
  currency: z.literal('INR'),
  description: z.string()
    .max(255, 'Description too long')
    .optional(),
});
```

## 🌐 Web Security

### Content Security Policy (CSP)

```typescript
// src/middleware/csp.ts
export const cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://js.stripe.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);
  next();
};
```

### Cross-Site Request Forgery (CSRF) Protection

```typescript
// src/middleware/csrf.ts
import crypto from 'crypto';

export class CSRFProtection {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static validateToken(sessionToken: string, requestToken: string): boolean {
    if (!sessionToken || !requestToken) return false;

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(sessionToken, 'hex'),
      Buffer.from(requestToken, 'hex')
    );
  }
}

// Middleware
export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const sessionToken = req.session.csrfToken;
  const requestToken = req.body._csrf || req.headers['x-csrf-token'];

  if (!CSRFProtection.validateToken(sessionToken, requestToken)) {
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }

  next();
};
```

### Cross-Site Scripting (XSS) Prevention

```typescript
// src/components/SafeHtml.tsx
import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }, [html]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
```

### Secure Headers

```typescript
// src/middleware/securityHeaders.ts
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS (HTTP Strict Transport Security)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Permissions policy
  res.setHeader('Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self)'
  );

  next();
};
```

## 🔒 API Security

### Rate Limiting

```typescript
// src/middleware/rateLimit.ts
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000),
    });
  }
};

// Stricter limits for sensitive endpoints
export const authRateLimit = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 5, // 5 attempts
  duration: 60 * 15, // Per 15 minutes
});

export const paymentRateLimit = new RateLimiterMemory({
  keyPrefix: 'payment',
  points: 10, // 10 payment attempts
  duration: 60 * 60, // Per hour
});
```

### API Key Management

```typescript
// src/services/apiKeyService.ts
import crypto from 'crypto';

export class APIKeyService {
  static generateAPIKey(): string {
    return 'sk_' + crypto.randomBytes(32).toString('hex');
  }

  static hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  static async validateAPIKey(apiKey: string): Promise<boolean> {
    const hashedKey = this.hashAPIKey(apiKey);

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, revoked')
      .eq('key_hash', hashedKey)
      .eq('revoked', false)
      .single();

    if (error || !data) return false;

    // Log API key usage
    await this.logAPIKeyUsage(data.id);

    return true;
  }

  static async revokeAPIKey(apiKeyId: string, userId: string) {
    const { error } = await supabase
      .from('api_keys')
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
        revoked_by: userId,
      })
      .eq('id', apiKeyId);

    if (error) throw error;
  }

  private static async logAPIKeyUsage(apiKeyId: string) {
    await supabase
      .from('api_key_usage')
      .insert({
        api_key_id: apiKeyId,
        timestamp: new Date().toISOString(),
        endpoint: 'current_endpoint', // From request context
      });
  }
}
```

### Request Validation

```typescript
// src/middleware/requestValidation.ts
import { z } from 'zod';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      next(error);
    }
  };
};

// Usage
app.post('/api/players',
  validateRequest(playerRegistrationSchema),
  createPlayerHandler
);
```

## 📊 Security Monitoring

### Audit Logging

```typescript
// src/services/auditService.ts
export class AuditService {
  static async logEvent(event: AuditEvent) {
    const auditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user_id: event.userId,
      action: event.action,
      resource: event.resource,
      resource_id: event.resourceId,
      details: event.details,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      session_id: event.sessionId,
    };

    // Store in audit table
    await supabase
      .from('audit_logs')
      .insert(auditEntry);

    // Send to security monitoring service
    await this.sendToSecurityMonitor(auditEntry);
  }

  static async getAuditTrail(userId: string, options: AuditQueryOptions) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', options.startDate)
      .lte('timestamp', options.endDate)
      .order('timestamp', { ascending: false })
      .limit(options.limit || 100);

    if (error) throw error;
    return data;
  }

  private static async sendToSecurityMonitor(entry: any) {
    // Implement integration with security monitoring service
    console.log('Security event logged:', entry);
  }
}

// Usage
await AuditService.logEvent({
  userId: user.id,
  action: 'LOGIN',
  resource: 'auth',
  details: { success: true },
  ipAddress: req.ip,
  userAgent: req.get('User-Agent'),
  sessionId: session.id,
});
```

### Security Dashboard

```typescript
// src/components/SecurityDashboard.tsx
import { useEffect, useState } from 'react';

export function SecurityDashboard() {
  const [securityMetrics, setSecurityMetrics] = useState(null);

  useEffect(() => {
    fetchSecurityMetrics();
  }, []);

  const fetchSecurityMetrics = async () => {
    const response = await fetch('/api/security/metrics');
    const data = await response.json();
    setSecurityMetrics(data);
  };

  return (
    <div className="security-dashboard">
      <h2>Security Overview</h2>

      <div className="metrics-grid">
        <div className="metric">
          <h3>Failed Login Attempts</h3>
          <span className="value">{securityMetrics?.failedLogins || 0}</span>
        </div>

        <div className="metric">
          <h3>Suspicious Activities</h3>
          <span className="value">{securityMetrics?.suspiciousActivities || 0}</span>
        </div>

        <div className="metric">
          <h3>Active Sessions</h3>
          <span className="value">{securityMetrics?.activeSessions || 0}</span>
        </div>

        <div className="metric">
          <h3>Security Alerts</h3>
          <span className="value">{securityMetrics?.alerts || 0}</span>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Security Events</h3>
        {/* Display recent security events */}
      </div>
    </div>
  );
}
```

## 🚨 Incident Response

### Security Incident Response Plan

```typescript
// src/services/incidentResponse.ts
export class IncidentResponseService {
  static async reportIncident(incident: SecurityIncident) {
    // Log the incident
    await this.logIncident(incident);

    // Assess severity
    const severity = this.assessSeverity(incident);

    // Notify appropriate teams
    await this.notifyTeams(incident, severity);

    // Take immediate actions
    await this.takeImmediateActions(incident, severity);

    // Create incident ticket
    const ticketId = await this.createIncidentTicket(incident);

    return { ticketId, severity };
  }

  private static assessSeverity(incident: SecurityIncident): 'low' | 'medium' | 'high' | 'critical' {
    if (incident.type === 'data_breach') return 'critical';
    if (incident.type === 'unauthorized_access') return 'high';
    if (incident.type === 'suspicious_activity') return 'medium';
    return 'low';
  }

  private static async notifyTeams(incident: SecurityIncident, severity: string) {
    const notifications = [];

    if (severity === 'critical') {
      notifications.push(
        this.notifySecurityTeam(incident),
        this.notifyManagement(incident),
        this.notifyLegal(incident)
      );
    } else if (severity === 'high') {
      notifications.push(
        this.notifySecurityTeam(incident),
        this.notifyDevOps(incident)
      );
    }

    await Promise.all(notifications);
  }

  private static async takeImmediateActions(incident: SecurityIncident, severity: string) {
    if (severity === 'critical') {
      // Lock down systems
      await this.lockdownSystems();

      // Revoke all active sessions
      await this.revokeAllSessions();
    } else if (severity === 'high') {
      // Block suspicious IPs
      await this.blockSuspiciousIPs(incident.ipAddress);

      // Enable additional monitoring
      await this.enableEnhancedMonitoring();
    }
  }

  private static async createIncidentTicket(incident: SecurityIncident): Promise<string> {
    // Create ticket in incident management system
    const ticketId = `INC-${Date.now()}`;

    // Store incident details
    await supabase
      .from('security_incidents')
      .insert({
        ticket_id: ticketId,
        ...incident,
        status: 'open',
        created_at: new Date().toISOString(),
      });

    return ticketId;
  }
}
```

### Security Checklist

#### Development Phase
- [ ] Input validation implemented
- [ ] Authentication required for sensitive operations
- [ ] Authorization checks in place
- [ ] Data encryption for sensitive information
- [ ] Secure coding practices followed
- [ ] Security testing completed

#### Deployment Phase
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] SSL/TLS certificates valid
- [ ] Firewall rules configured
- [ ] Access controls implemented
- [ ] Monitoring and logging enabled

#### Maintenance Phase
- [ ] Regular security updates applied
- [ ] Security monitoring active
- [ ] Incident response plan tested
- [ ] Security audits conducted
- [ ] Compliance requirements met

---

**Last Updated**: 2025-08-31
**Security Version**: 1.0.0