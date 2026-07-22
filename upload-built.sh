#!/usr/bin/expect -f

set timeout 180

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/dist /Users/jackson/trae/go/dist-api /Users/jackson/trae/go/api /Users/jackson/trae/go/shared /Users/jackson/trae/go/package.json root@39.106.208.109:/tmp/go-dist

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

send "rm -rf /usr/share/nginx/html/* && cp -r /tmp/go-dist/dist/* /usr/share/nginx/html/\r"
expect "# "

send "ls -la /usr/share/nginx/html/\r"
expect "# "

send "systemctl start nginx\r"
expect "# "

send "systemctl status nginx | head -5\r"
expect "# "

send "rm -rf /var/www/go-psychology && mkdir -p /var/www/go-psychology\r"
expect "# "

send "cp -r /tmp/go-dist/* /var/www/go-psychology/\r"
expect "# "

send "cd /var/www/go-psychology && npm install --omit=dev\r"
expect "# "

send "pm2 delete go-psychology-api 2>/dev/null; pm2 start dist-api/server.js --name go-psychology-api\r"
expect "# "

send "sleep 3 && pm2 status\r"
expect "# "

send "curl -s http://localhost/api/health\r"
expect "# "

send "echo 'Deployment completed'\r"
expect "# "

send "exit\r"