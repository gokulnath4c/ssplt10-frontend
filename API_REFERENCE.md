# SSPL Website - API Reference

## 📡 Supabase Edge Functions

### Payment Functions

#### `create-razorpay-order`

Creates a new Razorpay payment order for player registration.

**Endpoint**: `POST /functions/v1/create-razorpay-order`

**Authentication**: Required (Supabase Auth)

**Request Body**:
```json
{
  "amount": 300000
}
```

**Parameters**:
- `amount` (number, required): Amount in rupees (will be converted to paise)

**Response** (Success - 200)**:
```json
{
  "id": "order_KV4RJWNWG7CKA8",
  "entity": "order",
  "amount": 30000000,
  "amount_paid": 0,
  "amount_due": 30000000,
  "currency": "INR",
  "receipt": "sspl_1643723423",
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1643723423
}
```

**Response** (Error - 400)**:
```json
{
  "error": "Invalid amount provided"
}
```

**Error Codes**:
- `400`: Invalid amount or missing parameters
- `500`: Server error or Razorpay API failure

---

### QR Code Functions

#### `generate-qr-code`

Creates a new QR code with custom settings and templates.

**Endpoint**: `POST /functions/v1/generate-qr-code`

**Authentication**: Required (Supabase Auth)

**Request Body**:
```json
{
  "title": "Player Registration",
  "description": "Register for SSPL T10 Tournament",
  "targetUrl": "https://ssplt10.co.in/register",
  "templateId": "classic",
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxScans": 1000,
  "tags": ["registration", "main"],
  "metadata": {
    "campaign": "season-2025",
    "source": "website"
  }
}
```

**Parameters**:
- `title` (string, required): QR code title
- `description` (string, optional): QR code description
- `targetUrl` (string, required): URL the QR code should redirect to
- `templateId` (string, optional): Template to use for QR code styling
- `expiresAt` (string, optional): Expiration date in ISO format
- `maxScans` (number, optional): Maximum number of scans allowed
- `tags` (string[], optional): Tags for categorization
- `metadata` (object, optional): Additional metadata

