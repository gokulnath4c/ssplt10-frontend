module.exports = {
  apps: [
    // Blue Environment - Frontend
    {
      name: "sspl-blue-frontend",
      script: "./httpdocs/server.js",
      cwd: "/var/www/vhosts/ssplt10.cloud/blue/current",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'http://localhost:3001',
        ENVIRONMENT: 'blue'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'http://localhost:3001',
        ENVIRONMENT: 'blue'
      },
      log_file: '/var/www/vhosts/ssplt10.cloud/logs/blue-frontend-out.log',
      out_file: '/var/www/vhosts/ssplt10.cloud/logs/blue-frontend-out.log',
      error_file: '/var/www/vhosts/ssplt10.cloud/logs/blue-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      // Health check configuration
      health_check: {
        enabled: true,
        url: 'http://localhost:3000/health/detailed',
        interval: 30000, // Check every 30 seconds
        timeout: 5000, // 5 second timeout
        unhealthy_threshold: 3, // Mark unhealthy after 3 failures
        healthy_threshold: 2 // Mark healthy after 2 successes
      }
    },

    // Blue Environment - Backend
    {
      name: "sspl-blue-backend",
      script: "./backend/backend/src/app.js",
      cwd: "/var/www/vhosts/ssplt10.cloud/blue/current",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ENVIRONMENT: 'blue'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        ENVIRONMENT: 'blue'
      },
      log_file: '/var/www/vhosts/ssplt10.cloud/logs/blue-backend-out.log',
      out_file: '/var/www/vhosts/ssplt10.cloud/logs/blue-backend-out.log',
      error_file: '/var/www/vhosts/ssplt10.cloud/logs/blue-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      // Health check configuration
      health_check: {
        enabled: true,
        url: 'http://localhost:3001/health/detailed',
        interval: 30000, // Check every 30 seconds
        timeout: 5000, // 5 second timeout
        unhealthy_threshold: 3, // Mark unhealthy after 3 failures
        healthy_threshold: 2 // Mark healthy after 2 successes
      }
    },

    // Green Environment - Frontend
    {
      name: "sspl-green-frontend",
      script: "./httpdocs/server.js",
      cwd: "/var/www/vhosts/ssplt10.cloud/green/current",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        BACKEND_URL: 'http://localhost:4001',
        ENVIRONMENT: 'green'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        BACKEND_URL: 'http://localhost:4001',
        ENVIRONMENT: 'green'
      },
      log_file: '/var/www/vhosts/ssplt10.cloud/logs/green-frontend-out.log',
      out_file: '/var/www/vhosts/ssplt10.cloud/logs/green-frontend-out.log',
      error_file: '/var/www/vhosts/ssplt10.cloud/logs/green-frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      // Health check configuration
      health_check: {
        enabled: true,
        url: 'http://localhost:4000/health/detailed',
        interval: 30000, // Check every 30 seconds
        timeout: 5000, // 5 second timeout
        unhealthy_threshold: 3, // Mark unhealthy after 3 failures
        healthy_threshold: 2 // Mark healthy after 2 successes
      }
    },

    // Green Environment - Backend
    {
      name: "sspl-green-backend",
      script: "./backend/backend/src/app.js",
      cwd: "/var/www/vhosts/ssplt10.cloud/green/current",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 4001,
        ENVIRONMENT: 'green'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4001,
        ENVIRONMENT: 'green'
      },
      log_file: '/var/www/vhosts/ssplt10.cloud/logs/green-backend-out.log',
      out_file: '/var/www/vhosts/ssplt10.cloud/logs/green-backend-out.log',
      error_file: '/var/www/vhosts/ssplt10.cloud/logs/green-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      // Health check configuration
      health_check: {
        enabled: true,
        url: 'http://localhost:4001/health/detailed',
        interval: 30000, // Check every 30 seconds
        timeout: 5000, // 5 second timeout
        unhealthy_threshold: 3, // Mark unhealthy after 3 failures
        healthy_threshold: 2 // Mark healthy after 2 successes
      }
    }
  ],

  // Deployment configuration
  deploy: {
    production: {
      user: 'root',
      host: '62.72.43.74',
      ref: 'origin/main',
      repo: 'git@github.com:your-org/sspl.git',
      path: '/var/www/vhosts/ssplt10.cloud',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem-blue-green.config.cjs',
      'pre-setup': ''
    }
  }
};