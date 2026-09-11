// Run with Playwright installed, or set PLAYWRIGHT_MODULE to its package directory.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://localhost:8766');
    // Distinct Chinese font selections must change the rendered pixels.
    const fontShots = [];
    for (const family of ['xiaowei', 'kuaile', 'mashan']) {
      await page.locator('#family').selectOption(family);
      await page.waitForFunction(() => document.querySelector('#toast').textContent === '字体已就绪');
      fontShots.push(await page.locator('#canvas').screenshot());
    }
    assert(!fontShots[0].equals(fontShots[1]));
    assert(!fontShots[1].equals(fontShots[2]));
    await page.locator('#duplicate').click();
    assert.equal(await page.locator('#family').inputValue(), 'mashan');
    await page.locator('#delete').click();
    await page.locator('#add').click();
    assert.equal(await page.locator('.zone-item').count(), 4);
    await page.locator('#title').fill('测试分区');
    assert.equal(await page.locator('.zone-item.active .name').textContent(), '测试分区');
    await page.locator('#duplicate').click();
    assert.equal(await page.locator('.zone-item').count(), 5);
    await page.locator('#delete').click();
    await page.locator('[data-layout=four]').click();
    assert.equal(await page.locator('.zone-item').count(), 4);
    const box = await page.locator('#canvas').boundingBox();
    const drag = async (x1, y1, x2, y2) => {
      await page.mouse.move(box.x + box.width * x1, box.y + box.height * y1);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * x2, box.y + box.height * y2);
      await page.mouse.up();
    };
    const before = await page.locator('#canvas').screenshot();
    await drag(.2, .2, .24, .24);
    assert(!before.equals(await page.locator('#canvas').screenshot()), 'Dragging changes canvas');
    const moved = await page.locator('#canvas').screenshot();
    await drag(.52, .49, .58, .55);
    assert(!moved.equals(await page.locator('#canvas').screenshot()), 'Resize changes canvas');
    // A generated PNG fixture avoids dependence on any personal image.
    const dataURL = await page.evaluate(() => {
      const fixture = document.createElement('canvas');
      fixture.width = 640; fixture.height = 360;
      const context = fixture.getContext('2d');
      context.fillStyle = '#102030'; context.fillRect(0, 0, 640, 360);
      return fixture.toDataURL('image/png');
    });
    await page.locator('#file').setInputFiles({ name: 'fixture.png', mimeType: 'image/png', buffer: Buffer.from(dataURL.split(',')[1], 'base64') });
    await page.waitForFunction(() => document.querySelector('#imageName').textContent === 'fixture.png');
    assert.equal(await page.locator('#canvas').getAttribute('width'), '640');
    assert.equal(await page.locator('#canvas').getAttribute('height'), '360');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export').click();
    const download = await downloadPromise;
    const png = await fs.readFile(await download.path());
    assert.equal(png.readUInt32BE(16), 640);
    assert.equal(png.readUInt32BE(20), 360);
    const exported = await page.evaluate(async data => {
      const img = new Image(); img.src = data; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data);
    }, 'data:image/png;base64,' + png.toString('base64'));
    assert.deepEqual(exported, [16, 32, 48, 255], 'Uploaded background retained');
    for (let i = 0; i < 4; i++) await page.locator('#delete').click();
    assert.equal(await page.locator('.zone-item').count(), 0);
    assert(await page.locator('#empty').isVisible());
    await page.locator('#add').click();
    assert.equal(await page.locator('.zone-item').count(), 1);
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log('PASS: editing, move/resize, upload, PNG dimensions/background, empty state, mobile layout, runtime errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
