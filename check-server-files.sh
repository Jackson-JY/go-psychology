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

send "ls -la /var/www/go-psychology/api/lib/\r"
expect "# "

send "ls -la /var/www/go-psychology/api/lib/*.ts 2>/dev/null | head -20\r"
expect "# "

send "cat /var/www/go-psychology/api/lib/bigFive.ts 2>/dev/null || echo 'bigFive.ts not found'\r"
expect "# "

send "exit\r"