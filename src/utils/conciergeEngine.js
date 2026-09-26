import { CURRENCIES, formatCurrency, convertCurrency } from './formatters.js';

// Synonyms and alias dictionary for all 18 catalog products
export const PRODUCT_ALIASES = {
  'prod-1': ['headphones', 'over ear', 'studio wireless', 'aura studio', 'anc headphones', 'earcups', 'headphone', 'headset'],
  'prod-2': ['smartwatch', 'horizon', 'smart watch', 'wrist watch', 'pulse horizon', 'ecg watch', 'watch pro', 'watch'],
  'prod-3': ['desk bar', 'light bar', 'screenbar', 'monitor light', 'lumix', 'ambient light', 'desk light', 'monitor lamp'],
  'prod-4': ['keyboard', 'mechanical keyboard', 'vertex', 'mechanical', 'switches', 'cream linear', 'keys', 'typing'],
  'prod-5': ['soundpod', 'smart speaker', 'hifi speaker', 'mini speaker', 'speaker', 'home speaker', 'sound pod'],
  'prod-6': ['magsafe stand', 'titan orbit', 'wireless charger', 'charging stand', '3 in 1 charger', 'charger stand', 'orbit stand'],
  'prod-7': ['diffuser', 'halo', 'aroma', 'atmosphere diffuser', 'essential oil', 'humidifier', 'scent diffuser'],
  'prod-8': ['fitness band', 'aura track', 'tracker band', 'fitness tracker', 'activity tracker', 'smart band', 'wristband'],
  'prod-9': ['earbuds', 'in ear', 'pro anc', 'true wireless', 'tws', 'beryllium earbuds', 'ear bud', 'airpods alternative'],
  'prod-10': ['soundbar', 'home theater', 'subwoofer', 'studio reference soundbar', 'tv speaker', 'spatial audio', 'sound bar'],
  'prod-11': ['tube dac', 'dac', 'headphone amplifier', 'amp', 'master tube', 'audiophile amp', 'dsd512', 'tube amp'],
  'prod-12': ['smart ring', 'ring', 'biometric ring', 'gen 3 ring', 'aura ring', 'sleep ring', 'finger ring'],
  'prod-13': ['eyewear', 'smart glasses', 'audio glasses', 'horizon glasses', 'sunglasses', 'smart audio eyewear', 'glasses'],
  'prod-14': ['air purifier', 'pure air', 'hepa', 'cadr', 'purifier', 'clean air', 'room purifier', 'filter'],
  'prod-15': ['hex panels', 'light panels', 'hexagon', 'wall lights', 'modular light', 'rgb panels', 'aura hex'],
  'prod-16': ['mouse', 'vertical mouse', 'ergonomic mouse', 'precision mouse', 'track mouse', 'wireless mouse'],
  'prod-17': ['power bank', 'nomad', 'laptop charger', '20000mah', 'portable battery', '100w charger', 'battery bank', 'portable charger'],
  'prod-18': ['desktop stands', 'monitor stands', 'speaker stands', 'acoustic stands', 'stands', 'studio stands', 'metal stands']
};

// General Tech & Engineering Knowledge Base
const TECH_EXPLANATIONS = {
  anc: "Active Noise Cancellation (ANC) uses outward and inward micro-microphones to analyze ambient frequencies 48,000 times per second, generating an inverted 'anti-phase' soundwave that cancels external noise like aircraft rumble or office chatter before it reaches your eardrums. Aura Studio Over-Ear achieves up to -42dB of adaptive noise attenuation.",
  beryllium: "Beryllium is one of the lightest yet stiffest structural metals in existence. In audio engineering, Beryllium driver diaphragms (used in our Aura Pro ANC Earbuds) have an acoustic velocity four times that of aluminum, preventing modal breakup and delivering transparent, hyper-detailed high-frequency response up to 45kHz.",
  titanium: "Aura crafts its enclosures from Grade 5 Aerospace Titanium (Ti-6Al-4V). It has the highest strength-to-density ratio of any metallic element, is 45% lighter than steel, hypoallergenic, impervious to sweat corrosion, and feels warm against the skin.",
  dac: "A Digital-to-Analog Converter (DAC) translates binary 1s and 0s from digital audio files into continuous electrical voltage waves that physically vibrate headphone diaphragms. The Aura Master Tube DAC features 32-bit / 768kHz PCM and native DSD512 decoding paired with hand-matched Russian 6J1 vacuum tubes for rich analog warmth.",
  cadr: "CADR stands for Clean Air Delivery Rate. The Aura Pure Air Purifier delivers 400 m³/h CADR using a true medical H13 HEPA honeycomb filter and activated coconut-shell carbon, scrubbing 99.97% of airborne particulate matter, allergens, and VOCs in rooms up to 850 sq ft in under 30 minutes.",
  atm: "A '5 ATM' water rating means a device can withstand hydrostatic pressure equivalent to 50 meters (164 feet) depth. The Aura Pulse Horizon Smartwatch Pro is certified 5 ATM, making it fully safe for high-cadence pool swimming, showering, and water sports.",
  ecg: "Electrocardiogram (ECG) sensors record the electrical impulses that trigger heartbeats. The Aura Pulse Horizon Smartwatch uses Grade 5 Titanium micro-electrodes to capture clinical-grade Lead-I ECG waveforms in 30 seconds to detect atrial fibrillation (AFib) and sinus rhythm anomalies."
};

// Witty jokes for casual user prompts
const HARDWARE_JOKES = [
  "Why did the audiophile get kicked out of the concert? He stood up and complained the room's acoustic reverb time was 0.3 seconds too slow!",
  "Why do software developers love Aura titanium mechanical keyboards? Because every keystroke sounds like breaking the sound barrier in pure luxury.",
  "Why don't noise-cancelling headphones ever get into arguments? Because they cancel negative frequency waves before they hit the ear!",
  "How many audiophiles does it take to change a lightbulb? Three: one to screw it in, and two to argue whether the incandescent glow has a warmer soundstage than LED!"
];

