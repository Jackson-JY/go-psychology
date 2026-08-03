#!/usr/bin/env node
/**
 * 全量部署脚本（Node.js + SSH_ASKPASS）
 * 用法：node deploy/scp-full-deploy.mjs <host> <password>
 */
import { spawn } from "child_process";
import { execSync } from "child_process";
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const host = process.argv[2];
const password = process.argv[3];

if (!host || !password) {
  console.error("用法：node deploy/scp-full-deploy.mjs <host> <password>");
  process.exit(1);
}

const localTar = "/tmp/go-psychology.tar.gz";
const remoteTar = "/tmp/go-psychology.tar.gz";
const remoteDir = "/var/www/go-psychology";

const tmpDir = mkdtempSync(join(tmpdir(), "go-psy-deploy-"));
const askpassPath = join(tmpDir, "askpass.sh");
writeFileSync(askpassPath, `#!/bin/sh\nprintf '%s' '${password.replace(/'/g, "'\\'")}'\n`, "utf-8");
chmodSync(askpassPath, 0o700);

const env = {
  ...process.env,
  SSH_ASKPASS: askpassPath,
  SSH_ASKPASS_REQUIRE: "force",
  DISPLAY: ":0",
};

function log(...args) {
  console.log(`[deploy]`, ...args);
}

function run(cmd, args = [], opts = {}) {
  return new Promise((resolve, reject) => {
    log(`$ ${cmd} ${args.join(" ")}`);
    const child = spawn(cmd, args, {
      stdio: ["pipe", "inherit", "inherit"],
      env,
      ...opts,
    });
    // 没有 tty 时，ssh 会通过 SSH_ASKPASS 获取密码
    child.stdin.end();
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`命令退出码 ${code}: ${cmd} ${args.join(" ")}`));
    });
    child.on("error", reject);
  });
}

async function main() {
  log("开始打包...");
  execSync(`git archive --format=tar.gz --prefix=go-psychology/ -o ${localTar} HEAD`, {
    cwd: process.cwd(),
    stdio: "inherit",
  });
  log("打包完成:", localTar);

  log("上传代码包到", host);
  await run("scp", [
    "-o", "StrictHostKeyChecking=no",
    "-o", "BatchMode=no",
    localTar,
    `root@${host}:${remoteTar}`,
  ]);
  log("上传完成");

  const commands = [
    `rm -rf /tmp/go-psy-backup && mkdir -p /tmp/go-psy-backup`,
    `[ -d ${remoteDir}/data ] && cp -a ${remoteDir}/data /tmp/go-psy-backup/data || true`,
    `[ -d ${remoteDir}/logs ] && cp -a ${remoteDir}/logs /tmp/go-psy-backup/logs || true`,
    `[ -f ${remoteDir}/.env ] && cp ${remoteDir}/.env /tmp/go-psy-backup/.env || true`,
    `rm -rf ${remoteDir} && mkdir -p ${remoteDir}`,
    `tar -xzf ${remoteTar} -C ${remoteDir} --strip-components=1`,
    `mkdir -p ${remoteDir}/data ${remoteDir}/logs`,
    `[ -d /tmp/go-psy-backup/data ] && cp -a /tmp/go-psy-backup/data/* ${remoteDir}/data/ 2>/dev/null || true`,
    `[ -d /tmp/go-psy-backup/logs ] && cp -a /tmp/go-psy-backup/logs/* ${remoteDir}/logs/ 2>/dev/null || true`,
    `[ -f /tmp/go-psy-backup/.env ] && cp /tmp/go-psy-backup/.env ${remoteDir}/.env || true`,
    `[ ! -f ${remoteDir}/.env ] && printf 'EDITOR_PASSWORD=%s\\n' '${password.replace(/'/g, "'\\'")}' > ${remoteDir}/.env || true`,
    `cd ${remoteDir} && npm install`,
    `cd ${remoteDir} && npm run build`,
    `cd ${remoteDir} && pm2 delete go-psychology-api 2>/dev/null; pm2 start ecosystem.config.cjs; pm2 save`,
    `cd ${remoteDir} && cp deploy/nginx.conf /etc/nginx/sites-available/go-psychology && nginx -t && systemctl reload nginx`,
    `echo 'SCP DEPLOY DONE'`,
  ];

  for (const cmd of commands) {
    await run("ssh", [
      "-o", "StrictHostKeyChecking=no",
      "-o", "BatchMode=no",
      `root@${host}`,
      cmd,
    ]);
  }

  rmSync(tmpDir, { recursive: true, force: true });
  log("部署完成");
}

main().catch((err) => {
  rmSync(tmpDir, { recursive: true, force: true });
  console.error("[deploy] 失败:", err.message);
  process.exit(1);
});
