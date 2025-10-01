module.exports = {
  apps: [
    {
      name: "sspl-frontend",
      script: "./httpdocs/server.js",
      cwd: "/path/to/your/project", // Update this to your Linux deployment path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'http://localhost:3001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        BACKEND_URL: 'http://localhost:3001'
      },
      log_file: './logs/frontend-out.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
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
    {
      name: "sspl-backend",
      script: "./backend/backend/src/app.js",
      cwd: "/path/to/your/project", // Update this to your Linux deployment path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      log_file: './logs/backend-out.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
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
    }
  ]
};