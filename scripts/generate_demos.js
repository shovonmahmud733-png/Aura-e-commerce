import puppeteer from 'puppeteer-core';
import GIFEncoder from 'gifencoder';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const GIF_DIR = path.resolve('screenshots/gifs');

if (!fs.existsSync(GIF_DIR)) {
  fs.mkdirSync(GIF_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createGif(pngBuffers, outputPath, { width, height, delays, quality = 10 }) {
  const encoder = new GIFEncoder(width, height);
  encoder.start();
  encoder.setRepeat(0); // Infinite loop
  encoder.setQuality(quality);

  for (let i = 0; i < pngBuffers.length; i++) {
    const delay = Array.isArray(delays) ? (delays[i] || 1000) : delays;
    encoder.setDelay(delay);
    const raw = await sharp(pngBuffers[i])
      .resize(width, height, { fit: 'cover' })
      .ensureAlpha()
      .raw()
      .toBuffer();
    encoder.addFrame(raw);
  }

  encoder.finish();
  const buffer = encoder.out.getData();
  fs.writeFileSync(outputPath, buffer);
  const sizeMb = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(`✓ Saved ${path.basename(outputPath)} [${width}x${height}] (${sizeMb} MB, ${pngBuffers.length} frames)`);
  return { path: outputPath, sizeMb, frames: pngBuffers.length };
}

// -------------------------------------------------------------
// 1. STOREFRONT DEMO
// -------------------------------------------------------------
async function recordStorefront() {
  console.log('\n--- 1. Recording Storefront Demo ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const frames = [];
  const delays = [];

  // Frame 1: Homepage Hero
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await sleep(1500);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 2: Scroll to featured categories
  await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 3: Scroll to featured products
  await page.evaluate(() => window.scrollBy({ top: 550, behavior: 'smooth' }));
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 4: Catalog page (/products)
  await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 5: Category Filter (Studio Wireless Audio)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const audioBtn = btns.find(b => b.textContent.includes('Audio') || b.textContent.includes('Studio'));
    if (audioBtn) audioBtn.click();
  });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 6: Product Details (/product/prod-1)
  await page.goto('http://localhost:3000/product/prod-1', { waitUntil: 'networkidle2' });
  await sleep(1400);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 7: Switch Color Variant (Platinum Silver)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const silverBtn = buttons.find(b => b.title?.includes('Silver') || b.getAttribute('aria-label')?.includes('Silver') || b.className.includes('bg-[#e2e8f0]') || b.className.includes('bg-slate-200'));
    if (silverBtn) silverBtn.click();
  });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 8: Scroll down to specs & audio demo player
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 9: Add to Bag -> Cart Drawer opens
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add to Bag') || b.textContent.includes('Add to Cart'));
    if (addBtn) addBtn.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 10: Checkout Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const checkoutBtn = btns.find(b => b.textContent.includes('Proceed to Checkout') || b.textContent.includes('Checkout'));
    if (checkoutBtn) checkoutBtn.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1600);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-storefront-demo.gif'), {
    width: 960,
    height: 600,
    delays
  });
}

// -------------------------------------------------------------
// 2. CUSTOMER PANEL DEMO
// -------------------------------------------------------------
async function recordCustomerPanel() {
  console.log('\n--- 2. Recording Customer Panel Demo ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const frames = [];
  const delays = [];

  // Frame 1: Customer Login Modal
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await sleep(1000);
  // Open Sign in modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const signInBtn = btns.find(b => b.textContent.includes('Sign In') || b.textContent.includes('Account'));
    if (signInBtn) signInBtn.click();
  });
  await sleep(800);
  // Click Fill Customer button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent.includes('Fill Customer') || b.textContent.includes('Demo Account') || b.textContent.includes('Auto Fill'));
    if (fillBtn) fillBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Submit Sign In -> Navigate to /account
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await sleep(1500);

  // If not automatically redirected to /account, navigate there
  await page.goto('http://localhost:3000/account', { waitUntil: 'networkidle2' });
  await sleep(1400);

  // Frame 2: Customer Overview (Stats & Active DHL Stepper)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1600);

  // Frame 3: Orders List (/account/orders)
  await page.goto('http://localhost:3000/account/orders', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 4: Order Details & Serial Numbers
  const clicked = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const orderLink = links.find(a => a.href.includes('/account/orders/') || a.textContent.includes('Details') || a.textContent.includes('Manage'));
    if (orderLink) {
      orderLink.click();
      return true;
    }
    return false;
  });
  if (!clicked) {
    await page.goto('http://localhost:3000/account/orders', { waitUntil: 'networkidle2' });
  }
  await sleep(1400);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1500);

  // Frame 5: Wishlist (/account/wishlist)
  await page.goto('http://localhost:3000/account/wishlist', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 6: Hardware Warranty Certificates (/account/warranty)
  await page.goto('http://localhost:3000/account/warranty', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 7: Delivery Addresses (/account/addresses)
  await page.goto('http://localhost:3000/account/addresses', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 8: Preferences & Settings (/account/settings)
  await page.goto('http://localhost:3000/account/settings', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1500);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-customer-panel-demo.gif'), {
    width: 960,
    height: 600,
    delays
  });
}

