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

// =============================================================
// 1. COMPLETE CUSTOMER JOURNEY
// =============================================================
async function recordCustomerJourney() {
  console.log('\n==================================================');
  console.log('1. Recording Complete Customer Journey...');
  console.log('==================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const frames = [];
  const delays = [];

  // Frame 1: Public Homepage & Customer Login Modal
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Open Sign In Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const signInBtn = btns.find(b => b.textContent.includes('Sign In') || b.textContent.includes('Account'));
    if (signInBtn) signInBtn.click();
  });
  await sleep(800);

  // Click Fill Customer button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent.includes('Fill Customer'));
    if (fillBtn) fillBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Submit Login
  await page.evaluate(() => {
    const form = document.querySelector('form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.click();
    } else {
      const btns = Array.from(document.querySelectorAll('button'));
      const sBtn = btns.find(b => b.textContent.includes('Sign In'));
      if (sBtn) sBtn.click();
    }
  });
  await sleep(1600);

  // Frame 2: Customer Logged In on Homepage
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 3: Product Listing with Audio Category Filter
  await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const audioBtn = btns.find(b => b.textContent.includes('Audio') || b.textContent.includes('Studio'));
    if (audioBtn) audioBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 4: Product Detail with Colorway Selection (Aura Studio Monitor)
  await page.goto('http://localhost:3000/product/prod-1', { waitUntil: 'networkidle2' });
  await sleep(1200);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const silverBtn = buttons.find(b => b.title?.includes('Silver') || b.getAttribute('aria-label')?.includes('Silver') || b.className.includes('bg-[#e2e8f0]') || b.className.includes('bg-slate-200'));
    if (silverBtn) silverBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Add to Bag
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add to Bag') || b.textContent.includes('Add to Cart'));
    if (addBtn) addBtn.click();
  });
  await sleep(800);

  // Open Cart Drawer via Cart button in header
  await page.evaluate(() => {
    const cartBtn = document.querySelector('button[aria-label="Cart"]') || Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Shopping Bag'));
    if (cartBtn) cartBtn.click();
  });
  await sleep(1000);

  // Frame 5: Slideout Cart Drawer
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Proceed to Checkout -> Step 1: Shipping Information
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const checkoutBtn = btns.find(b => b.textContent.includes('Proceed to Checkout'));
    if (checkoutBtn) checkoutBtn.click();
  });
  await sleep(1200);

  // Frame 6: Checkout Modal - Step 1: Shipping Information
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Advance to Step 2: Delivery
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to Delivery') || b.textContent.includes('Continue to Delivery'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1000);

  // Frame 7: Step 2: Delivery Speed & Courier Selection
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Advance to Step 3: Payment
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to Payment') || b.textContent.includes('Continue to Payment'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1000);

  // Frame 8: Step 3: Payment Method (Stripe Card Details & Summary)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Click Complete / Authorize & Pay button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const payBtn = btns.find(b => b.textContent.includes('Authorize & Pay') || b.textContent.includes('Complete Order') || b.textContent.includes('Pay'));
    if (payBtn) payBtn.click();
  });
  await sleep(2500);

  // Frame 9: Order Confirmation / Order Success Modal
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1600);

  // Close confirmation modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.getAttribute('aria-label') === 'Close');
    if (closeBtn) closeBtn.click();
  });
  await sleep(800);

  // Frame 10: Customer Dashboard Overview (/account)
  await page.goto('http://localhost:3000/account', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 11: Orders List with Newly Created Order (/account/orders)
  await page.goto('http://localhost:3000/account/orders', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 12: Order Details & Live DHL Tracking Stepper
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const detailLink = links.find(el => el.textContent.includes('Details') || el.textContent.includes('Manage'));
    if (detailLink) detailLink.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1400);

  // Frame 13: Official Tax Invoice Modal Preview
  await page.goto('http://localhost:3000/account/orders', { waitUntil: 'networkidle2' });
  await sleep(800);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const receiptBtn = btns.find(b => b.textContent.includes('Receipt') || b.textContent.includes('Invoice') || b.title?.includes('Receipt'));
    if (receiptBtn) receiptBtn.click();
  });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 14: Customer Wishlist (/account/wishlist)
  await page.goto('http://localhost:3000/account/wishlist', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 15: Customer Product Reviews (/account/reviews)
  await page.goto('http://localhost:3000/account/reviews', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 16: Hardware Warranty Registry & Certificates (/account/warranty)
  await page.goto('http://localhost:3000/account/warranty', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 17: Saved Delivery Addresses (/account/addresses)
  await page.goto('http://localhost:3000/account/addresses', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 18: Account Security & Settings (/account/settings)
  await page.goto('http://localhost:3000/account/settings', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-customer-complete-journey.gif'), {
    width: 960,
    height: 600,
    delays
  });
}

// =============================================================
// 2. COMPLETE ADMIN OPERATIONS JOURNEY
// =============================================================
async function recordAdminOperations() {
  console.log('\n==================================================');
  console.log('2. Recording Complete Admin Operations...');
  console.log('==================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const frames = [];
  const delays = [];

  // Frame 1: Admin Login Modal
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillAdminBtn = btns.find(b => b.textContent.includes('Fill Admin'));
    if (fillAdminBtn) fillAdminBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Submit Admin Sign In
  await page.evaluate(() => {
    const form = document.querySelector('form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.click();
    } else {
      const btns = Array.from(document.querySelectorAll('button'));
      const sBtn = btns.find(b => b.textContent.includes('Sign In'));
      if (sBtn) sBtn.click();
    }
  });
  await sleep(1600);

  // Frame 2: Admin Dashboard (Real Telemetry KPIs, Revenue Curves, Distribution)
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  await sleep(1400);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Frame 3: Admin Orders Table (/admin/orders)
  await page.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 4: Order Details Inspector (/admin/orders/:id)
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const viewBtn = links.find(el => el.textContent.includes('View') || el.textContent.includes('Details') || el.href?.includes('/admin/orders/AUR-'));
    if (viewBtn) viewBtn.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 5: Products Catalog Studio (/admin/products)
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 6: Product Studio Editor Form (/admin/products/new)
  await page.goto('http://localhost:3000/admin/products/new', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 7: Warehouse Inventory & Stock Ledger (/admin/inventory)
  await page.goto('http://localhost:3000/admin/inventory', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 8: Customer Directory & Access Controls (/admin/customers)
  await page.goto('http://localhost:3000/admin/customers', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 9: Customer Profile Inspector (/admin/customers/:id)
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const inspectBtn = links.find(el => el.textContent.includes('Inspect') || el.textContent.includes('View Profile') || el.href?.includes('/admin/customers/'));
    if (inspectBtn) inspectBtn.click();
  });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Frame 10: Reviews Moderation Queue (/admin/reviews)
  await page.goto('http://localhost:3000/admin/reviews', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 11: Promotional Coupons Engine (/admin/coupons)
  await page.goto('http://localhost:3000/admin/coupons', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 12: Hardware Warranty Claims Registry (/admin/warranty)
  await page.goto('http://localhost:3000/admin/warranty', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Frame 13: Commercial Analytics & Intelligence (/admin/analytics)
  await page.goto('http://localhost:3000/admin/analytics', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 14: Store Settings & System Audit Logs (/admin/settings)
  await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'networkidle2' });
  await sleep(1100);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // =========================================================
  // ADMIN-ASSISTED ORDER CREATION FLOW
  // =========================================================
  await page.goto('http://localhost:3000/admin/orders/create', { waitUntil: 'networkidle2' });
  await sleep(1200);

  // Frame 15: Step 1 - Select Verified Customer (Click 'Select Buyer' for Alex Vance)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const selectBuyerBtn = btns.find(b => b.textContent.includes('Select Buyer'));
    if (selectBuyerBtn) selectBuyerBtn.click();
  });
  await sleep(800);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Click 'Proceed to Hardware Selection'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const proceedBtn = btns.find(b => b.textContent.includes('Proceed to Hardware Selection'));
    if (proceedBtn) proceedBtn.click();
  });
  await sleep(1000);

  // Step 2: Add Hardware Product (Click 'Add' on first product)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add') && !b.textContent.includes('Proceed'));
    if (addBtn) addBtn.click();
  });
  await sleep(800);

  // Frame 16: Step 2 - Hardware Products & Quantity Selected
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Click 'Proceed to Shipping'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const proceedBtn = btns.find(b => b.textContent.includes('Proceed to Shipping'));
    if (proceedBtn) proceedBtn.click();
  });
  await sleep(1000);

  // Frame 17: Step 3 - Shipping Destination & Delivery Method
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Click 'Proceed to Payment'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const proceedBtn = btns.find(b => b.textContent.includes('Proceed to Payment'));
    if (proceedBtn) proceedBtn.click();
  });
  await sleep(800);

  // Click 'Proceed to Review'
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const proceedBtn = btns.find(b => b.textContent.includes('Proceed to Review'));
    if (proceedBtn) proceedBtn.click();
  });
  await sleep(1000);

  // Frame 18: Step 5 - Financial Breakdown & Operator Attribution
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1300);

  // Commit and Confirm Order
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const commitBtn = btns.find(b => b.textContent.includes('Commit Admin-Assisted Order'));
    if (commitBtn) commitBtn.click();
  });
  await sleep(700);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const confirmBtn = btns.find(b => b.textContent.includes('Confirm & Create Order'));
    if (confirmBtn) confirmBtn.click();
  });
  await sleep(1800);

  // Frame 19: Order Creation Success Screen & Tax Invoice Trigger
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1600);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-admin-complete-operations.gif'), {
    width: 960,
    height: 600,
    delays
  });
}

