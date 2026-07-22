#!/usr/bin/expect -f

set timeout 120

# 1. 先清空服务器上的旧文件
spawn ssh -o StrictHostKeyChecking=no root@39.106.208.109
expect {
  "password:" { send "Jackson@0214\r"; exp_continue }
  "# " {}
}
send "rm -rf /var/www/go-psychology/dist/*\r"
expect "# "
send "exit\r"
expect eof

# 2. 直接 scp 到目标目录
spawn scp -o StrictHostKeyChecking=no -r /Users/jackson/trae/go/dist root@39.106.208.109:/var/www/go-psychology/dist-new
expect {
  "password:" { send "Jackson@0214\r"; exp_continue }
  eof {}
}

# 3. 重启 nginx 并验证
spawn ssh -o StrictHostKeyChecking=no root@39.106.208.109
expect {
  "password:" { send "Jackson@0214\r"; exp_continue }
  "# " {}
}
send "nginx -s reload\r"
expect "# "
send "cp -r /var/www/go-psychology/dist-new/* /var/www/go-psychology/dist/\r"
expect "# "
send "ls -la /var/www/go-psychology/dist/assets/\r"
expect "# "
send "cat /var/www/go-psychology/dist/index.html | head -15\r"
expect "# "
send "curl -s -k -o /dev/null -w '%{http_code}' https://localhost/\r"
expect "# "
send "echo 'DEPLOY DONE'\r"
expect "# "
send "exit\r"
expect eof
