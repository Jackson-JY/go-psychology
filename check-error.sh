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

send "pm2 logs go-psychology-api --lines 30\r"
expect "# "

send "exit\r"