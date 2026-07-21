import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const screenshotsDir = join(__dirname, '../screenshots');

if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

const BASE_URL = 'http://localhost:5173';

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('1. 导航到首页...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(screenshotsDir, '01-intro.png'), fullPage: false });
  console.log('   ✓ 01-intro.png 已保存');

  console.log('2. 点击「开始觉察」进入第 1 关...');
  await page.click('button:has-text("开始觉察")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(screenshotsDir, '02-play.png'), fullPage: false });
  console.log('   ✓ 02-play.png 已保存');

  console.log('3. 在棋盘上落子并完成 3 关...');
  // 第 1 关：点击棋盘中央偏左上的位置
  await page.click('canvas', { position: { x: 128, y: 128 } });
  await page.waitForTimeout(500);
  await page.click('button:has-text("下一手")');
  await page.waitForTimeout(1200);

  // 第 2 关：点击中央
  await page.click('canvas', { position: { x: 160, y: 160 } });
  await page.waitForTimeout(500);
  await page.click('button:has-text("下一手")');
  await page.waitForTimeout(1200);

  // 第 3 关：点击中央天元
  await page.click('canvas', { position: { x: 160, y: 160 } });
  await page.waitForTimeout(500);
  await page.click('button:has-text("出侧写")');
  
  console.log('   等待分析完成...');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(screenshotsDir, '03-result.png'), fullPage: true });
  console.log('   ✓ 03-result.png 已保存');

  console.log('4. 生成海报...');
  await page.click('button:has-text("生成专属海报")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("合成海报")');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: join(screenshotsDir, '04-poster.png'), fullPage: true });
  console.log('   ✓ 04-poster.png 已保存');

  console.log('\n✅ 所有截图已保存到 screenshots/ 目录');
  await browser.close();
}

main().catch((err) => {
  console.error('截图失败:', err);
  process.exit(1);
});