/**
 * Identify product mentions in query text
 */
export function identifyProducts(text, catalog) {
  const clean = text.toLowerCase();
  const matched = [];

  for (const product of catalog) {
    // Check direct name match
    if (clean.includes(product.name.toLowerCase())) {
      matched.push(product);
      continue;
    }
    // Check product ID
    if (clean.includes(product.id.toLowerCase())) {
      matched.push(product);
      continue;
    }
    // Check alias list
    const aliases = PRODUCT_ALIASES[product.id] || [];
    for (const alias of aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(clean)) {
        if (!matched.some(m => m.id === product.id)) {
          matched.push(product);
        }
        break;
      }
    }
  }

  return matched;
}

/**
 * Format currency amount for Concierge responses
 */
export function formatConciergePrice(amountUSD, currencyCode = 'USD') {
  return formatCurrency(amountUSD, currencyCode);
}

/**
 * Natural Language Processing and Knowledge Resolution Engine
 */
export function generateConciergeResponse(query, context = {}) {
  const {
    products = [],
    orders = [],
    user = null,
    activeProduct = null,
    currency = 'USD',
    verifyWarranty = null
  } = context;

  const text = (query || '').trim();
  const lower = text.toLowerCase();

  // Result object template
  const result = {
    text: '',
    products: [],
    links: [],
    suggestions: [],
    activeProduct: activeProduct
  };

  // ---------------------------------------------------------
  // 1. SERIAL NUMBER & WARRANTY VERIFICATION INQUIRIES
  // ---------------------------------------------------------
  const serialMatch = text.match(/AUR-HW-[A-Za-z0-9-]+/i) || text.match(/AUR-[A-Za-z0-9-]+/i);
  if (serialMatch || lower.includes('verify serial') || lower.includes('check serial') || lower.includes('serial number')) {
    const serial = serialMatch ? serialMatch[0].toUpperCase() : null;
    if (serial) {
      const verified = verifyWarranty ? verifyWarranty(serial) : null;
      if (verified && verified.found) {
        result.text = `Verification Confirmed! Serial **${serial}** corresponds to the authentic **${verified.productName}**.\n\n• **Warranty Status**: ${verified.warrantyStatus}\n• **Protection Expiry**: ${verified.warrantyExpiry}\n• **Order Reference**: ${verified.orderId || 'Factory Registered Unit'}\n\nYour hardware is 100% genuine and fully covered under our 2-Year International Aura Care Program (including 1-to-1 express hardware exchange).`;
        const matchedProd = products.find(p => p.name === verified.productName || (p.serialNumber && p.serialNumber.toUpperCase() === serial));
        if (matchedProd) {
          result.products = [matchedProd];
          result.activeProduct = matchedProd;
        }
        result.links = [{ label: 'Open Official Certificate', path: `/warranty?serial=${encodeURIComponent(serial)}` }];
        result.suggestions = ["What does the 2-Year warranty cover?", "How do I claim a replacement?", "View product specifications"];
        return result;
      } else {
        result.text = `I scanned our global registry for serial **${serial}**. This code was not found in our active database. Please ensure you entered the exact code stamped on the back of your chassis (format: AUR-HW-XXXX-XXX), or verify it in your Aura Order confirmation invoice.`;
        result.links = [{ label: 'Open Warranty Verification Portal', path: '/warranty' }];
        result.suggestions = ["Sample serial: AUR-HW-9821-AUD", "Where do I find my serial number?", "Contact Aura Support"];
        return result;
      }
    } else if (lower.includes('where') && (lower.includes('find') || lower.includes('look'))) {
      result.text = "You can find your authentic Hardware Serial Number:\n\n1. Laser-etched directly onto the underside of your titanium chassis or headphone inner headband.\n2. In your Order Confirmation email and downloadable PDF Tax Invoice.\n3. In your **My Orders** portal under item details.";
      result.links = [{ label: 'Check My Orders', path: '/orders' }, { label: 'Warranty Portal', path: '/warranty' }];
      result.suggestions = ["AUR-HW-9821-AUD", "AUR-HW-8842-WRB", "What does warranty cover?"];
      return result;
    }
  }

  if (lower.includes('warranty') || lower.includes('guarantee') || lower.includes('coverage') || lower.includes('broken') || lower.includes('repair')) {
    result.text = "Every authentic Aura device is protected by our **2-Year Global Aura Care Warranty**:\n\n• **Zero-Cost Repairs**: Full coverage for manufacturing defects and mechanical failure.\n• **Battery Health Guarantee**: Free cell replacement if battery capacity drops below 80% within 24 months.\n• **Express 1-to-1 Swap**: If a device fails, DHL Express delivers a brand new replacement before picking up the defective unit.\n• **Worldwide Transferable**: Warranty follows the hardware serial number internationally.";
    result.links = [
      { label: 'Warranty Verification Portal', path: '/warranty' },
      { label: 'Support & Help Desk', path: '/contact' }
    ];
    result.suggestions = ["Verify my serial number", "What is your 30-day return policy?", "Which headphones have longest battery?"];
    return result;
  }

  // ---------------------------------------------------------
  // 2. ORDER TRACKING & DHL SHIPPING TIMELINE
  // ---------------------------------------------------------
  if (lower.includes('track') || lower.includes('where is my order') || lower.includes('where\'s my order') || lower.includes('shipping') || lower.includes('dhl') || lower.includes('delivery time') || lower.includes('courier')) {
    if (orders && orders.length > 0) {
      const latest = orders[0];
      const trackingCode = latest.trackingNumber || 'DHL-AUR-84920412';
      const itemsList = latest.items?.map(it => `${it.quantity}x ${it.product?.name || 'Aura Hardware'}`).join(', ') || 'Aura Hardware';
      
      result.text = `Here is your active shipment status for **Order ${latest.id}**:\n\n• **Items**: ${itemsList}\n• **Carrier**: DHL Express International (Carbon Neutral)\n• **Tracking Code**: \`${trackingCode}\`\n• **Current Stage**: **In Transit** (Customs Cleared)\n• **Estimated Delivery**: **${latest.estimatedDelivery || '2-3 Business Days'}**\n• **Destination**: ${latest.shippingDetails?.city || 'Your Address'}, ${latest.shippingDetails?.country || 'Worldwide'}\n\nYou can inspect the full step-by-step dispatch timeline in your orders portal.`;
      result.links = [{ label: 'View Live DHL Tracking in My Orders', path: '/orders' }];
      result.suggestions = ["When will it arrive?", "Download PDF Invoice", "What is your return policy?"];
      return result;
    } else {
      result.text = "Aura ships worldwide via carbon-neutral **DHL Express Priority**:\n\n• **Dispatch Window**: Orders are inspected, serialized, and dispatched within 2 hours.\n• **Delivery Timeline**: 2–4 business days worldwide (USA, Europe, Asia, Bangladesh).\n• **Complimentary Shipping**: Free express delivery on all orders over $100.\n• **Real-Time Tracking**: Automated tracking number and SMS updates issued upon dispatch.";
      result.links = [{ label: 'Explore Products', path: '/products' }];
      result.suggestions = ["Do you ship to Bangladesh?", "Can I pay in BDT?", "Show me bestsellers"];
      return result;
    }
  }

  // ---------------------------------------------------------
  // 3. CURRENCY & PAYMENT INQUIRIES (BDT, USD, STRIPE, ETC.)
  // ---------------------------------------------------------
  if (lower.includes('bdt') || lower.includes('taka') || lower.includes('bangladesh') || lower.includes('currency') || lower.includes('currencies') || lower.includes('exchange rate') || lower.includes('how much in')) {
    const rateBDT = CURRENCIES.BDT ? CURRENCIES.BDT.rate : 121.5;
    const exampleSample = products[0] || { name: 'Aura Studio Wireless', price: 349 };
    const convertedSample = formatCurrency(exampleSample.price, 'BDT');

    result.text = `Yes! Aura fully supports **Bangladeshi Taka (BDT ৳)** alongside USD ($), EUR (€), GBP (£), JPY (¥), and CAD (CA$).\n\n• **Current Reference Rate**: 1 USD ≈ ${rateBDT} BDT.\n• **Example**: ${exampleSample.name} ($${exampleSample.price}) converts to approximately **${convertedSample}**.\n• **Seamless Checkout**: Select **BDT (৳)** from the top navbar currency selector to view all prices, discounts, and invoices directly in Taka.\n• **Local & Global Cards**: We accept Visa, Mastercard, Amex, Apple Pay, and Google Pay with zero foreign transaction markup.`;
    result.suggestions = ["Show all prices in BDT", "What payment methods do you accept?", "Show audio gear under 20,000 BDT"];
    return result;
  }

  if (lower.includes('payment') || lower.includes('pay') || lower.includes('stripe') || lower.includes('apple pay') || lower.includes('google pay') || lower.includes('credit card') || lower.includes('card')) {
    result.text = "Aura utilizes **Stripe Elements 256-bit AES encryption** for military-grade checkout security:\n\n• **Cards Supported**: Visa, Mastercard, American Express, Discover, JCB, and UnionPay.\n• **Digital Wallets**: Instant 1-click checkout with Apple Pay and Google Pay.\n• **Currencies**: Real-time localized settlement in USD, EUR, GBP, JPY, CAD, and BDT.\n• **Security**: PCI-DSS Level 1 certified. Your card credentials never touch our servers.";
    result.suggestions = ["Can I pay in BDT?", "What is your return policy?", "Is my payment safe?"];
    return result;
  }

  // ---------------------------------------------------------
  // 4. RETURN & REFUND POLICY
  // ---------------------------------------------------------
  if (lower.includes('return') || lower.includes('refund') || lower.includes('money back') || lower.includes('30 day') || lower.includes('satisfaction') || lower.includes('exchange')) {
    result.text = "We want you to experience Aura hardware in your own acoustic and workspace environment with complete peace of mind:\n\n• **30-Day Risk-Free Trial**: Test any Aura device for 30 calendar days.\n• **Prepaid DHL Return Label**: If you are not completely satisfied, we generate a prepaid DHL Express return label.\n• **100% Full Refund**: Reimbursed to your original payment method within 48 hours of warehouse inspection.\n• **Condition**: Devices must be in pristine cosmetic condition with original packaging and serialized accessories.";
    result.links = [{ label: 'Start a Return or Inquiry', path: '/contact' }];
    result.suggestions = ["What does the 2-year warranty cover?", "Track my DHL package", "Which headphones are best?"];
    return result;
  }

  // ---------------------------------------------------------
  // 5. IDENTIFY PRODUCTS MENTIONED IN QUERY
  // ---------------------------------------------------------
  let matchedProducts = identifyProducts(text, products);

  // If no products matched directly, check if user is referring to context activeProduct
  // (e.g. "What colors does it come in?", "How much is it?", "Is it water resistant?", "Add it to my cart")
  const isPronounFollowup = /\b(it|this|that|they|these|the product|the device)\b/i.test(text) ||
    lower.startsWith('how much') ||
    lower.startsWith('what color') ||
    lower.startsWith('what is the price') ||
    lower.startsWith('add to') ||
    lower.startsWith('specs of');

  if (matchedProducts.length === 0 && activeProduct && isPronounFollowup) {
    matchedProducts = [activeProduct];
  }

  // ---------------------------------------------------------
  // 6. MULTI-PRODUCT COMPARISON (e.g. Watch vs Band, Headphones vs Earbuds)
  // ---------------------------------------------------------
  const isComparisonQuery = lower.includes('compare') || lower.includes('vs') || lower.includes('difference between') || lower.includes('which is better');
  if (isComparisonQuery || matchedProducts.length >= 2) {
    // If user asked "compare" without specific products, give general matrix link and highlight flagship audio
    if (matchedProducts.length < 2) {
      if (lower.includes('audio') || lower.includes('music') || lower.includes('sound')) {
        matchedProducts = products.filter(p => p.id === 'prod-1' || p.id === 'prod-9');
      } else if (lower.includes('wearable') || lower.includes('wrist') || lower.includes('fitness')) {
        matchedProducts = products.filter(p => p.id === 'prod-2' || p.id === 'prod-8');
      } else {
        matchedProducts = products.filter(p => p.id === 'prod-1' || p.id === 'prod-2');
      }
    }

    if (matchedProducts.length >= 2) {
      const p1 = matchedProducts[0];
      const p2 = matchedProducts[1];
      const price1 = formatConciergePrice(p1.price, currency);
      const price2 = formatConciergePrice(p2.price, currency);

      result.text = `Here is an engineering side-by-side contrast between **${p1.name}** and **${p2.name}**:\n\n` +
        `• **Pricing**: ${p1.name} is **${price1}**, while ${p2.name} is **${price2}**.\n` +
        `• **Primary Form Factor**: ${p1.tagline} vs ${p2.tagline}.\n` +
        `• **Key Engineering Specs**:\n` +
        `   - **${p1.name}**: ${Object.entries(p1.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')}\n` +
        `   - **${p2.name}**: ${Object.entries(p2.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' | ')}\n` +
        `• **Ideal User**: Choose **${p1.name}** if your priority is ${p1.category === 'audio' ? 'immersion & studio soundstage' : 'flagship feature depth'}. Choose **${p2.name}** for ${p2.price < p1.price ? 'minimalist portability & exceptional value' : 'advanced biometric precision'}.`;
      
      result.products = [p1, p2];
      result.links = [{ label: 'Launch Interactive Comparison Matrix', path: '/compare' }];
      result.suggestions = [`Add ${p1.name.split(' ')[1]} to bag`, `Add ${p2.name.split(' ')[1]} to bag`, "Compare battery life"];
      result.activeProduct = p1;
      return result;
    }
  }

  // ---------------------------------------------------------
  // 7. SPECIFIC PRODUCT FEATURE / SPEC / COLOR LOOKUPS
  // ---------------------------------------------------------
  if (matchedProducts.length === 1) {
    const prod = matchedProducts[0];
    result.activeProduct = prod;
    const formattedPrice = formatConciergePrice(prod.price, currency);

    // Color inquiry
    if (lower.includes('color') || lower.includes('colour') || lower.includes('finish') || lower.includes('shade') || lower.includes('black') || lower.includes('silver') || lower.includes('gold') || lower.includes('navy') || lower.includes('rose')) {
      const colorsList = prod.colors && prod.colors.length > 0
        ? prod.colors.map(c => `• **${c.name}** (Precision anodized finish)`).join('\n')
        : '• Natural Titanium finish';

      result.text = `The **${prod.name}** is engineered in ${prod.colors?.length || 1} bespoke aesthetic finishes:\n\n${colorsList}\n\nEvery colorway is electro-chemically anodized or PVD coated to resist fingerprint oils and micro-scratches. Would you like me to add a specific color to your cart?`;
      result.products = [prod];
      result.suggestions = prod.colors ? prod.colors.map(c => `Select ${c.name}`) : [`Inspect ${prod.name}`];
      result.links = [{ label: `View ${prod.name} in Detail`, path: `/product/${prod.id}` }];
      return result;
    }

    // Battery inquiry
    if (lower.includes('battery') || lower.includes('charge') || lower.includes('hours') || lower.includes('runtime') || lower.includes('mah') || lower.includes('standby')) {
      const batterySpec = prod.specs?.['Battery Life'] || prod.specs?.['Battery'] || prod.specs?.['Capacity'] || 'Optimized power management';
      result.text = `**${prod.name}** Power & Battery Engineering:\n\n• **Specification**: **${batterySpec}**\n• **Charging**: Fast-charging USB-C / wireless inductive architecture.\n• **Battery Guarantee**: Protected under Aura Care—free cell replacement if capacity ever drops below 80% within 2 years.`;
      result.products = [prod];
      result.suggestions = ["What are the other specs?", `How much is it in ${currency}?`, "What colors does it come in?"];
      result.links = [{ label: `Inspect Specs for ${prod.name}`, path: `/product/${prod.id}` }];
      return result;
    }

    // Water / Sweat / Weather resistance
    if (lower.includes('water') || lower.includes('sweat') || lower.includes('rain') || lower.includes('swim') || lower.includes('ipx') || lower.includes('rating') || lower.includes('dust')) {
      const waterRating = prod.specs?.['Water Rating'] || prod.specs?.['Waterproof'] || prod.specs?.['Water Resistance'] || prod.specs?.['Protection'];
      if (waterRating) {
        result.text = `Yes! **${prod.name}** features an official ingress protection rating of **${waterRating}**.\n\nIt is fully engineered to withstand heavy workouts, rainstorms, and daily moisture exposure without acoustic or component degradation.`;
      } else {
        result.text = `**${prod.name}** is designed for indoor and desk environments with precision-sealed aluminum/steel casing, but is not immersion water-rated. If you need extreme water resistance for swimming or workouts, inspect our **Aura Pulse Horizon Smartwatch Pro (5 ATM / 50m)** or **Aura Pro ANC Earbuds (IPX5)**.`;
      }
      result.products = [prod];
      result.suggestions = ["Show waterproof products", "Compare with Smartwatch", `Price in ${currency}`];
      result.links = [{ label: `Inspect ${prod.name}`, path: `/product/${prod.id}` }];
      return result;
    }

    // Price inquiry
    if (lower.includes('price') || lower.includes('how much') || lower.includes('cost') || lower.includes('rate') || lower.includes('bdt') || lower.includes('dollar')) {
      result.text = `**${prod.name}** is priced at **${formattedPrice}** (tax included, with complimentary carbon-neutral DHL Express worldwide delivery).\n\n• **Serial Number**: \`${prod.serialNumber}\`\n• **Warranty**: 2-Year International Aura Care Included\n• **In Stock**: ${prod.stock} units remaining in immediate warehouse allocation.`;
      result.products = [prod];
      result.suggestions = [`Add to bag for ${formattedPrice}`, "What colors does it come in?", "What are the full specs?"];
      result.links = [{ label: `View ${prod.name}`, path: `/product/${prod.id}` }];
      return result;
    }

    // Add to cart action query
    if (lower.includes('add') && (lower.includes('cart') || lower.includes('bag') || lower.includes('buy') || lower.includes('purchase'))) {
      result.text = `I have loaded **${prod.name}** (${formattedPrice}) for your shopping bag! Click the **Add to Bag** button on the card below to confirm your selection with your preferred finish.`;
      result.products = [prod];
      result.suggestions = ["Go to checkout", "View shopping bag", "Show matching accessories"];
      result.links = [{ label: 'View Shopping Bag', path: '/products' }];
      return result;
    }

    // General single product breakdown
    result.text = `**${prod.name}** (${formattedPrice}) — ${prod.tagline}:\n\n` +
      `• **Overview**: ${prod.description}\n` +
      `• **Key Highlights**:\n${prod.features.slice(0, 3).map(f => `   - ${f}`).join('\n')}\n` +
      `• **Technical Specifications**:\n${Object.entries(prod.specs || {}).map(([k, v]) => `   - **${k}**: ${v}`).join('\n')}\n\n` +
      `All units include authentic serial \`${prod.serialNumber}\` and 2-Year Aura Care coverage.`;
    
    result.products = [prod];
    result.suggestions = ["What colors does it come in?", "Check battery life", "Compare with similar models"];
    result.links = [{ label: `View ${prod.name} Product Page`, path: `/product/${prod.id}` }];
    return result;
  }

  // ---------------------------------------------------------
  // 8. BUDGET / PRICE FILTERING (e.g. Under $100, Under $200, Under 15000 BDT, Cheapest)
  // ---------------------------------------------------------
  const budgetMatch = text.match(/under\s*\$?(\d+)/i) || text.match(/below\s*\$?(\d+)/i) || text.match(/less\s*than\s*\$?(\d+)/i);
  const bdtBudgetMatch = text.match(/under\s*৳?(\d+)\s*(bdt|taka)/i) || text.match(/(\d+)\s*(bdt|taka)/i);

  if (budgetMatch || bdtBudgetMatch || lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable') || lower.includes('most expensive') || lower.includes('highest price') || lower.includes('flagship')) {
    let targetUSD = 9999;
    
    if (bdtBudgetMatch) {
      const bdtAmount = parseFloat(bdtBudgetMatch[1]);
      const rate = CURRENCIES.BDT ? CURRENCIES.BDT.rate : 121.5;
      targetUSD = bdtAmount / rate;
    } else if (budgetMatch) {
      const budgetValue = parseFloat(budgetMatch[1]);
      const currentRate = CURRENCIES[currency]?.rate || 1.0;
      targetUSD = budgetValue / currentRate;
    }

    if (lower.includes('cheapest') || lower.includes('lowest price') || lower.includes('most affordable')) {
      const sorted = [...products].sort((a, b) => a.price - b.price);
      const top3 = sorted.slice(0, 3);
      result.text = `Our most accessible precision hardware entries begin at just **${formatConciergePrice(top3[0].price, currency)}**:\n\n` +
        top3.map(p => `• **${p.name}** — **${formatConciergePrice(p.price, currency)}** (${p.tagline})`).join('\n') +
        `\n\nDespite their accessible price, each carries our 2-Year International Aura Care Warranty and DHL Express shipping.`;
      result.products = top3;
      result.suggestions = [`Inspect ${top3[0].name.split(' ')[1]}`, "What is your return policy?", "Show headphones"];
      return result;
    }

    if (lower.includes('most expensive') || lower.includes('flagship') || lower.includes('luxury') || lower.includes('highest end')) {
      const sorted = [...products].sort((a, b) => b.price - a.price);
      const top3 = sorted.slice(0, 3);
      result.text = `Aura's ultra-flagship references represent the absolute pinnacle of our acoustic and biometric research:\n\n` +
        top3.map(p => `• **${p.name}** — **${formatConciergePrice(p.price, currency)}** (${p.tagline})`).join('\n') +
        `\n\nEngineered with hand-selected vacuum tubes, 360W spatial acoustics, and Grade 5 titanium.`;
      result.products = top3;
      result.suggestions = [`View ${top3[0].name.split(' ')[1]}`, "Compare flagships", "Can I pay in BDT?"];
      return result;
    }

    // Filter by budget ceiling
    const affordableProds = products.filter(p => p.price <= targetUSD).sort((a, b) => a.price - b.price);
    if (affordableProds.length > 0) {
      const topProds = affordableProds.slice(0, 3);
      result.text = `I found **${affordableProds.length}** precision Aura hardware devices within your budget:\n\n` +
        topProds.map(p => `• **${p.name}** — **${formatConciergePrice(p.price, currency)}** (${p.tagline})`).join('\n') +
        `\n\nAll orders over $100 qualify for free worldwide DHL Express carbon-neutral dispatch.`;
      result.products = topProds;
      result.suggestions = [`Details on ${topProds[0].name.split(' ')[1]}`, "Show all accessories", "Can I pay in installments?"];
      return result;
    } else {
      result.text = `Our precision hardware lineup starts at **${formatConciergePrice(79, currency)}** for the Aura Halo Smart Diffuser and Studio Monitor Stands. Here are our most accessible selections:`;
      const cheapest = [...products].sort((a, b) => a.price - b.price).slice(0, 2);
      result.products = cheapest;
      result.suggestions = ["Show cheapest items", "What discounts are available?", "Return policy"];
      return result;
    }
  }

  // ---------------------------------------------------------
  // 9. CATEGORY INQUIRIES (Audio, Wearables, Smart Home, Accessories)
  // ---------------------------------------------------------
  if (lower.includes('audio') || lower.includes('sound') || lower.includes('music') || lower.includes('listen') || lower.includes('speaker') || lower.includes('headphones')) {
    const audioProds = products.filter(p => p.category === 'audio');
    result.text = `Aura's **Studio Wireless Audio** ecosystem is engineered around beryllium diaphragms, lossless Bluetooth 5.4, and vacuum-tube analog conversion:\n\n` +
      audioProds.slice(0, 3).map(p => `• **${p.name}** (${formatConciergePrice(p.price, currency)}) — ${p.tagline}`).join('\n') +
      `\n\nWould you prefer over-ear noise cancellation, pocket true-wireless earbuds, or our 360W reference soundbar?`;
    result.products = audioProds.slice(0, 3);
    result.links = [{ label: 'Explore Studio Wireless Audio', path: '/products?category=audio' }];
    result.suggestions = ["Compare Headphones vs Earbuds", "Which has longest battery?", "Tell me about the Tube DAC"];
    return result;
  }

  if (lower.includes('wearable') || lower.includes('watch') || lower.includes('fitness') || lower.includes('health') || lower.includes('smartwatch') || lower.includes('ring')) {
    const wearableProds = products.filter(p => p.category === 'wearables');
    result.text = `Our **Smart Wearables** collection pairs Grade 5 titanium, DLC coatings, and medical-grade biometric monitoring:\n\n` +
      wearableProds.map(p => `• **${p.name}** (${formatConciergePrice(p.price, currency)}) — ${p.tagline}`).join('\n') +
      `\n\nEach device connects seamlessly with Apple Health, Google Fit, and Aura's private biometric engine.`;
    result.products = wearableProds;
    result.links = [{ label: 'Explore Smart Wearables', path: '/products?category=wearables' }];
    result.suggestions = ["Compare Horizon Watch and Smart Ring", "What colors does the smartwatch have?", "Is the ring waterproof?"];
    return result;
  }

  if (lower.includes('home') || lower.includes('living') || lower.includes('ambience') || lower.includes('diffuser') || lower.includes('light') || lower.includes('purifier')) {
    const homeProds = products.filter(p => p.category === 'smart-home');
    result.text = `Aura **Smart Living & Ambience** elevates architectural interiors through clean air, circadian lighting, and ultrasonic diffusers:\n\n` +
      homeProds.map(p => `• **${p.name}** (${formatConciergePrice(p.price, currency)}) — ${p.tagline}`).join('\n') +
      `\n\nFully compatible with Matter, Apple HomeKit, and wireless RF rotary dials.`;
    result.products = homeProds;
    result.links = [{ label: 'Explore Smart Living', path: '/products?category=smart-home' }];
    result.suggestions = ["How does the Lumix desk light work?", "Diffuser run time", "Air purifier CADR rating"];
    return result;
  }

  if (lower.includes('accessory') || lower.includes('accessories') || lower.includes('workspace') || lower.includes('desk') || lower.includes('keyboard') || lower.includes('mouse') || lower.includes('stand')) {
    const accProds = products.filter(p => p.category === 'accessories');
    result.text = `Our **Workspace Gadgets & Gear** are machined from solid CNC aluminum blocks and cast carbon steel to optimize focus and posture:\n\n` +
      accProds.slice(0, 3).map(p => `• **${p.name}** (${formatConciergePrice(p.price, currency)}) — ${p.tagline}`).join('\n') +
      `\n\nEngineered for high-output engineering, typing, and creative workstations.`;
    result.products = accProds.slice(0, 3);
    result.links = [{ label: 'Explore Workspace Gadgets', path: '/products?category=accessories' }];
    result.suggestions = ["What switches are in the Vertex keyboard?", "Nomad 100W power bank capacity", "Ergonomic mouse battery life"];
    return result;
  }

  // ---------------------------------------------------------
  // 10. LIFESTYLE & USE-CASE RECOMMENDATIONS (Gym, Office, Travel, Sleep, Gifts)
  // ---------------------------------------------------------
  if (lower.includes('gym') || lower.includes('workout') || lower.includes('running') || lower.includes('exercise') || lower.includes('sport')) {
    const gymPicks = products.filter(p => p.id === 'prod-2' || p.id === 'prod-8' || p.id === 'prod-9');
    result.text = `For high-intensity workouts, running, and athletic training, we recommend our sweat-sealed biometric lineup:\n\n` +
      `1. **Aura Pulse Horizon Smartwatch Pro**: 5 ATM swim-proof, Grade 5 titanium, real-time heart rate zones & offline GPS.\n` +
      `2. **Aura Pro ANC In-Ear Earbuds**: IPX5 sweat-proof beryllium drivers that never slip out during sprints.\n` +
      `3. **Aura Track Fitness Band**: Ultra-featherweight 28g profile with 5-day continuous biometric wear.`;
    result.products = gymPicks;
    result.suggestions = ["Compare Smartwatch and Fitness Band", "Are the earbuds sweat resistant?", "Add Earbuds to bag"];
    return result;
  }

  if (lower.includes('work from home') || lower.includes('wfh') || lower.includes('desk setup') || lower.includes('office setup') || lower.includes('desk')) {
    const wfhPicks = products.filter(p => p.id === 'prod-3' || p.id === 'prod-4' || p.id === 'prod-16');
    result.text = `For an executive, clutter-free workspace that minimizes eye strain and physical fatigue, we recommend:\n\n` +
      `1. **Lumix Aura Ambient Desk Bar Light**: Asymmetric optical anti-glare lighting to protect eyesight during long coding sessions.\n` +
      `2. **Vertex Precision Mechanical Keyboard**: Solid 1.45kg CNC aluminum with creamy pre-lubed linear switches.\n` +
      `3. **Aura Precision Ergonomic Vertical Mouse**: Natural 57° handshake angle that eliminates wrist strain.`;
    result.products = wfhPicks;
    result.suggestions = ["Tell me about the Lumix Desk Bar", "What switches are in the keyboard?", "Show 3-in-1 MagSafe stand"];
    return result;
  }

  if (lower.includes('sleep') || lower.includes('recovery') || lower.includes('relax') || lower.includes('insomnia')) {
    const sleepPicks = products.filter(p => p.id === 'prod-12' || p.id === 'prod-7' || p.id === 'prod-14');
    result.text = `For deep restorative sleep and recovery monitoring, our top picks are:\n\n` +
      `1. **Aura Smart Ring Gen 3**: 3.8g ultra-light titanium ring that monitors REM/deep sleep stages, HRV, and skin temperature changes without wrist bulk.\n` +
      `2. **Aura Halo Atmosphere Diffuser**: Whisper-quiet (<20dB) cold ultrasonic diffusion for calming lavender or eucalyptus oils.\n` +
      `3. **Aura Pure Air Purifier**: 18dB ultra-silent Night Mode with HEPA H13 filtration for dust-free breathing.`;
    result.products = sleepPicks;
    result.suggestions = ["Tell me about the Smart Ring", "Is the diffuser noisy?", "What colors does the ring come in?"];
    return result;
  }

  if (lower.includes('gift') || lower.includes('present') || lower.includes('recommend for a friend') || lower.includes('birthday')) {
    const giftPicks = products.filter(p => p.id === 'prod-6' || p.id === 'prod-7' || p.id === 'prod-12');
    result.text = `Here are our most celebrated gifts, universally loved for their minimalist Nordic aesthetics and bespoke packaging:\n\n` +
      `• **Titan Orbit MagSafe 3-in-1 Charging Stand** (${formatConciergePrice(89, currency)}): Elegant bedside or desk charging in brushed zinc and vegan leather.\n` +
      `• **Aura Halo Smart Home Atmosphere Diffuser** (${formatConciergePrice(79, currency)}): Ambient halo glow and ultrasonic aromatherapy.\n` +
      `• **Aura Smart Ring Gen 3** (${formatConciergePrice(299, currency)}): The ultimate personal luxury tech piece in Stealth Black, Polished Silver, or Desert Gold.`;
    result.products = giftPicks;
    result.suggestions = ["Gift under $100", "Show colors for Smart Ring", "What is your return policy?"];
    return result;
  }

  // ---------------------------------------------------------
  // 11. GENERAL TECH & ENGINEERING EXPLANATIONS
  // ---------------------------------------------------------
  for (const [key, explanation] of Object.entries(TECH_EXPLANATIONS)) {
    if (lower.includes(key)) {
      result.text = explanation;
      if (key === 'anc') {
        result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-9');
      } else if (key === 'beryllium') {
        result.products = products.filter(p => p.id === 'prod-9');
      } else if (key === 'titanium') {
        result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-2' || p.id === 'prod-12');
      } else if (key === 'dac') {
        result.products = products.filter(p => p.id === 'prod-11');
      } else if (key === 'cadr') {
        result.products = products.filter(p => p.id === 'prod-14');
      } else if (key === 'atm' || key === 'ecg') {
        result.products = products.filter(p => p.id === 'prod-2');
      }
      result.suggestions = ["Which products feature this?", "Check product specifications", "Compare models"];
      return result;
    }
  }

  // ---------------------------------------------------------
  // 12. BRAND IDENTITY, PHILOSOPHY & ABOUT AURA
  // ---------------------------------------------------------
  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('are you an ai') || lower.includes('are you human') || lower.includes('chatbot') || lower.includes('chatgpt')) {
    result.text = "I am the **Aura Hardware Concierge**, a specialized digital hardware engineer and shopping advisor. I have direct access to our manufacturing tolerances, acoustic frequency charts, DHL Express logistics network, and serial registry. How can I assist with your setup today?";
    result.suggestions = ["What are your bestselling headphones?", "Can I pay in BDT?", "Track my DHL package"];
    return result;
  }

  if (lower.includes('what is aura') || lower.includes('who is aura') || lower.includes('about aura') || lower.includes('company') || lower.includes('where are you based') || lower.includes('founded') || lower.includes('philosophy') || lower.includes('ceo')) {
    result.text = "**Aura** is an avant-garde acoustic and biometric hardware design studio founded in Zurich and San Francisco.\n\n• **Core Philosophy**: Uncompromising engineering purity. We combine Grade 5 Aerospace Titanium, beryllium acoustic drivers, and Scandinavian minimalism.\n• **Quality Standard**: Every unit is laser-serialized, stress-tested, and backed by a 2-Year International Replacement Warranty.\n• **Global Reach**: We ship worldwide via carbon-neutral DHL Express to over 140 countries.";
    result.suggestions = ["View product catalog", "What is your warranty policy?", "Explore Studio Audio"];
    result.links = [{ label: 'Explore Products', path: '/products' }, { label: 'Warranty Portal', path: '/warranty' }];
    return result;
  }

  // ---------------------------------------------------------
  // 13. WITTY / PLAYFUL CONVERSATIONAL PROMPTS
  // ---------------------------------------------------------
  if (lower.includes('joke') || lower.includes('funny') || lower.includes('humor') || lower.includes('laugh')) {
    const randomJoke = HARDWARE_JOKES[Math.floor(Math.random() * HARDWARE_JOKES.length)];
    result.text = `${randomJoke}\n\nCan I help you with any serious acoustic or biometric hardware specs now?`;
    result.suggestions = ["Which headphones have the best bass?", "Show me smartwatches", "What is the warranty policy?"];
    return result;
  }

  if (lower.includes('thank') || lower.includes('thanks') || lower.includes('awesome') || lower.includes('great') || lower.includes('appreciate') || lower.includes('good job')) {
    result.text = "You are most welcome! Aura hardware is built to perform flawlessly for years. Let me know if you need assistance with technical specs, courier delivery, or serial verification anytime.";
    result.suggestions = ["Track my DHL shipment", "Inspect flagship audio", "Verify a serial number"];
    return result;
  }

  if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'greetings' || lower.startsWith('good morning') || lower.startsWith('good afternoon') || lower.startsWith('good evening')) {
    const greetingName = user?.name ? ` ${user.name}` : '';
    result.text = `Hello${greetingName}! Welcome to the **Aura Hardware Concierge**.\n\nI can assist you with:\n• Deep technical specs (battery hours, drivers, water resistance, materials)\n• Live DHL Express tracking and order status\n• Authentic 2-Year warranty & serial number verification\n• Multi-currency pricing (including BDT ৳, USD, EUR, GBP, JPY)\n• Side-by-side product comparisons\n\nWhat are you curious about today?`;
    result.suggestions = [
      "Which headphones have longest battery?",
      "Can I pay in BDT?",
      "Are earbuds sweat resistant?",
      "Track my DHL package"
    ];
    return result;
  }

  // ---------------------------------------------------------
  // 14. SEMANTIC FUZZY SEARCH FALLBACK
  // ---------------------------------------------------------
  // Extract keywords and match against all products' text
  const tokens = lower.split(/[^a-z0-9]+/).filter(t => t.length > 2 && !['the', 'and', 'for', 'with', 'what', 'can', 'you', 'how', 'show', 'tell', 'want', 'have', 'are'].includes(t));
  
  if (tokens.length > 0) {
    const scoredProducts = products.map(p => {
      let score = 0;
      const haystack = `${p.name} ${p.category} ${p.tagline} ${p.description} ${p.features?.join(' ')} ${JSON.stringify(p.specs || {})}`.toLowerCase();
      for (const token of tokens) {
        if (haystack.includes(token)) score += 1;
      }
      return { product: p, score };
    }).filter(sp => sp.score > 0).sort((a, b) => b.score - a.score);

    if (scoredProducts.length > 0) {
      const topMatches = scoredProducts.slice(0, 3).map(sp => sp.product);
      result.text = `Based on your inquiry regarding "${text}", here are the top matched Aura engineering designs:\n\n` +
        topMatches.map(p => `• **${p.name}** (${formatConciergePrice(p.price, currency)}) — ${p.tagline}`).join('\n') +
        `\n\nWould you like a full breakdown of their technical specs, battery life, or available finishes?`;
      result.products = topMatches;
      result.activeProduct = topMatches[0];
      result.suggestions = [`Inspect ${topMatches[0].name.split(' ')[1]}`, "Compare with other models", "What is your warranty?"];
      result.links = [{ label: `View ${topMatches[0].name}`, path: `/product/${topMatches[0].id}` }];
      return result;
    }
  }

  // ---------------------------------------------------------
  // 15. ELEGANT UNIVERSAL FALLBACK
  // ---------------------------------------------------------
  result.text = `Aura crafts aerospace-grade acoustic, biometric, and workspace hardware built from titanium, beryllium, and precision CNC aluminum.\n\nWhile I analyze your specific inquiry, feel free to ask about:\n• **Hardware Specs**: Battery life, water resistance (5 ATM/IPX), driver sizes, weight\n• **Logistics**: Carbon-neutral DHL Express worldwide delivery timelines\n• **Customer Care**: 2-Year International Warranty and 30-day risk-free trials\n• **Currencies**: Localized pricing in BDT (৳), USD ($), EUR (€), GBP (£), and JPY (¥)\n• **Recommendations**: Curated setups for gym, executive desks, or travel.`;
  result.products = products.slice(0, 2);
  result.suggestions = [
    "Which headphones have the longest battery life?",
    "Can I pay in BDT?",
    "What is your return & warranty policy?",
    "Compare smartwatch and fitness band"
  ];
  result.links = [
    { label: 'Explore All Products', path: '/products' },
    { label: 'Comparison Matrix', path: '/compare' },
    { label: 'Verify Serial Number', path: '/warranty' }
  ];
  return result;
}
