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

send "curl -s -k https://localhost/api/health\r"
expect "# "

send "curl -s -k -X POST https://localhost/api/analyze -H 'Content-Type: application/json' -d '{\"moves\":[{\"puzzleId\":\"lifeDeath\",\"x\":1,\"y\":5,\"elapsedMs\":1000}]}' 2>&1 | head -50\r"
expect "# "

send "exit\r"