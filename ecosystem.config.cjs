const path = require('path')

module.exports = {
  apps: [
    {
      name: 'go-psychology-api',
      script: 'node_modules/.bin/tsx',
      args: ['api/server.ts'],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: path.join(__dirname, 'logs/err.log'),
      out_file: path.join(__dirname, 'logs/out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
