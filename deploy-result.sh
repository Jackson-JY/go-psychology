#!/usr/bin/expect -f

set timeout 180

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/dist /Users/jackson/trae/go/dist-api root@39.106.208.109:/tmp/go-update

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

send "rm -rf /usr/share/nginx/html/* && cp -r /tmp/go-update/dist/* /usr/share/nginx/html/\r"
expect "# "

send "rm -rf /var/www/go-psychology/dist-api && cp -r /tmp/go-update/dist-api /var/www/go-psychology/\r"
expect "# "

send "killall nginx 2>/dev/null; sleep 1; nginx\r"
expect "# "

send "cd /var/www/go-psychology && pm2 delete go-psychology-api 2>/dev/null; pm2 start dist-api/api/server.js --name go-psychology-api\r"
expect "# "

send "sleep 3 && pm2 status\r"
expect "# "

send "curl -s http://localhost/api/health\r"
expect "# "

send "echo 'Result page update deployed'\r"
expect "# "

send "exit\r"