#!/usr/bin/expect -f

set timeout 60

spawn scp -o StrictHostKeyChecking=no /Users/jackson/trae/go/dist/index.html /Users/jackson/trae/go/dist/assets/index-DUKf_n-w.css /Users/jackson/trae/go/dist/assets/index-Cm1kc6qJ.js /Users/jackson/trae/go/dist/favicon.svg root@39.106.208.109:/usr/share/nginx/html/

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

send "ls -la /usr/share/nginx/html/\r"
expect "# "

send "cat /usr/share/nginx/html/index.html | grep script\r"
expect "# "

send "curl -s https://gomind.fyi | head -5\r"
expect "# "

send "echo 'Deploy completed'\r"
expect "# "

send "exit\r"