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

send "lsof -i :80 -i :443 2>/dev/null || netstat -tlnp 2>/dev/null | grep -E ':80|:443'\r"
expect "# "

send "killall nginx 2>/dev/null; sleep 1\r"
expect "# "

send "nginx\r"
expect "# "

send "sleep 2 && ps aux | grep nginx\r"
expect "# "

send "curl -s -o /dev/null -w '%{http_code}' http://localhost\r"
expect "# "

send "exit\r"