// -------------------------------------------------------------
// 3. ADMIN PANEL DEMO
// -------------------------------------------------------------
async function recordAdminPanel() {
  console.log('\n--- 3. Recording Admin Panel Demo ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const frames = [];
  const delays = [];

  // Frame 1: Navigate to /admin -> Auth modal opens, click Fill Admin
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillAdminBtn = btns.find(b => b.textContent.includes('Fill Admin'));
    if (fillAdminBtn) fillAdminBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Submit Admin Sign In
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  });
  await sleep(1500);

  // Ensure on /admin
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Frame 2: Admin Dashboard (Real telemetry KPIs, recent orders)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1600);

  // Frame 3: Admin Orders Table (/admin/orders)
  await page.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 4: Admin Create Order - Step 1: Select Verified Customer
  await page.goto('http://localhost:3000/admin/orders/create', { waitUntil: 'networkidle2' });
  await sleep(1200);
  // Click on first customer card
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div, button')).filter(el => el.textContent.includes('Alex Vance') || el.textContent.includes('alex@auracommerce.io'));
    if (cards.length > 0) cards[0].click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 5: Step 2: Select Hardware Product & Quantity
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next') || b.textContent.includes('Select Hardware'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(800);
  // Add first product
  await page.evaluate(() => {
    const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Item') || b.textContent.includes('+ Add'));
    if (addBtn) addBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 6: Step 3 & 4: Destination & Courier / Payment & Terms
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Shipping Destination'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Payment & Terms'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 7: Step 5: Review Financial Breakdown & Operator Attribution
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Review Order'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1500);

  // Click Commit and Confirm order
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const commitBtn = btns.find(b => b.textContent.includes('Commit Admin-Assisted Order'));
    if (commitBtn) commitBtn.click();
  });
  await sleep(600);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Confirm & Create Order'));
    if (confirmBtn) confirmBtn.click();
  });
  await sleep(1500);

  // Frame 8: Success Receipt & Printable Tax Invoice Trigger
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1600);

  // Frame 9: Products Studio (/admin/products)
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 10: Warehouse Inventory & Audit Logs (/admin/inventory)
  await page.goto('http://localhost:3000/admin/inventory', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 11: Customer Directory & Access Suspension (/admin/customers)
  await page.goto('http://localhost:3000/admin/customers', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);
  delays.push(1400);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-admin-panel-demo.gif'), {
    width: 960,
    height: 600,
    delays
  });
}

// -------------------------------------------------------------
// 4. MOBILE DEMO (390 x 844)
// -------------------------------------------------------------
async function recordMobile() {
  console.log('\n--- 4. Recording Mobile Demo ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const frames = [];
  const delays = [];

  // Frame 1: Mobile Homepage Hero
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await sleep(1500);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 2: Scroll down to featured hardware card
  await page.evaluate(() => window.scrollBy({ top: 450, behavior: 'smooth' }));
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 3: Tap product -> Product Detail Page with mobile sticky buy bar
  await page.goto('http://localhost:3000/product/prod-1', { waitUntil: 'networkidle2' });
  await sleep(1400);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1500);

  // Frame 4: Scroll down slightly on mobile product detail
  await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 5: Tap Add to Bag on sticky buy bar -> Mobile Cart Drawer slides in
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add to Bag') || b.textContent.includes('Add to Cart'));
    if (addBtn) addBtn.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1500);

  // Frame 6: Tap Checkout in mobile cart drawer -> Mobile Checkout Modal opens
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const checkoutBtn = btns.find(b => b.textContent.includes('Proceed to Checkout') || b.textContent.includes('Checkout'));
    if (checkoutBtn) checkoutBtn.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1800);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-mobile-demo.gif'), {
    width: 390,
    height: 844,
    delays
  });
}

// -------------------------------------------------------------
// MAIN EXECUTION
// -------------------------------------------------------------
async function main() {
  console.log('Starting Aura GIF Demonstration Generator...');
  const t0 = Date.now();

  const r1 = await recordStorefront();
  const r2 = await recordCustomerPanel();
  const r3 = await recordAdminPanel();
  const r4 = await recordMobile();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n========================================`);
  console.log(`All 4 Animated Demonstrations Generated in ${elapsed}s:`);
  console.log(`1. Storefront: ${r1.sizeMb} MB`);
  console.log(`2. Customer:   ${r2.sizeMb} MB`);
  console.log(`3. Admin:      ${r3.sizeMb} MB`);
  console.log(`4. Mobile:     ${r4.sizeMb} MB`);
  const totalMb = (parseFloat(r1.sizeMb) + parseFloat(r2.sizeMb) + parseFloat(r3.sizeMb) + parseFloat(r4.sizeMb)).toFixed(2);
  console.log(`Total Assets Size: ${totalMb} MB`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error('Fatal generator error:', err);
  process.exit(1);
});
