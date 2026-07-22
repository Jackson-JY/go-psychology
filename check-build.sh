#!/usr/bin/expect -f

set timeout 120

spawn ssh -o StrictHostKeyChecking=no root@39.106.208.109

expect {
  "password:" {
    send "Jackson@0214\r"
    exp_continue
  }
  "# " {}
}

send "cd /var/www/go-psychology && ls -la index.html 2>/dev/null || echo 'index.html not found'\r"
expect "# "

send "npm run build 2>&1 | tail -50\r"
expect "# "

send "exit\r"