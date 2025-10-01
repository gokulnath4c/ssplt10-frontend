# SSPL Website - Performance Optimization Guide

This comprehensive guide covers performance optimization strategies for the SSPL Website, focusing on frontend, backend, database, and infrastructure optimizations.

## 📊 Performance Metrics

### Core Web Vitals

The SSPL Website aims to meet the following Core Web Vitals targets:

- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### Custom Performance Metrics

- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500 KB (gzipped)
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 50ms (average)

## 🏗️ Frontend Optimization

### Bundle Optimization

#### Code Splitting

```typescript
// src/App.tsx - Route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const Teams = lazy(() => import('./pages/Teams'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}
```

#### Dynamic Imports for Heavy Components

```typescript
// src/components/MatchStatistics.tsx
import { useState, lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

function MatchStatistics() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Show Statistics
      </button>
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

#### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev webpack-bundle-analyzer

# Analyze bundle
npm run build -- --analyze
```

### Image Optimization

#### WebP with Fallbacks

```typescript
// src/components/OptimizedImage.tsx
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fallbackSrc = src;

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && !imageError && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}

      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  );
}
```

#### Responsive Images

```typescript
// src/components/ResponsiveImage.tsx
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}

export function ResponsiveImage({ src, alt, sizes, className }: ResponsiveImageProps) {
  const baseSrc = src.replace(/\.(jpg|jpeg|png)$/i, '');
  const srcSet = `
    ${baseSrc}-320w.webp 320w,
    ${baseSrc}-640w.webp 640w,
    ${baseSrc}-1024w.webp 1024w,
    ${baseSrc}-1280w.webp 1280w
  `;

  return (
    <img
      src={`${baseSrc}-640w.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      className={className}
    />
  );
}
```

### Caching Strategies

#### Service Worker for Static Assets

```typescript
// public/sw.js
const CACHE_NAME = 'sspl-v1';
const STATIC_CACHE = 'sspl-static-v1';
const DYNAMIC_CACHE = 'sspl-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
  }

  // Cache API responses
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // Return cached version if offline
          return cache.match(request);
        });
      })
    );
  }
});
```

#### HTTP Caching Headers

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

location /api/ {
  add_header Cache-Control "public, max-age=300";
  add_header X-Cache-Status $upstream_cache_status;
}
```

### React Performance Optimization

#### Memoization

```typescript
// src/components/PlayerCard.tsx
import { memo, useMemo } from 'react';

interface PlayerCardProps {
  player: Player;
  onClick: (player: Player) => void;
}

const PlayerCard = memo(({ player, onClick }: PlayerCardProps) => {
  const playerStats = useMemo(() => {
    return {
      average: player.stats.runs / player.stats.matches,
      strikeRate: (player.stats.runs / player.stats.ballsFaced) * 100,
    };
  }, [player.stats]);

  const handleClick = useCallback(() => {
    onClick(player);
  }, [player, onClick]);

  return (
    <div onClick={handleClick}>
      <h3>{player.name}</h3>
      <p>Average: {playerStats.average.toFixed(2)}</p>
      <p>Strike Rate: {playerStats.strikeRate.toFixed(2)}</p>
    </div>
  );
});
```

#### Virtual Scrolling for Large Lists

```typescript
// src/components/VirtualizedPlayerList.tsx
import { FixedSizeList as List } from 'react-window';

interface VirtualizedPlayerListProps {
  players: Player[];
  height: number;
  itemSize: number;
}

export function VirtualizedPlayerList({ players, height, itemSize }: VirtualizedPlayerListProps) {
  const PlayerRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const player = players[index];
    return (
      <div style={style}>
        <PlayerCard player={player} />
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={players.length}
      itemSize={itemSize}
    >
      {PlayerRow}
    </List>
  );
}
```

#### React Query Optimization

```typescript
// src/hooks/usePlayers.ts
import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '../services/playerService';

export function usePlayers(filters?: PlayerFilters) {
  return useQuery({
    queryKey: ['players', filters],
    queryFn: () => getPlayers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Background refetch for fresh data
    refetchInterval: 30 * 1000, // 30 seconds
    // Prefetch adjacent pages
    keepPreviousData: true,
  });
}
```