**Response** (Success - 200)**:
```json
{
  "success": true,
  "qrCode": {
    "id": "uuid",
    "code": "SSPL-1643723423-abc123",
    "title": "Player Registration",
    "description": "Register for SSPL T10 Tournament",
    "targetUrl": "https://ssplt10.co.in/register",
    "qrDataUrl": "data:image/png;base64,...",
    "qrSvg": "<svg>...</svg>",
    "isActive": true,
    "expiresAt": "2025-12-31T23:59:59Z",
    "maxScans": 1000,
    "currentScans": 0,
    "tags": ["registration", "main"],
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

**Response** (Error - 400)**:
```json
{
  "success": false,
  "error": "Title and target URL are required"
}
```

**Error Codes**:
- `400`: Invalid input data or missing required fields
- `401`: Unauthorized - Invalid authentication
- `500`: Server error or QR code generation failure

---

#### `track-qr-scan`

Tracks QR code scans and redirects users to target URLs.

**Endpoint**: `GET /functions/v1/track-qr-scan?code={qrCode}&source={source}`

**Authentication**: Not required (public endpoint)

**Query Parameters**:
- `code` (string, required): QR code identifier
- `source` (string, optional): Scan source (e.g., 'gallery', 'social')

**Response** (Success - 302)**:
```
HTTP/1.1 302 Found
Location: https://ssplt10.co.in/register
Cache-Control: no-cache
```

**Response** (Error - 400)**:
```json
{
  "success": false,
  "error": "QR code not found or expired"
}
```

**Error Codes**:
- `400`: Invalid QR code or QR code not found
- `410`: QR code expired or scan limit exceeded
- `500`: Server error

---

#### `get-qr-analytics`

Retrieves analytics data for QR code scans.

**Endpoint**: `GET /functions/v1/get-qr-analytics`

**Authentication**: Required (Supabase Auth)

**Query Parameters**:
- `qrCodeId` (string, required): QR code identifier
- `startDate` (string, optional): Start date for analytics (ISO format)
- `endDate` (string, optional): End date for analytics (ISO format)
- `limit` (number, optional): Maximum number of scan records to return

**Response** (Success - 200)**:
```json
{
  "success": true,
  "analytics": [
    {
      "id": "uuid",
      "qrCodeId": "uuid",
      "scannedAt": "2025-01-01T12:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "referrer": "https://ssplt10.co.in/gallery",
      "locationData": {
        "ip": "192.168.1.1",
        "country": "India",
        "city": "Chennai"
      },
      "deviceInfo": {
        "browser": "Chrome",
        "os": "Android",
        "isMobile": true,
        "isTablet": false,
        "isDesktop": false
      },
      "scanSource": "gallery"
    }
  ],
  "summary": {
    "totalScans": 150,
    "uniqueIPs": 120,
    "topBrowser": "Chrome",
    "topOS": "Android",
    "topCountry": "India",
    "avgScansPerDay": 5.0
  },
  "trends": [
    {
      "date": "2025-01-01",
      "scans": 10
    },
    {
      "date": "2025-01-02",
      "scans": 15
    }
  ]
}
```

**Response** (Error - 403)**:
```json
{
  "success": false,
  "error": "Access denied: not the owner"
}
```

**Error Codes**:
- `400`: Invalid parameters
- `401`: Unauthorized
- `403`: Forbidden - Not the QR code owner
- `500`: Server error

---

#### `manage-qr-codes`

Manages QR codes (CRUD operations).

**Endpoint**: `GET|POST|PUT|DELETE /functions/v1/manage-qr-codes`

**Authentication**: Required (Supabase Auth)

**GET Parameters**:
- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Items per page
- `search` (string, optional): Search term for title/description
- `category` (string, optional): Filter by category
- `isActive` (boolean, optional): Filter by active status

**GET Response** (Success - 200)**:
```json
{
  "success": true,
  "qrCodes": [
    {
      "id": "uuid",
      "code": "SSPL-1643723423-abc123",
      "title": "Player Registration",
      "description": "Register for SSPL T10 Tournament",
      "targetUrl": "https://ssplt10.co.in/register",
      "isActive": true,
      "currentScans": 45,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**POST Body**: Same as `generate-qr-code`

**PUT Parameters**:
- `id` (string, required): QR code ID to update

**PUT Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "isActive": false,
  "tags": ["updated", "tag"]
}
```

**DELETE Parameters**:
- `id` (string, required): QR code ID to delete

**Response** (Error - 400)**:
```json
{
  "success": false,
  "error": "QR code ID is required"
}
```

**Error Codes**:
- `400`: Invalid input or missing parameters
- `401`: Unauthorized
- `403`: Forbidden - Not the QR code owner
- `404`: QR code not found
- `500`: Server error

---

### Bulk QR Code Functions

#### `bulk-generate-qr-codes`

Generates multiple QR codes in a single batch operation with channel mapping support.

**Endpoint**: `POST /functions/v1/bulk-generate-qr-codes`

**Authentication**: Required (Supabase Auth)

**Request Body**:
```json
{
  "qrCodes": [
    {
      "title": "Player Registration - Main",
      "description": "Main registration page for SSPL T10",
      "targetUrl": "https://ssplt10.co.in/register",
      "channelId": "website",
      "templateId": "classic",
      "expiresAt": "2025-12-31T23:59:59Z",
      "maxScans": 1000,
      "tags": ["registration", "main", "2025"],
      "metadata": {
        "campaign": "season-2025",
        "source": "bulk-generation"
      }
    },
    {
      "title": "Social Media Campaign",
      "description": "Instagram campaign QR code",
      "targetUrl": "https://ssplt10.co.in/social",
      "channelId": "social-media",
      "templateId": "colored",
      "tags": ["social", "instagram"],
      "metadata": {
        "platform": "instagram",
        "campaign": "follow-us"
      }
    }
  ],
  "options": {
    "batchSize": 5,
    "skipDuplicates": true,
    "notifyOnComplete": true
  }
}
```

**Parameters**:
- `qrCodes` (array, required): Array of QR code configurations
  - `title` (string, required): QR code title
  - `description` (string, optional): QR code description
  - `targetUrl` (string, required): URL the QR code should redirect to
  - `channelId` (string, required): Channel identifier for mapping
  - `templateId` (string, optional): Template to use for QR code styling
  - `expiresAt` (string, optional): Expiration date in ISO format
  - `maxScans` (number, optional): Maximum number of scans allowed
  - `tags` (string[], optional): Tags for categorization
  - `metadata` (object, optional): Additional metadata
- `options` (object, optional): Bulk operation options
  - `batchSize` (number, optional): Number of QR codes to process per batch (default: 10)
  - `skipDuplicates` (boolean, optional): Skip duplicate URLs (default: true)
  - `notifyOnComplete` (boolean, optional): Send notification on completion (default: false)

**Response** (Success - 200)**:
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "qrCode": {
        "id": "uuid",
        "code": "SSPL-1643723423-abc123",
        "title": "Player Registration - Main",
        "description": "Main registration page for SSPL T10",
        "targetUrl": "https://ssplt10.co.in/register",
        "channelId": "website",
        "channelName": "Website",
        "qrDataUrl": "data:image/png;base64,...",
        "qrSvg": "<svg>...</svg>",
        "isActive": true,
        "expiresAt": "2025-12-31T23:59:59Z",
        "maxScans": 1000,
        "currentScans": 0,
        "tags": ["registration", "main", "2025"],
        "createdAt": "2025-01-01T00:00:00Z"
      },
      "index": 0
    },
    {
      "success": true,
      "qrCode": {
        "id": "uuid",
        "code": "SSPL-1643723424-def456",
        "title": "Social Media Campaign",
        "description": "Instagram campaign QR code",
        "targetUrl": "https://ssplt10.co.in/social",
        "channelId": "social-media",
        "channelName": "Social Media",
        "qrDataUrl": "data:image/png;base64,...",
        "qrSvg": "<svg>...</svg>",
        "isActive": true,
        "currentScans": 0,
        "tags": ["social", "instagram"],
        "createdAt": "2025-01-01T00:00:00Z"
      },
      "index": 1
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "processingTime": 1250
  }
}
```

**Response** (Partial Success - 200)**:
```json
{
  "success": false,
  "results": [
    {
      "success": true,
      "qrCode": { ... },
      "index": 0
    },
    {
      "success": false,
      "error": "Channel not found",
      "index": 1
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "processingTime": 850
  }
}
```

**Response** (Error - 400)**:
```json
{
  "success": false,
  "error": "Maximum 100 QR codes allowed per request"
}
```

**Error Codes**:
- `400`: Invalid input data, missing required fields, or exceeds limits
- `401`: Unauthorized - Invalid authentication
- `403`: Forbidden - Insufficient permissions
- `429`: Too many requests - Rate limit exceeded
- `500`: Server error or database failure

**Rate Limits**:
- Maximum 100 QR codes per request
- Maximum 10 concurrent bulk operations per user
- Processing timeout: 30 seconds

---

#### Bulk Download QR Codes

**Endpoint**: `POST /functions/v1/bulk-download-qr-codes`

**Authentication**: Required (Supabase Auth)

**Request Body**:
```json
{
  "qrCodeIds": ["uuid1", "uuid2", "uuid3"],
  "format": "png",
  "filename": "bulk_qr_codes_2025",
  "includeMetadata": true
}
```

**Parameters**:
- `qrCodeIds` (string[], required): Array of QR code IDs to download
- `format` (string, optional): Download format ('png', 'svg', 'pdf') - default: 'png'
- `filename` (string, optional): Custom filename for the download
- `includeMetadata` (boolean, optional): Include metadata in download - default: true

**Response** (Success - 200)**:
```json
{
  "success": true,
  "downloadUrl": "https://temp-storage.example.com/bulk_qr_codes_2025.zip",
  "expiresAt": "2025-01-01T01:00:00Z",
  "fileCount": 3,
  "totalSize": 2457600
}
```

---

## 🗄️ Database Tables & Operations

#### `verify-razorpay-payment`

Verifies the payment signature after successful payment.

**Endpoint**: `POST /functions/v1/verify-razorpay-payment`

**Authentication**: Required (Supabase Auth)

**Request Body**:
```json
{
  "paymentId": "pay_KV4RJWNWG7CKA9",
  "orderId": "order_KV4RJWNWG7CKA8",
  "signature": "b6f6..."
}
```

**Parameters**:
- `paymentId` (string, required): Razorpay payment ID
- `orderId` (string, required): Razorpay order ID
- `signature` (string, required): Payment signature from Razorpay

**Response** (Success - 200)**:
```json
{
  "verified": true
}
```

**Response** (Error - 400)**:
```json
{
  "error": "Invalid signature"
}
```

## 🗄️ Database Tables & Operations

### Teams (`sspl_teams`)

**Structure**:
```sql
CREATE TABLE sspl_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  logo TEXT,
  founded_year INTEGER,
  home_ground VARCHAR(255),
  captain VARCHAR(255),
  coach VARCHAR(255),
  owner VARCHAR(255),
  website VARCHAR(500),
  social_media JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Common Operations**:

**Get All Teams**:
```sql
SELECT * FROM sspl_teams ORDER BY name;
```

**Get Team with Players**:
```sql
SELECT t.*, json_agg(p.*) as players
FROM sspl_teams t
LEFT JOIN sspl_players p ON t.id = p.team_id
WHERE t.id = $1
GROUP BY t.id;
```

---

### Players (`sspl_players`)

**Structure**:
```sql
CREATE TABLE sspl_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  team_id UUID REFERENCES sspl_teams(id) ON DELETE CASCADE,
  position VARCHAR(50) NOT NULL,
  jersey_number INTEGER,
  date_of_birth DATE,
  nationality VARCHAR(100),
  batting_style VARCHAR(50),
  bowling_style VARCHAR(100),
  debut_date DATE,
  stats JSONB DEFAULT '{
    "matches": 0,
    "runs": 0,
    "wickets": 0,
    "centuries": 0,
    "fifties": 0,
    "highest_score": 0,
    "best_bowling": "",
    "average": 0.0,
    "strike_rate": 0.0
  }',
  is_captain BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Common Operations**:

**Get Top Batsmen**:
```sql
SELECT name, team_id, stats->>'runs' as runs,
       stats->>'average' as average
FROM sspl_players
WHERE is_active = true
ORDER BY (stats->>'runs')::int DESC
LIMIT 10;
```

**Get Player Statistics**:
```sql
SELECT * FROM sspl_players
WHERE id = $1;
```

---

### Matches (`sspl_matches`)

**Structure**:
```sql
CREATE TABLE sspl_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_number INTEGER NOT NULL,
  season VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  team_a_id UUID REFERENCES sspl_teams(id),
  team_b_id UUID REFERENCES sspl_teams(id),
  team_a_score JSONB,
  team_b_score JSONB,
  winner_id UUID REFERENCES sspl_teams(id),
  result VARCHAR(20) DEFAULT 'upcoming',
  toss_winner VARCHAR(255),
  toss_decision VARCHAR(10),
  man_of_the_match VARCHAR(255),
  match_type VARCHAR(20) DEFAULT 'league',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Common Operations**:

**Get Upcoming Matches**:
```sql
SELECT m.*, t1.name as team_a_name, t2.name as team_b_name
FROM sspl_matches m
JOIN sspl_teams t1 ON m.team_a_id = t1.id
JOIN sspl_teams t2 ON m.team_b_id = t2.id
WHERE m.result = 'upcoming'
ORDER BY m.date, m.time;
```

**Get Match Results**:
```sql
SELECT m.*, t1.name as team_a_name, t2.name as team_b_name,
       tw.name as winner_name
FROM sspl_matches m
JOIN sspl_teams t1 ON m.team_a_id = t1.id
JOIN sspl_teams t2 ON m.team_b_id = t2.id
LEFT JOIN sspl_teams tw ON m.winner_id = tw.id
WHERE m.result = 'completed'
ORDER BY m.date DESC;
```

---

### Standings (`sspl_standings`)

**Structure**:
```sql
CREATE TABLE sspl_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES sspl_teams(id) ON DELETE CASCADE,
  season VARCHAR(20) NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  net_run_rate DECIMAL(5,3) DEFAULT 0.000,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Common Operations**:

**Get League Table**:
```sql
SELECT s.*, t.name, t.logo
FROM sspl_standings s
JOIN sspl_teams t ON s.team_id = t.id
WHERE s.season = $1
ORDER BY s.position;
```

---

### News (`sspl_news`)

**Structure**:
```sql
CREATE TABLE sspl_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  author VARCHAR(255) NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50) DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Common Operations**:

**Get Featured News**:
```sql
SELECT * FROM sspl_news
WHERE is_featured = true
ORDER BY published_date DESC
LIMIT 5;
```

**Get News by Category**:
```sql
SELECT * FROM sspl_news
WHERE category = $1
ORDER BY published_date DESC;
```

---

### Tournaments (`sspl_tournaments`)

**Structure**:
```sql
CREATE TABLE sspl_tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  season VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming',
  total_teams INTEGER NOT NULL,
  total_matches INTEGER NOT NULL,
  winner UUID REFERENCES sspl_teams(id),
  runner_up UUID REFERENCES sspl_teams(id),
  venue VARCHAR(255) NOT NULL,
  prize_money DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### QR Codes (`sspl_qr_codes`)

**Structure**:
```sql
CREATE TABLE sspl_qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  qr_data_url TEXT,
  qr_svg TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_scans INTEGER,
  current_scans INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Common Operations**:

**Get Active QR Codes**:
```sql
SELECT * FROM sspl_qr_codes
WHERE is_active = true
  AND (expires_at IS NULL OR expires_at > NOW())
  AND (max_scans IS NULL OR current_scans < max_scans)
ORDER BY created_at DESC;
```

**Get QR Code by Code**:
```sql
SELECT * FROM sspl_qr_codes
WHERE code = $1 AND is_active = true;
```

**Update Scan Count**:
```sql
UPDATE sspl_qr_codes
SET current_scans = current_scans + 1
WHERE id = $1 AND (max_scans IS NULL OR current_scans < max_scans);
```

---

### QR Analytics (`sspl_qr_analytics`)

**Structure**:
```sql
CREATE TABLE sspl_qr_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES sspl_qr_codes(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  location_data JSONB,
  device_info JSONB,
  session_id VARCHAR(255),
  scan_source VARCHAR(50) DEFAULT 'direct'
);
```

**Common Operations**:

**Get Scan Analytics**:
```sql
SELECT
  DATE(scanned_at) as scan_date,
  COUNT(*) as scan_count,
  COUNT(DISTINCT ip_address) as unique_visitors
FROM sspl_qr_analytics
WHERE qr_code_id = $1
  AND scanned_at >= $2
  AND scanned_at <= $3
GROUP BY DATE(scanned_at)
ORDER BY scan_date;
```

**Get Top Browsers**:
```sql
SELECT
  device_info->>'browser' as browser,
  COUNT(*) as scan_count
FROM sspl_qr_analytics
WHERE qr_code_id = $1
  AND device_info->>'browser' IS NOT NULL
GROUP BY device_info->>'browser'
ORDER BY scan_count DESC
LIMIT 10;
```

---

### QR Categories (`sspl_qr_categories`)

**Structure**:
```sql
CREATE TABLE sspl_qr_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'tag',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### QR Templates (`sspl_qr_templates`)

**Structure**:
```sql
CREATE TABLE sspl_qr_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  preview_image TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### QR Access Logs (`sspl_qr_access_logs`)

**Structure**:
```sql
CREATE TABLE sspl_qr_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code_id UUID REFERENCES sspl_qr_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Authentication & Authorization

### Supabase Auth Integration

**Sign Up**:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

**Sign In**:
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

**Sign Out**:
```javascript
const { error } = await supabase.auth.signOut();
```

### Row Level Security (RLS) Policies

**Public Read Access**:
```sql
ALTER TABLE sspl_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for teams" ON sspl_teams
  FOR SELECT USING (true);
```

**Admin Write Access**:
```sql
CREATE POLICY "Admin write access for teams" ON sspl_teams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

## 📊 Real-time Subscriptions

### Match Updates
```javascript
const subscription = supabase
  .channel('match_updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'sspl_matches' },
    (payload) => {
      console.log('Match updated:', payload);
    }
  )
  .subscribe();
```

### Standings Updates
```javascript
const subscription = supabase
  .channel('standings_updates')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'sspl_standings' },
    (payload) => {
      console.log('Standings updated:', payload);
    }
  )
  .subscribe();
```

## ⚡ Rate Limiting & Performance

### Edge Function Limits
- **Execution Time**: 25 seconds (Edge Functions)
- **Memory**: 128 MB
- **Request Size**: 6 MB
- **Response Size**: 6 MB

### Database Performance
- **Connection Pooling**: Automatic via Supabase
- **Query Optimization**: Use indexes for frequent queries
- **Caching**: Implement appropriate caching strategies

## 🚨 Error Handling

### Common Error Codes

**Authentication Errors**:
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions

**Database Errors**:
- `23505`: Unique violation
- `23503`: Foreign key violation
- `23502`: Not null violation

**Payment Errors**:
- `PAYMENT_FAILED`: Payment processing failed
- `INVALID_SIGNATURE`: Payment signature verification failed

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

**Last Updated**: 2025-08-31
**API Version**: 1.0.0