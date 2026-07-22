#!/usr/bin/expect -f

set timeout 300

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/. root@39.106.208.109:/tmp/go-full

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

send "rm -rf /var/www/go-psychology && mv /tmp/go-full /var/www/go-psychology\r"
expect "# "

send "cd /var/www/go-psychology && npm install\r"
expect "# "

send "npm run build\r"
expect "# "

send "rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/\r"
expect "# "

send "systemctl reload nginx\r"
expect "# "

send "pm2 delete go-psychology-api 2>/dev/null; pm2 start dist-api/server.js --name go-psychology-api\r"
expect "# "

send "sleep 3 && pm2 status\r"
expect "# "

send "curl -s http://localhost/api/health\r"
expect "# "

send "echo 'Full deployment completed'\r"
expect "# "

send "exit\r"