## 🗄️ Database Optimization

### Query Optimization

#### Indexing Strategy

```sql
-- Essential indexes for SSPL database
CREATE INDEX CONCURRENTLY idx_sspl_matches_date ON sspl_matches(date);
CREATE INDEX CONCURRENTLY idx_sspl_matches_season ON sspl_matches(season);
CREATE INDEX CONCURRENTLY idx_sspl_matches_teams ON sspl_matches(team_a_id, team_b_id);
CREATE INDEX CONCURRENTLY idx_sspl_players_team_id ON sspl_players(team_id);
CREATE INDEX CONCURRENTLY idx_sspl_players_name ON sspl_players(name);
CREATE INDEX CONCURRENTLY idx_sspl_news_published ON sspl_news(published_date);
CREATE INDEX CONCURRENTLY idx_sspl_standings_season ON sspl_standings(season);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_sspl_matches_season_date ON sspl_matches(season, date);
CREATE INDEX CONCURRENTLY idx_sspl_players_stats ON sspl_players((stats->>'runs'), (stats->>'wickets'));
```

#### Query Optimization Examples

```sql
-- Optimized player search query
SELECT p.*, t.name as team_name
FROM sspl_players p
JOIN sspl_teams t ON p.team_id = t.id
WHERE p.name ILIKE $1
ORDER BY p.name
LIMIT 20;

-- Optimized match results query
SELECT m.*,
       t1.name as team_a_name,
       t2.name as team_b_name,
       t1.logo as team_a_logo,
       t2.logo as team_b_logo
FROM sspl_matches m
JOIN sspl_teams t1 ON m.team_a_id = t1.id
JOIN sspl_teams t2 ON m.team_b_id = t2.id
WHERE m.season = $1
  AND m.result = 'completed'
ORDER BY m.date DESC, m.time DESC
LIMIT 50;
```

#### Connection Pooling

```typescript
// src/lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}
```

### Database Monitoring

#### Query Performance Monitoring

```sql
-- Create function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS event_trigger AS $$
DECLARE
  query_text text;
  execution_time interval;
BEGIN
  -- Get the query that triggered this event
  GET DIAGNOSTICS query_text = PG_CONTEXT;

  -- Log slow queries (>100ms)
  IF extract(epoch from clock_timestamp() - statement_timestamp()) > 0.1 THEN
    INSERT INTO query_performance_log (
      query,
      execution_time,
      timestamp
    ) VALUES (
      query_text,
      clock_timestamp() - statement_timestamp(),
      clock_timestamp()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create event trigger
CREATE EVENT TRIGGER slow_query_trigger
  ON sql_drop
  EXECUTE FUNCTION log_slow_queries();
```

#### Database Health Checks

```typescript
// src/services/healthCheck.ts
export async function checkDatabaseHealth() {
  const metrics = {
    connectionTime: 0,
    queryTime: 0,
    activeConnections: 0,
    totalConnections: 0,
  };

  const startTime = Date.now();

  try {
    // Test connection
    const connectionStart = Date.now();
    const client = await pool.connect();
    metrics.connectionTime = Date.now() - connectionStart;

    // Test simple query
    const queryStart = Date.now();
    await client.query('SELECT 1');
    metrics.queryTime = Date.now() - queryStart;

    // Get connection stats
    const stats = await client.query(`
      SELECT count(*) as active_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `);
    metrics.activeConnections = parseInt(stats.rows[0].active_connections);

    const totalStats = await client.query(`
      SELECT count(*) as total_connections
      FROM pg_stat_activity
    `);
    metrics.totalConnections = parseInt(totalStats.rows[0].total_connections);

    client.release();

    return {
      status: 'healthy',
      metrics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      metrics,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## ⚡ API Optimization

### Response Compression

```typescript
// src/middleware/compression.ts
import compression from 'compression';

export const compressionMiddleware = compression({
  level: 6, // Compression level (1-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  },
});
```

### API Response Caching

```typescript
// src/middleware/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default TTL

