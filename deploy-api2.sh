#!/usr/bin/expect -f

set timeout 180

spawn ssh -o StrictHostKeyChecking=no root@39.106.208.109

expect {
  "password:" {
    send "Jackson@0214\r"
    exp_continue
  }
  "# " {}
}

send "cd /var/www/go-psychology && npm install && npm run build\r"
expect "# "

send "ls -la /var/www/go-psychology/dist-api/\r"
expect "# "

send "pm2 delete go-psychology-api 2>/dev/null; pm2 start dist-api/server.js --name go-psychology-api\r"
expect "# "

send "sleep 2 && pm2 status\r"
expect "# "

send "curl -s http://localhost/api/health\r"
expect "# "

send "echo 'API deployment completed'\r"
expect "# "

send "exit\r"