// =============================================================
// 3. COMPLETE MOBILE SHOPPING JOURNEY (DARK MODE)
// =============================================================
async function recordMobileDarkMode() {
  console.log('\n==================================================');
  console.log('3. Recording Mobile Shopping Journey (Dark Mode)...');
  console.log('==================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  // Ensure Dark Mode is enabled before document load
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('aura_theme', 'dark');
    document.documentElement.classList.add('dark');
  });

  const frames = [];
  const delays = [];

  // Frame 1: Mobile Homepage (Dark Mode)
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Verify Dark Mode active
  const isDarkActive = await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('aura_theme', 'dark');
    return document.documentElement.classList.contains('dark');
  });
  console.log('Mobile Dark Mode Active:', isDarkActive);
  await sleep(600);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Open Mobile Sign In Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const signInBtn = btns.find(b => b.textContent.includes('Sign In') || b.textContent.includes('Account'));
    if (signInBtn) signInBtn.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const fillBtn = btns.find(b => b.textContent.includes('Fill Customer'));
    if (fillBtn) fillBtn.click();
  });
  await sleep(800);

  // Frame 2: Mobile Sign In Modal (Dark Mode)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Submit Mobile Sign In
  await page.evaluate(() => {
    const form = document.querySelector('form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (submitBtn) {
      submitBtn.click();
    } else {
      const btns = Array.from(document.querySelectorAll('button'));
      const sBtn = btns.find(b => b.textContent.includes('Sign In'));
      if (sBtn) sBtn.click();
    }
  });
  await sleep(1500);

  // Frame 3: Mobile Product Listing (/products in Dark Mode)
  await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle2' });
  await sleep(1000);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Frame 4: Mobile Product Details (/product/prod-1 in Dark Mode)
  await page.goto('http://localhost:3000/product/prod-1', { waitUntil: 'networkidle2' });
  await sleep(1200);
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Tap Add to Bag on sticky buy bar
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent.includes('Add to Bag') || b.textContent.includes('Add to Cart'));
    if (addBtn) addBtn.click();
  });
  await sleep(800);

  // Tap Cart button in mobile navbar
  await page.evaluate(() => {
    const cartBtn = document.querySelector('button[aria-label="Cart"]') || Array.from(document.querySelectorAll('button')).find(b => b.title?.includes('Shopping Bag'));
    if (cartBtn) cartBtn.click();
  });
  await sleep(1000);

  // Frame 5: Mobile Cart Drawer in Dark Mode
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Tap Proceed to Checkout -> Mobile Checkout Modal Step 1 (Dark Mode)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const checkoutBtn = btns.find(b => b.textContent.includes('Proceed to Checkout'));
    if (checkoutBtn) checkoutBtn.click();
  });
  await sleep(1200);

  // Frame 6: Mobile Checkout Modal Step 1: Shipping Information (Dark Mode)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1100);

  // Step 2: Delivery Speed & Courier (Dark Mode)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to Delivery') || b.textContent.includes('Continue to Delivery'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1000);

  // Frame 7: Mobile Checkout Step 2: Delivery Speed & Courier (Dark Mode)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1000);

  // Step 3: Payment Method & Details (Dark Mode)
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => b.textContent.includes('Proceed to Payment') || b.textContent.includes('Continue to Payment'));
    if (nextBtn) nextBtn.click();
  });
  await sleep(1000);

  // Frame 8: Mobile Checkout Step 3: Payment Method & Details (Dark Mode)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1200);

  // Complete Order -> Authorize & Pay
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const payBtn = btns.find(b => b.textContent.includes('Authorize & Pay') || b.textContent.includes('Complete Order') || b.textContent.includes('Pay'));
    if (payBtn) payBtn.click();
  });
  await sleep(2500);

  // Frame 9: Complete Order -> Order Confirmation & Success Screen (Dark Mode)
  frames.push(await page.screenshot({ type: 'png' }));
  delays.push(1800);

  await browser.close();

  return await createGif(frames, path.join(GIF_DIR, 'aura-mobile-dark-mode.gif'), {
    width: 390,
    height: 844,
    delays
  });
}

// =============================================================
// MAIN ENTRY POINT
// =============================================================
async function main() {
  console.log('Starting Production Journey Demonstrations Generation...');
  const t0 = Date.now();

  const rCust = await recordCustomerJourney();
  const rAdmin = await recordAdminOperations();
  const rMobile = await recordMobileDarkMode();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n==================================================`);
  console.log(`All 3 Visual Demonstrations Generated in ${elapsed}s:`);
  console.log(`1. Customer Journey:  ${rCust.sizeMb} MB (${rCust.frames} frames)`);
  console.log(`2. Admin Operations:  ${rAdmin.sizeMb} MB (${rAdmin.frames} frames)`);
  console.log(`3. Mobile Dark Mode:  ${rMobile.sizeMb} MB (${rMobile.frames} frames)`);
  const totalMb = (parseFloat(rCust.sizeMb) + parseFloat(rAdmin.sizeMb) + parseFloat(rMobile.sizeMb)).toFixed(2);
  console.log(`Total Asset Footprint: ${totalMb} MB`);
  console.log(`==================================================\n`);
}

main().catch(err => {
  console.error('Fatal Generator Error:', err);
  process.exit(1);
});