export function cacheMiddleware(ttl: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      cache.set(key, data, ttl);
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}
```

### Pagination Optimization

```typescript
// src/services/playerService.ts
export async function getPlayersPaginated(options: {
  page: number;
  limit: number;
  filters?: PlayerFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { page, limit, filters, sortBy = 'name', sortOrder = 'asc' } = options;
  const offset = (page - 1) * limit;

  // Build where clause dynamically
  const whereConditions = [];
  const queryParams = [];
  let paramIndex = 1;

  if (filters?.teamId) {
    whereConditions.push(`team_id = $${paramIndex}`);
    queryParams.push(filters.teamId);
    paramIndex++;
  }

  if (filters?.position) {
    whereConditions.push(`position = $${paramIndex}`);
    queryParams.push(filters.position);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM sspl_players
    ${whereClause}
  `;

  const totalResult = await query(countQuery, queryParams);
  const total = parseInt(totalResult.rows[0].total);

  // Get paginated results
  const dataQuery = `
    SELECT p.*, t.name as team_name
    FROM sspl_players p
    LEFT JOIN sspl_teams t ON p.team_id = t.id
    ${whereClause}
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  queryParams.push(limit, offset);
  const result = await query(dataQuery, queryParams);

  return {
    data: result.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}
```

### Rate Limiting

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limits for sensitive endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
  },
});
```

## 📊 Monitoring & Analytics

### Performance Monitoring Setup

```typescript
// src/utils/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
}

export function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  });
}

// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function trackWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

### Real User Monitoring (RUM)

```typescript
// src/services/monitoring.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 measurements
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  getPercentileMetric(name: string, percentile: number): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  reportMetrics() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {},
    };

    for (const [name, values] of this.metrics.entries()) {
      report.metrics[name] = {
        count: values.length,
        average: this.getAverageMetric(name),
        p95: this.getPercentileMetric(name, 95),
        p99: this.getPercentileMetric(name, 99),
      };
    }

    // Send to monitoring service
    this.sendToMonitoring(report);
  }

  private sendToMonitoring(report: any) {
    // Implement your monitoring service integration
    console.log('Performance Report:', report);
  }
}
```

### Error Tracking

```typescript
// src/services/errorTracking.ts
export class ErrorTracker {
  private errors: Error[] = [];

  trackError(error: Error, context?: any) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(error);

    // Send to error tracking service
    this.sendError(errorInfo);
  }

  private sendError(errorInfo: any) {
    // Implement your error tracking service integration
    console.error('Error tracked:', errorInfo);
  }

  getErrorSummary() {
    const summary = {
      totalErrors: this.errors.length,
      errorsByType: {},
      recentErrors: this.errors.slice(-10),
    };

    this.errors.forEach(error => {
      const type = error.name || 'Unknown';
      summary.errorsByType[type] = (summary.errorsByType[type] || 0) + 1;
    });

    return summary;
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  errorTracker.trackError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorTracker.trackError(new Error(event.reason), {
    type: 'unhandledrejection',
  });
});
```

## 🚀 Infrastructure Optimization

### CDN Configuration

```nginx
# nginx.conf for CDN optimization
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
  # Set cache headers
  expires 1y;
  add_header Cache-Control "public, immutable";

  # Enable gzip compression
  gzip on;
  gzip_types text/css application/javascript image/svg+xml;

  # CORS headers for CDN
  add_header Access-Control-Allow-Origin *;
  add_header Access-Control-Allow-Headers "X-Requested-With";
  add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

### Load Balancing

```nginx
# nginx.conf for load balancing
upstream sspl_backend {
  least_conn;
  server backend1.example.com:8080 weight=3;
  server backend2.example.com:8080 weight=2;
  server backend3.example.com:8080 weight=1;
  keepalive 32;
}

server {
  listen 80;
  server_name api.ssplt10.co.in;

  location / {
    proxy_pass http://sspl_backend;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Database Connection Optimization

```typescript
// src/lib/databasePool.ts
import { Pool } from 'pg';

