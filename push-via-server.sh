#!/usr/bin/expect -f

set timeout 120

spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/. root@39.106.208.109:/tmp/go-push

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

send "cd /tmp/go-push && git add -A && git commit -m 'feat: 丰富测试结果 - 扩展至8维雷达/BigFive/投资建议/职场建议/热力图/深度报告' 2>/dev/null || true\r"
expect "# "

send "git push origin main\r"
expect "# "

send "cd /var/www/go-psychology && git pull origin main\r"
expect "# "

send "npm run build\r"
expect "# "

send "rm -rf /usr/share/nginx/html/* && cp -r dist/* /usr/share/nginx/html/\r"
expect "# "

send "systemctl reload nginx\r"
expect "# "

send "echo 'Push and deploy completed'\r"
expect "# "

send "exit\r"