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

send "journalctl -xeu nginx.service | tail -20\r"
expect "# "

send "nginx -t\r"
expect "# "

send "exit\r"