#!/usr/bin/expect -f

set timeout 60

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/dist/ root@39.106.208.109:/tmp/dist

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

send "rm -rf /usr/share/nginx/html/* && cp -r /tmp/dist/* /usr/share/nginx/html/\r"
expect "# "

send "ls -la /usr/share/nginx/html/\r"
expect "# "

send "systemctl start nginx\r"
expect "# "

send "systemctl status nginx | head -5\r"
expect "# "

send "echo 'Quick deploy completed'\r"
expect "# "

send "exit\r"