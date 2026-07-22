#!/usr/bin/expect -f

set timeout 30

spawn ssh -o StrictHostKeyChecking=no root@39.106.208.109

expect {
  "password:" {
    send "Jackson@0214\r"
    exp_continue
  }
  "# " {}
}

send "cd /var/www/go-psychology && git log --oneline -3\r"
expect "# "

send "cat /usr/share/nginx/html/index.html | head -10\r"
expect "# "

send "ls -la /usr/share/nginx/html/assets/\r"
expect "# "

send "exit\r"