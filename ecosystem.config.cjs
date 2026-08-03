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
      // 显式读取 .env 文件，PM2 默认不会读取
      env_file: path.join(__dirname, '.env'),
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: path.join(__dirname, 'logs/err.log'),
      out_file: path.join(__dirname, 'logs/out.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
