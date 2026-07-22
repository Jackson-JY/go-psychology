#!/usr/bin/expect -f

set timeout 180

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/api /Users/jackson/trae/go/shared /Users/jackson/trae/go/package.json /Users/jackson/trae/go/tsconfig.json root@39.106.208.109:/tmp/go-api

expect {
  "password:" {
    send "Jackson@0214\r"
    exp_continue
  }
  eof {}
}

spawn ssh -o StrictHostKeyChecking=no root@39.106.208.109

expect {
  "password:" {
    send "Jackson@0214\r"
    exp_continue
  }
  "# " {}
}

send "rm -rf /var/www/go-psychology && mkdir -p /var/www/go-psychology\r"
expect "# "

send "cp -r /tmp/go-api/* /var/www/go-psychology/\r"
expect "# "

send "cd /var/www/go-psychology && npm install --omit=dev && npm run build:api\r"
expect "# "

send "ls -la /var/www/go-psychology/api/lib/\r"
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