#!/usr/bin/expect -f

set timeout 120

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

send "cd /tmp/go-full && git push origin main\r"
expect "# "

send "rm -rf /var/www/go-psychology/* && cp -r /tmp/go-full/* /var/www/go-psychology/\r"
expect "# "

send "cd /var/www/go-psychology && npm run build\r"
expect "# "

send "rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/\r"
expect "# "

send "systemctl reload nginx\r"
expect "# "

send "cat /usr/share/nginx/html/index.html | grep script\r"
expect "# "

send "echo 'Full redeploy completed'\r"
expect "# "

send "exit\r"