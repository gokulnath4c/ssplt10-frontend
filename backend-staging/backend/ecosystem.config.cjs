module.exports = {
  apps: [
    {
      name: "sspl-backend",
      script: "./src/app.js",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3001
      },
      env_preview: {
        NODE_ENV: "preview",
        PORT: 3001
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3001
      },
      error_file: "../logs/pm2-backend-error.log",
      out_file: "../logs/pm2-backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      autorestart: true,
      max_restarts: 10,
    },
    {
      name: "sspl-frontend",
      script: "../httpdocs/server.js",
      cwd: "../httpdocs",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_preview: {
        NODE_ENV: "preview",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000
      },
      error_file: "../logs/pm2-frontend-error.log",
      out_file: "../logs/pm2-frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      autorestart: true,
      max_restarts: 10,
    }
  ]
};