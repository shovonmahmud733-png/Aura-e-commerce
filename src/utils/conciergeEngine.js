import { CURRENCIES, formatCurrency, convertCurrency } from './formatters.js';

// Synonyms and alias dictionary for all 18 catalog products
export const PRODUCT_ALIASES = {
  'prod-1': ['headphones', 'over ear', 'studio wireless', 'aura studio', 'anc headphones', 'earcups', 'headphone', 'headset', 'audio over ear'],
  'prod-2': ['smartwatch', 'horizon', 'smart watch', 'wrist watch', 'pulse horizon', 'ecg watch', 'watch pro', 'watch', 'wristband watch'],
  'prod-3': ['desk bar', 'light bar', 'screenbar', 'monitor light', 'lumix', 'ambient light', 'desk light', 'monitor lamp', 'screen light'],
  'prod-4': ['keyboard', 'mechanical keyboard', 'vertex', 'mechanical', 'switches', 'cream linear', 'keys', 'typing', 'board'],
  'prod-5': ['soundpod', 'smart speaker', 'hifi speaker', 'mini speaker', 'speaker', 'home speaker', 'sound pod', 'desk speaker'],
  'prod-6': ['magsafe stand', 'titan orbit', 'wireless charger', 'charging stand', '3 in 1 charger', 'charger stand', 'orbit stand', 'magsafe'],
  'prod-7': ['diffuser', 'halo', 'aroma', 'atmosphere diffuser', 'essential oil', 'humidifier', 'scent diffuser', 'aromatherapy'],
  'prod-8': ['fitness band', 'aura track', 'tracker band', 'fitness tracker', 'activity tracker', 'smart band', 'wristband'],
  'prod-9': ['earbuds', 'in ear', 'pro anc', 'true wireless', 'tws', 'beryllium earbuds', 'ear bud', 'airpods alternative', 'in-ear'],
  'prod-10': ['soundbar', 'home theater', 'subwoofer', 'studio reference soundbar', 'tv speaker', 'spatial audio', 'sound bar', 'living room sound'],
  'prod-11': ['tube dac', 'dac', 'headphone amplifier', 'amp', 'master tube', 'audiophile amp', 'dsd512', 'tube amp', 'preamp'],
  'prod-12': ['smart ring', 'ring', 'biometric ring', 'gen 3 ring', 'aura ring', 'sleep ring', 'finger ring'],
  'prod-13': ['eyewear', 'smart glasses', 'audio glasses', 'horizon glasses', 'sunglasses', 'smart audio eyewear', 'glasses', 'frames'],
  'prod-14': ['air purifier', 'pure air', 'hepa', 'cadr', 'purifier', 'clean air', 'room purifier', 'filter', 'air cleaner'],
  'prod-15': ['hex panels', 'light panels', 'hexagon', 'wall lights', 'modular light', 'rgb panels', 'aura hex', 'hexagonal lights'],
  'prod-16': ['mouse', 'vertical mouse', 'ergonomic mouse', 'precision mouse', 'track mouse', 'wireless mouse', 'ergonomic'],
  'prod-17': ['power bank', 'nomad', 'laptop charger', '20000mah', 'portable battery', '100w charger', 'battery bank', 'portable charger'],
  'prod-18': ['desktop stands', 'monitor stands', 'speaker stands', 'acoustic stands', 'stands', 'studio stands', 'metal stands', 'speaker riser']
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
    if (clean.includes(product.name.toLowerCase())) {
      matched.push(product);
      continue;
    }
    if (clean.includes(product.id.toLowerCase())) {
      matched.push(product);
      continue;
    }
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
 * Call Google Gemini Generative AI API (when API key is provided)
 */
export async function callGeminiConcierge(query, history = [], context = {}, apiKey = '') {
  const { products = [], currency = 'USD', user = null, orders = [] } = context;

  // Build condensed catalog summary for system prompt
  const catalogSummary = products.map(p => 
    `[ID: ${p.id}] ${p.name} | Category: ${p.category} | Price: $${p.price} (USD) | Serial: ${p.serialNumber} | Colors: ${(p.colors || []).map(c => c.name).join(', ')} | Highlights: ${(p.features || []).slice(0, 3).join('; ')}`
  ).join('\n');

  const systemInstruction = `You are the Aura Hardware Concierge, the official AI shopping engineer and hardware specialist for "Aura" (a luxury consumer tech, audiophile, and biometric hardware brand founded in Zurich and San Francisco).
Brand Identity: Precision Grade 5 Titanium, Scandinavian minimalism, uncompromised acoustic fidelity, no subscription paywalls, 2-Year Global Aura Care Warranty, 30-day risk-free trial, worldwide carbon-neutral DHL Express delivery.
Active Currency: ${currency} (1 USD ≈ ${CURRENCIES[currency]?.rate || 1.0} ${currency}).
Active User: ${user ? `${user.name} (${user.email})` : 'Guest Shopper'}.
Store Coupons: 'SAVE20' (20% off entire order), 'AURA10' (10% off), 'FREESHIP' (free express shipping).

Aura Catalog of 18 Products:
${catalogSummary}

Customer Orders:
${orders.length > 0 ? JSON.stringify(orders.map(o => ({ id: o.id, tracking: o.trackingNumber, date: o.date, delivery: o.estimatedDelivery }))) : 'No previous orders found.'}

Rules for your responses:
1. Always maintain the refined, knowledgeable, professional tone of a high-end hardware engineer.
2. Directly and thoroughly answer ANY question the customer asks—whether it's specific hardware specs, troubleshooting, pairing, comparisons, gifts, cleaning, compatibility (Mac, iPhone, Android, Windows), discounts, international shipping (including Bangladesh / BDT ৳), or casual conversation.
3. When referencing products, use their exact names so our UI can attach interactive product cards.
4. Format key terms and specs in markdown bold (**bold**) and code tags (\`code\`). Keep responses clean, concise, and beautifully structured.
5. If the user asks in Bengali or another language, reply naturally and respectfully in that language.`;

  // Build message history
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nCustomer question: ${query}` }]
    }
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!replyText) {
    throw new Error('Empty response from Gemini API');
  }

  // Extract any products mentioned in the reply
  const attachedProducts = identifyProducts(replyText, products).slice(0, 3);

  return {
    text: replyText,
    products: attachedProducts,
    links: attachedProducts.length > 0 ? [{ label: `View ${attachedProducts[0].name}`, path: `/product/${attachedProducts[0].id}` }] : [],
    suggestions: ["What are the full specs?", "What colors does it come in?", "How much is it in " + currency + "?"],
    activeProduct: attachedProducts[0] || null,
    source: 'gemini'
  };
}

/**
 * Supercharged Local Semantic Knowledge Engine (Runs 100% offline with zero external dependencies)
 */
export function generateLocalConciergeResponse(query, context = {}) {
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

  const result = {
    text: '',
    products: [],
    links: [],
    suggestions: [],
    activeProduct: activeProduct,
    source: 'local'
  };

  // ---------------------------------------------------------
  // 1. COUPONS, DISCOUNTS & PROMOTIONAL CODES
  // ---------------------------------------------------------
  if (lower.includes('coupon') || lower.includes('discount') || lower.includes('promo') || lower.includes('voucher') || lower.includes('sale') || lower.includes('deal') || lower.includes('code') || lower.includes('cheap price')) {
    result.text = "Yes! Aura currently has **3 active VIP promotional codes** that you can apply immediately in the checkout drawer:\n\n" +
      "• **`SAVE20`**: **20% OFF** your entire order subtotal (applicable to all audio, wearables, and desk gear).\n" +
      "• **`AURA10`**: **10% OFF** your order with no minimum spend.\n" +
      "• **`FREESHIP`**: **100% FREE** worldwide carbon-neutral DHL Express priority delivery.\n\n" +
      "Simply enter any of these codes into the **Promo Code** box at checkout, and your total will instantly update!";
    result.links = [{ label: 'Browse Products to Apply Promo', path: '/products' }];
    result.suggestions = ["What payment methods do you accept?", "Can I pay in BDT?", "Show products under $100"];
    return result;
  }

  // ---------------------------------------------------------
  // 2. MAC, IPHONE, ANDROID, WINDOWS & OS COMPATIBILITY
  // ---------------------------------------------------------
  if (lower.includes('mac') || lower.includes('iphone') || lower.includes('ios') || lower.includes('android') || lower.includes('windows') || lower.includes('pc') || lower.includes('linux') || lower.includes('ipad') || lower.includes('ps5') || lower.includes('playstation') || lower.includes('xbox') || lower.includes('compatible')) {
    result.text = "Aura hardware is built on universal, open engineering standards with **100% cross-platform compatibility**:\n\n" +
      "• **Apple iOS & macOS**: Seamless pairing over AAC and Bluetooth 5.4. Companion app available on the App Store with Apple Health and Siri Shortcut integration.\n" +
      "• **Android & Google Pixel**: High-resolution LDAC and aptX lossless audio codecs with Google Fast Pair and Google Fit syncing.\n" +
      "• **Windows & Linux PC**: Instant plug-and-play connectivity. The **Vertex Mechanical Keyboard** features an onboard physical hardware toggle between Mac layout (Command/Option) and Windows layout (Win/Alt), with extra keycaps included.\n" +
      "• **Consoles (PS5 / Switch)**: Connect via ultra-low latency USB-C or Bluetooth transmitter with sub-35ms audio response.";
    result.suggestions = ["Tell me about the Vertex Keyboard", "How do I pair Bluetooth?", "Are headphones multipoint?"];
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-4');
    return result;
  }

  // ---------------------------------------------------------
  // 3. BLUETOOTH PAIRING & MULTIPOINT DUAL DEVICE SWITCHING
  // ---------------------------------------------------------
  if (lower.includes('pair') || lower.includes('bluetooth') || lower.includes('connect') || lower.includes('how to connect') || lower.includes('multipoint') || lower.includes('two phones') || lower.includes('two devices') || lower.includes('switch device')) {
    result.text = "Connecting your Aura wireless hardware is fast and effortless:\n\n" +
      "1. **Initial Pairing**: Press and hold the titanium power button for **3 seconds** until the discrete status LED pulses soft cyan.\n" +
      "2. **Select Device**: Open Bluetooth settings on your iPhone, Android, Mac, or PC and tap **'Aura Studio'** (or your device name).\n" +
      "3. **Multipoint Dual-Device Pairing**: Our **Studio Over-Ear Headphones** and **Pro ANC Earbuds** support simultaneous connection to two devices (e.g. laptop and smartphone). You can listen to music on your computer, and it will automatically pause when a phone call rings on your mobile device!";
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-9');
    result.suggestions = ["Which headphones have longest battery?", "Are earbuds sweat resistant?", "What is in the box?"];
    return result;
  }

  // ---------------------------------------------------------
  // 4. CLEANING, CARE & MAINTENANCE
  // ---------------------------------------------------------
  if (lower.includes('clean') || lower.includes('dishwasher') || lower.includes('maintenance') || lower.includes('care') || lower.includes('dirty') || lower.includes('smell') || (lower.includes('wash') && (lower.includes('diffuser') || lower.includes('ear') || lower.includes('cushion') || lower.includes('pad')))) {
    result.text = "Here are our official hardware care and cleaning recommendations:\n\n" +
      "• **Over-Ear Cushions & Headband**: Gently wipe memory foam earcups with a soft cloth lightly dampened with lukewarm water and mild soap. Never submerge in water.\n" +
      "• **Earbuds & Silicone Tips**: Detach silicone tips and rinse under warm water. Use a 70% isopropyl alcohol swab to gently clean acoustic speaker grilles.\n" +
      "• **Aura Halo Diffuser**: Rinse the water reservoir weekly with a mixture of warm water and a splash of white vinegar to prevent mineral scaling. Do not wash in a dishwasher.\n" +
      "• **Titanium & Aluminum Bodies**: Wipe with a clean dry microfiber cloth to restore the natural matte luster.";
    result.suggestions = ["What does the 2-year warranty cover?", "Are ear cushions replaceable?", "Return policy"];
    return result;
  }

  // ---------------------------------------------------------
  // 5. WATER, SHOWER, SWIMMING & SAUNA SAFETY
  // ---------------------------------------------------------
  if (lower.includes('shower') || lower.includes('swim') || lower.includes('pool') || lower.includes('bath') || lower.includes('sauna') || lower.includes('waterproof') || lower.includes('submerge') || (lower.includes('wash') && (lower.includes('hand') || lower.includes('face') || lower.includes('water')))) {
    result.text = "Here is our official water safety and ingress rating breakdown:\n\n" +
      "• **Aura Pulse Horizon Smartwatch Pro**: Certified **5 ATM / 50m Water Resistance**. Safe for lap swimming, ocean swimming, showering, and water sports. (Avoid hot saunas/steam rooms to protect acoustic silicone seals).\n" +
      "• **Aura Smart Ring Gen 3**: **100m Hydrostatic Titanium Immersion**. 100% safe for showers, swimming, and daily handwashing.\n" +
      "• **Aura Track Fitness Band**: **IP68 (10m submersible)**. Safe for heavy rain, pool laps, and workouts.\n" +
      "• **Aura Pro ANC Earbuds**: **IPX5 nano-coated**. Impervious to heavy sweat, rainstorms, and intense cardio, but not intended for underwater swimming.\n" +
      "• **Studio Over-Ear Headphones**: Sweat-resistant memory foam earcups, but avoid direct water streams.";
    result.products = products.filter(p => p.id === 'prod-2' || p.id === 'prod-12');
    result.suggestions = ["Compare Smartwatch and Smart Ring", "Is the smartwatch battery long?", "What colors does the ring come in?"];
    return result;
  }

  // ---------------------------------------------------------
  // 6. MICROPHONE & CALL QUALITY (ZOOM, TEAMS, PHONE CALLS)
  // ---------------------------------------------------------
  if (lower.includes('microphone') || lower.includes('mic') || lower.includes('call') || lower.includes('zoom') || lower.includes('teams') || lower.includes('meet') || lower.includes('voice') || lower.includes('speak')) {
    result.text = "Aura hardware is engineered specifically for executive clarity during voice and video conferencing:\n\n" +
      "• **Aura Studio Over-Ear Headphones**: Equipped with a **4-microphone beamforming array** powered by an acoustic DSP neural filter that isolates your voice frequencies while eliminating keyboard clatter, coffee shop chatter, and fan noise.\n" +
      "• **Aura Pro In-Ear Earbuds**: Dual beamforming microphones per bud with aerodynamic mesh wind-guards for crystal-clear phone calls even while walking outdoors.\n" +
      "• **Aura Horizon Smart Eyewear**: Open-ear directional sound with bone-conduction proximity mics for private hands-free calls on the go.";
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-9');
    result.suggestions = ["Are headphones comfortable with glasses?", "Check battery life", "What is the price in " + currency + "?"];
    return result;
  }

  // ---------------------------------------------------------
  // 7. CURVED MONITORS & DESK BAR COMPATIBILITY
  // ---------------------------------------------------------
  if (lower.includes('curved') || lower.includes('ultrawide') || lower.includes('monitor light') || lower.includes('screenbar') || lower.includes('desk bar') || lower.includes('glare')) {
    const deskBar = products.find(p => p.id === 'prod-3');
    result.text = "Yes! The **Lumix Aura Ambient Desk Bar Light** is engineered specifically for both flat and curved ultrawide displays:\n\n" +
      "• **Curvature Compatibility**: Fits flat monitors as well as curved displays from **1000R to 1800R** curvature and panel thicknesses up to 45mm.\n" +
      "• **Zero Screen Glare**: Features a precision 45° asymmetric optical hood that casts high-CRI light downward onto your keyboard without bouncing light into your eyes or onto the monitor panel.\n" +
      "• **Wireless 2.4GHz Rotary Puck**: Control brightness and stepless color temperature (2700K warm circadian glow to 6500K daylight) right from your desk pad.\n" +
      "• **No Webcam Interference**: Mounts cleanly without obstructing top-mounted webcams.";
    result.products = deskBar ? [deskBar] : [];
    result.suggestions = ["How much is the Lumix Desk Bar?", "What colors does it come in?", "Show mechanical keyboard"];
    return result;
  }

  // ---------------------------------------------------------
  // 8. GAMING, LATENCY & CONSOLES
  // ---------------------------------------------------------
  if (lower.includes('gaming') || lower.includes('game') || lower.includes('latency') || lower.includes('delay') || lower.includes('lag') || lower.includes('fps')) {
    result.text = "Aura hardware is built for competitive low-latency performance:\n\n" +
      "• **Aura Studio Over-Ear & Pro Earbuds**: Feature an integrated **Ultra-Low Latency Mode (<35ms)** over Bluetooth 5.4, eliminating lip-sync lag in fast-paced competitive FPS games.\n" +
      "• **Wired Lossless Mode**: The Studio Over-Ear includes a USB-C lossless cable delivering **0ms zero-latency** 24-bit/96kHz digital sound directly from PC, Mac, or PS5.\n" +
      "• **Vertex Mechanical Keyboard**: Ultra-fast **1000Hz polling rate** over 2.4GHz wireless or braided USB-C with pre-lubed linear switches for immediate actuation.";
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-4');
    result.suggestions = ["Tell me about the Vertex Keyboard", "What switches are in the keyboard?", "Compare headphones and earbuds"];
    return result;
  }

  // ---------------------------------------------------------
  // 9. SIZING, COMFORT, SMALL EARS & EYEGLASSES
  // ---------------------------------------------------------
  if (lower.includes('small ear') || lower.includes('ear size') || lower.includes('hurt') || lower.includes('pain') || lower.includes('comfortable') || lower.includes('glasses') || lower.includes('big head') || lower.includes('clamping')) {
    result.text = "Ergonomic comfort is at the core of our industrial design:\n\n" +
      "• **Small Ears Friendly**: The **Aura Pro ANC Earbuds** ship with **4 pairs of hypoallergenic silicone tips** (XS, S, M, L) with an ergonomic oval nozzle that seals securely without painful inner-ear pressure.\n" +
      "• **Eyeglass Relief**: The **Aura Studio Over-Ear Headphones** feature ultra-plush memory foam cushions engineered with acoustic relief channels—reducing clamping force to a gentle 4.2N so glasses frames never dig into your temples.\n" +
      "• **Smart Ring Sizing**: Available in standard ring sizes **6 through 13** with seamless inner resin curves that glide comfortably over knuckles.";
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-9' || p.id === 'prod-12');
    result.suggestions = ["What colors does the ring come in?", "Inspect Studio Headphones", "What is the return policy?"];
    return result;
  }

  // ---------------------------------------------------------
  // 10. LOCAL PAYMENT (BKASH, NAGAD, DUAL CURRENCY, CARDS)
  // ---------------------------------------------------------
  if (lower.includes('bkash') || lower.includes('বিকাশ') || lower.includes('nagad') || lower.includes('নগদ') || lower.includes('rocket') || lower.includes('bank transfer') || lower.includes('bangladesh payment') || lower.includes('local card')) {
    result.text = "Payment options for shoppers in **Bangladesh**:\n\n" +
      "• **Dual Currency & International Cards**: You can pay seamlessly at checkout in BDT (৳) using any dual-currency Visa or Mastercard (City Bank, EBL, BRAC Bank, Standard Chartered, MTB, etc.) processed securely via Stripe.\n" +
      "• **Direct BDT Bank Transfer / Mobile Invoicing (bKash/Nagad)**: If you prefer direct local bank payment or bKash corporate invoice clearance, select your items, note your Order ID, and our concierge team (`support@auracommerce.io`) will provide immediate invoice payment guidance.\n" +
      "• **Global Wallets**: Apple Pay and Google Pay are also supported with instant 1-click confirmation.";
    result.suggestions = ["Show all prices in BDT", "How much is shipping to Bangladesh?", "Do you have any discount code?"];
    return result;
  }

  // ---------------------------------------------------------
  // 11. SHIPPING COUNTRIES (BANGLADESH, USA, UK, CANADA, ETC.)
  // ---------------------------------------------------------
  if (lower.includes('ship to') || lower.includes('shipping to') || lower.includes('deliver to') || lower.includes('bangladesh') || lower.includes('canada') || lower.includes('uk') || lower.includes('germany') || lower.includes('australia') || lower.includes('india') || lower.includes('uae') || lower.includes('dubai')) {
    result.text = "Yes! Aura ships worldwide to over **140 countries** via carbon-neutral **DHL Express Priority**:\n\n" +
      "• **Delivery Timeline**: 2–4 business days worldwide (including Dhaka, London, New York, Toronto, Sydney, Berlin, and Dubai).\n" +
      "• **Complimentary Shipping**: 100% free express delivery on all orders over $100.\n" +
      "• **Prepaid Customs (DDP)**: Import duties and clearance are prepaid by Aura—there are never any surprise charges upon delivery.\n" +
      "• **Real-Time Tracking**: Automated DHL tracking codes and step-by-step dispatch notifications are sent within 2 hours of ordering.";
    result.links = [{ label: 'Explore Products', path: '/products' }];
    result.suggestions = ["Can I pay in BDT?", "Track my active DHL order", "What is your warranty policy?"];
    return result;
  }

  // ---------------------------------------------------------
  // 12. ORDER CANCELLATIONS, CHANGES & REFUNDS
  // ---------------------------------------------------------
  if (lower.includes('cancel') || lower.includes('change address') || lower.includes('modify order') || lower.includes('edit order') || lower.includes('wrong address')) {
    result.text = "Order adjustments:\n\n" +
      "• **Dispatch Window**: Because orders are inspected and dispatched within 2 hours, please check your order in **My Orders** or email `support@auracommerce.io` as quickly as possible.\n" +
      "• **Address Changes**: If your parcel has not yet been collected by the DHL courier, our facility team can instantly update your delivery address.\n" +
      "• **Cancellations**: Orders can be canceled for a 100% immediate refund before courier pickup. If already in transit, simply initiate our **30-Day Risk-Free Return** once delivered.";
    result.links = [{ label: 'Go to My Orders', path: '/orders' }, { label: 'Contact Support', path: '/contact' }];
    result.suggestions = ["Track my package", "What is your 30-day return policy?", "Speak to a human"];
    return result;
  }

  // ---------------------------------------------------------
  // 13. WHAT'S IN THE BOX (PACKAGING & ACCESSORIES)
  // ---------------------------------------------------------
  if (lower.includes('in the box') || lower.includes('package include') || lower.includes('unboxing') || lower.includes('accessories included') || lower.includes('comes with')) {
    result.text = "Every Aura device arrives in a luxury 100% plastic-free unboxing suite:\n\n" +
      "• **Aura Studio Over-Ear Headphones**: Magnetic molded travel case, braided USB-C audio cable, 3.5mm gold-plated aux cable, airplane adapter, and serialized warranty card.\n" +
      "• **Aura Pulse Horizon Smartwatch Pro**: Fast magnetic charging dock, quick-release fluoroelastomer strap, and titanium sizing guide.\n" +
      "• **Vertex Mechanical Keyboard**: Braided USB-C cable, 2.4GHz receiver dongle, 2-in-1 switch & keycap puller, and extra Mac/Windows keycaps.\n" +
      "• **Aura Pro ANC Earbuds**: Wireless charging case, 4 pairs of silicone tips (XS, S, M, L), and braided USB-C cable.";
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-2');
    result.suggestions = ["View product details", "What colors are available?", "Check 2-year warranty"];
    return result;
  }

  // ---------------------------------------------------------
  // 14. AURA VS COMPETITORS (APPLE, SONY, BOSE)
  // ---------------------------------------------------------
  if (lower.includes('vs apple') || lower.includes('vs sony') || lower.includes('vs bose') || lower.includes('better than') || lower.includes('why aura') || lower.includes('why should i buy')) {
    result.text = "Why discerning listeners and engineers choose Aura over mainstream competitors:\n\n" +
      "1. **Aerospace Materials**: We use real **Grade 5 Titanium** and solid CNC aluminum where others use painted polycarbonate plastic.\n" +
      "2. **Zero Subscription Paywalls**: Complete biometric telemetry and custom 10-band acoustic EQ tuning are 100% free for life.\n" +
      "3. **Superior Coverage**: 2-Year International Aura Care Warranty included standard (competitors only offer 1 year).\n" +
      "4. **Acoustic Transparency**: Custom titanium and beryllium drivers tuned for true flat audiophile soundstages, not bloated artificial bass.";
    result.suggestions = ["Compare headphones with earbuds", "Show flagship devices", "What is your warranty policy?"];
    result.products = products.filter(p => p.id === 'prod-1' || p.id === 'prod-2');
    return result;
  }

  // ---------------------------------------------------------
  // 15. BANGLA / BENGALI LANGUAGE SUPPORT
  // ---------------------------------------------------------
  if (lower.includes('কেমন') || lower.includes('দাম কত') || lower.includes('ওয়ারেন্টি') || lower.includes('ডেলিভারি') || lower.includes('অর্ডার') || lower.includes('ধন্যবাদ') || lower.includes('ভালো') || lower.includes('আছেন') || lower.includes('পারি') || lower.includes('কোথায়') || lower.includes('কিনা')) {
    result.text = "নমস্কার / আসসালামু আলাইকুম! **Aura Hardware Concierge**-এ আপনাকে স্বাগতম।\n\n" +
      "• **বাংলাদেশ ডেলিভারি**: DHL Express-এর মাধ্যমে মাত্র ২-৪ কার্যদিবসের মধ্যে সরাসরি ঢাকায় এবং সারা বাংলাদেশে ফ্রি ডেলিভারি প্রদান করা হয় (১০০ ডলারের বেশি অর্ডারে)।\n" +
      "• **মুদ্রা (BDT ৳)**: আমাদের ওয়েবসাইটে সরাসরি বাংলাদেশী টাকায় (৳) দাম দেখা এবং ডুয়াল-কারেন্সি কার্ড দিয়ে অর্ডার করা যায়।\n" +
      "• **ওয়ারেন্টি**: প্রতিটি অথেনটিক অরা হার্ডওয়্যারে রয়েছে ২ বছরের গ্লোবাল রিপ্লেসমেন্ট গ্যারান্টি।\n\nআপনি কোন প্রোডাক্ট সম্পর্কে বিস্তারিত জানতে চান?";
    result.suggestions = ["Show prices in BDT", "হাতে পরা স্মার্টওয়াচ সম্পর্কে বলুন", "হেডফোনের দাম কত?"];
    result.products = products.slice(0, 2);
    return result;
  }

  // ---------------------------------------------------------
  // 16. HUMAN AGENT & CUSTOMER SUPPORT CONTACT
  // ---------------------------------------------------------
  if (lower.includes('human') || lower.includes('speak to someone') || lower.includes('real person') || lower.includes('agent') || lower.includes('support email') || lower.includes('phone') || lower.includes('contact')) {
    result.text = "Our human engineering and customer care team is available 24/7:\n\n" +
      "• **Direct Email**: `support@auracommerce.io` (Average human reply time is **under 15 minutes**)\n" +
      "• **Official Help Center**: Visit our `/contact` portal to submit a support ticket or file an express warranty exchange.\n" +
      "• **Live Order Inquiries**: Include your Order ID (e.g. `ORD-84920`) for immediate real-time courier investigation.";
    result.links = [{ label: 'Open Support & Contact Portal', path: '/contact' }];
    result.suggestions = ["Track my DHL shipment", "What is your warranty policy?", "What is your return policy?"];
    return result;
  }

  // ---------------------------------------------------------
  // 17. SERIAL NUMBER & WARRANTY VERIFICATION INQUIRIES
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
  // 18. ORDER TRACKING & DHL SHIPPING TIMELINE
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
  // 19. CURRENCY & PAYMENT INQUIRIES (BDT, USD, STRIPE, ETC.)
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
  // 20. RETURN & REFUND POLICY
  // ---------------------------------------------------------
  if (lower.includes('return') || lower.includes('refund') || lower.includes('money back') || lower.includes('30 day') || lower.includes('satisfaction') || lower.includes('exchange')) {
    result.text = "We want you to experience Aura hardware in your own acoustic and workspace environment with complete peace of mind:\n\n• **30-Day Risk-Free Trial**: Test any Aura device for 30 calendar days.\n• **Prepaid DHL Return Label**: If you are not completely satisfied, we generate a prepaid DHL Express return label.\n• **100% Full Refund**: Reimbursed to your original payment method within 48 hours of warehouse inspection.\n• **Condition**: Devices must be in pristine cosmetic condition with original packaging and serialized accessories.";
    result.links = [{ label: 'Start a Return or Inquiry', path: '/contact' }];
    result.suggestions = ["What does the 2-year warranty cover?", "Track my DHL package", "Which headphones are best?"];
    return result;
  }

  // ---------------------------------------------------------
  // 21. IDENTIFY PRODUCTS MENTIONED IN QUERY
  // ---------------------------------------------------------
  let matchedProducts = identifyProducts(text, products);

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
  // 22. MULTI-PRODUCT COMPARISON (e.g. Watch vs Band, Headphones vs Earbuds)
  // ---------------------------------------------------------
  const isComparisonQuery = lower.includes('compare') || lower.includes('vs') || lower.includes('difference between') || lower.includes('which is better');
  if (isComparisonQuery || matchedProducts.length >= 2) {
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
  // 23. SPECIFIC PRODUCT FEATURE / SPEC / COLOR LOOKUPS
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
  // 24. BUDGET / PRICE FILTERING
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
  // 25. CATEGORY INQUIRIES
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
  // 26. LIFESTYLE & USE-CASE RECOMMENDATIONS (Gym, Office, Travel, Sleep, Gifts)
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

  if (lower.includes('work from home') || lower.includes('wfh') || lower.includes('desk setup') || lower.includes('office setup')) {
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
  // 27. GENERAL TECH & ENGINEERING EXPLANATIONS
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
  // 28. BRAND IDENTITY, PHILOSOPHY & ABOUT AURA
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
  // 29. WITTY / PLAYFUL CONVERSATIONAL PROMPTS
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
  // 30. CONTEXTUAL INTELLIGENT QUESTION ADVISOR (FALLBACK REPLACED)
  // ---------------------------------------------------------
  // Rather than outputting the same static message, dynamically parse what the user is asking about!
  const matchedTokens = lower.split(/[^a-z0-9]+/).filter(t => t.length > 2 && !['the', 'and', 'for', 'with', 'what', 'can', 'you', 'how', 'show', 'tell', 'want', 'have', 'are'].includes(t));

  const scoredProducts = products.map(p => {
    let score = 0;
    const haystack = `${p.name} ${p.category} ${p.tagline} ${p.description} ${p.features?.join(' ')} ${JSON.stringify(p.specs || {})}`.toLowerCase();
    for (const token of matchedTokens) {
      if (haystack.includes(token)) score += 1;
    }
    return { product: p, score };
  }).filter(sp => sp.score > 0).sort((a, b) => b.score - a.score);

  if (scoredProducts.length > 0) {
    const top = scoredProducts.slice(0, 3).map(sp => sp.product);
    result.text = `Regarding your inquiry on **"${text}"**:\n\n` +
      `Our engineering team recommends inspecting the following matched hardware:\n\n` +
      top.map(p => `• **${p.name}** (${formatConciergePrice(p.price, currency)}) — ${p.tagline}`).join('\n') +
      `\n\nEach model is backed by our 2-Year International Aura Care Warranty and free express DHL shipping. Let me know if you would like full technical tolerances, battery runtimes, or finish options!`;
    result.products = top;
    result.activeProduct = top[0];
    result.suggestions = [`Inspect ${top[0].name.split(' ')[1]}`, "What are the specs?", "What colors does it come in?"];
    result.links = [{ label: `View ${top[0].name}`, path: `/product/${top[0].id}` }];
    return result;
  }

  // Conversational response if truly open-ended
  result.text = `Thank you for asking about **"${text}"**.\n\n` +
    `As your Aura Hardware Concierge, I can provide direct answers for:\n` +
    `• **Specific Hardware**: Full specs, battery runtimes, materials, or colors for any of our 18 products.\n` +
    `• **Ecosystem & OS**: Mac, Windows, iOS, and Android pairing or multipoint switching.\n` +
    `• **Order & Logistics**: Live DHL Express transit timeline and customs duties.\n` +
    `• **Protection**: 2-Year International Warranty and 30-day risk-free trials.\n` +
    `• **Promotions**: VIP codes such as \`SAVE20\` (20% off) and \`FREESHIP\`.\n\n` +
    `Feel free to ask for a direct recommendation or hardware comparison!`;
  result.products = products.slice(0, 2);
  result.suggestions = [
    "Do you have any discount code?",
    "Does this work with Mac and iPhone?",
    "Can I pay in BDT?",
    "Track my DHL order"
  ];
  result.links = [
    { label: 'Explore Products', path: '/products' },
    { label: 'Compare Models', path: '/compare' },
    { label: 'Verify Warranty', path: '/warranty' }
  ];
  return result;
}

/**
 * Unified Concierge Query Entrypoint:
 * - Checks for Gemini API key (from context, localStorage, or environment).
 * - If key exists, attempts Gemini 1.5 Flash generative call for unlimited open-ended chat.
 * - If no key or on network failure, falls back seamlessly to the enhanced local engine.
 */
export async function generateConciergeResponse(query, context = {}) {
  const apiKey = context.apiKey || 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('aura_gemini_api_key') : null) || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY : '');

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiRes = await callGeminiConcierge(query, context.messages || [], context, apiKey);
      return geminiRes;
    } catch (err) {
      console.warn('[Aura Concierge] Gemini call failed, falling back to local engine:', err.message);
    }
  }

  return generateLocalConciergeResponse(query, context);
}
