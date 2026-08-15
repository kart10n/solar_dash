const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('https://uni002eu5.fusionsolar.huawei.com', { waitUntil: 'networkidle' });
    await page.locator('input[placeholder*="Username/Email"]').fill(process.env.SOLAR_USER);
    await page.locator('input[placeholder*="Password"]').fill(process.env.SOLAR_PASS);
    await page.locator('span:has-text("Log In"), button:has-text("Log In")').first().click();
    await page.waitForTimeout(15000);
    await page.goto(process.env.SOLAR_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000);

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr.el-table__row'));
      const cells = rows.length > 0 ? Array.from(rows[0].querySelectorAll('td')) : [];
      return {
        today: cells[4] ? cells[4].innerText.trim() : '0.00',
        total: cells[5] ? cells[5].innerText.trim() : '0.00',
        lastUpdate: new Date().toLocaleString('uk-UA')
      };
    });

    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    console.log('Дані збережено успішно!');
  } finally {
    await browser.close();
  }
}
run();