export class DatabasePool {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      min: parseInt(process.env.DB_MIN_CONNECTIONS || '2'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      acquireTimeoutMillis: 60000,
      allowExitOnIdle: true,
    });

    this.setupPoolEvents();
  }

  private setupPoolEvents() {
    this.pool.on('connect', (client) => {
      console.log('New client connected to database');
    });

    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
    });

    this.pool.on('remove', (client) => {
      console.log('Client removed from pool');
    });
  }

  async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;

      // Log slow queries
      if (duration > 100) {
        console.warn(`Slow query (${duration}ms):`, text);
      }

      return result;
    } finally {
      client.release();
    }
  }

  async getStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  async close() {
    await this.pool.end();
  }
}
```

## 📈 Performance Budget

### Bundle Size Budget

```javascript
// package.json
{
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "analyze": "webpack-bundle-analyzer dist/static/js/*.js"
  },
  "bundlesize": [
    {
      "path": "./dist/static/js/*.js",
      "maxSize": "500 kB"
    },
    {
      "path": "./dist/static/css/*.css",
      "maxSize": "100 kB"
    }
  ]
}
```

### Performance Budget Configuration

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  // ... other config
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html)$/,
      threshold: 10240,
      minRatio: 0.8,
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
        },
      },
    },
  },
};
```

### Lighthouse Performance Budget

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: ['http://localhost:8080'],
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.8 }],
      },
    },
    budget: {
      resourceSizes: [
        {
          resourceType: 'total',
          budget: 500000, // 500 KB
        },
        {
          resourceType: 'script',
          budget: 200000, // 200 KB
        },
        {
          resourceType: 'stylesheet',
          budget: 50000, // 50 KB
        },
      ],
      resourceCounts: [
        {
          resourceType: 'third-party',
          budget: 10,
        },
      ],
    },
  },
};
```

## 🔍 Performance Testing

### Automated Performance Testing

```bash
# Install performance testing tools
npm install --save-dev lighthouse puppeteer artillery

# Run performance tests
npm run perf:test

# Generate performance report
npm run perf:report
```

### Performance Regression Testing

```typescript
// scripts/performance-regression.js
const puppeteer = require('puppeteer');
const { createRequire } = require('module');

async function runPerformanceTest() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    // Enable performance monitoring
    await page.setCacheEnabled(false);

    const metrics = {};

    // Measure page load
    const startTime = Date.now();
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
    metrics.pageLoadTime = Date.now() - startTime;

    // Measure Core Web Vitals
    const performanceMetrics = await page.evaluate(() => {
      const { performance } = window;
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      };
    });

    Object.assign(metrics, performanceMetrics);

    // Check bundle size
    const bundleStats = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts.reduce((total, script) => {
        // This is a simplified check - in reality you'd need to fetch and measure
        return total + (script.src.includes('bundle') ? 1 : 0);
      }, 0);
    });

    metrics.bundleCount = bundleStats;

    console.log('Performance Metrics:', metrics);

    // Compare with baseline
    const baseline = loadBaseline();
    const regression = checkRegression(metrics, baseline);

    if (regression) {
      console.error('Performance regression detected!');
      process.exit(1);
    }

  } finally {
    await browser.close();
  }
}

function loadBaseline() {
  // Load previous performance metrics
  return {};
}

function checkRegression(current, baseline) {
  // Implement regression detection logic
  return false;
}

runPerformanceTest();
```

## 📋 Performance Checklist

### Frontend Performance
- [ ] Bundle size under 500KB (gzipped)
- [ ] Code splitting implemented
- [ ] Images optimized (WebP, lazy loading)
- [ ] Critical CSS inlined
- [ ] Unused CSS/JS removed
- [ ] Service worker implemented
- [ ] CDN configured for static assets

### Backend Performance
- [ ] Database queries optimized
- [ ] Proper indexing implemented
- [ ] Connection pooling configured
- [ ] Caching strategy implemented
- [ ] API responses compressed
- [ ] Rate limiting configured

### Database Performance
- [ ] Query execution time < 50ms
- [ ] Proper indexing on all tables
- [ ] Connection pool optimized
- [ ] Query monitoring enabled
- [ ] Database health checks implemented

### Infrastructure Performance
- [ ] CDN configured
- [ ] Load balancing implemented
- [ ] SSL/TLS optimized
- [ ] HTTP/2 enabled
- [ ] Compression enabled

### Monitoring & Alerting
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] Core Web Vitals tracked
- [ ] Performance budgets set
- [ ] Automated alerts configured

---

**Last Updated**: 2025-08-31
**Performance Version**: 1.0.0