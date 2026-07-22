#!/usr/bin/expect -f

set timeout 120

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/dist root@39.106.208.109:/tmp/go-update2

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

send "rm -rf /var/www/go-psychology/dist/* && cp -r /tmp/go-update2/* /var/www/go-psychology/dist/\r"
expect "# "

send "killall nginx 2>/dev/null; sleep 1; nginx\r"
expect "# "

send "sleep 1 && curl -s -k -o /dev/null -w '%{http_code}' https://localhost/\r"
expect "# "

send "echo 'Deploy done'\r"
expect "# "

send "exit\r"