export const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'Sparkles' },
  { id: 'audio', name: 'Premium Audio', icon: 'Headphones' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'Watch' },
  { id: 'smart-home', name: 'Smart Living', icon: 'Home' },
  { id: 'accessories', name: 'Workspace Gear', icon: 'Laptop' },
];

export const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Aura Studio Wireless Over-Ear Headphones',
    category: 'audio',
    price: 349,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 128,
    stock: 14,
    badge: 'Best Seller',
    tagline: 'Immersive spatial audio with adaptive noise cancellation',
    description: 'Engineered for audio purists and daily commuters alike. Features custom 40mm titanium drivers, lossless 24-bit audio playback, and ultra-plush memory foam cushions for all-day comfort.',
    features: [
      'Active Noise Cancellation with Transparency Mode',
      'Up to 45 hours battery life on single charge',
      'Ultra-low latency Bluetooth 5.4 with multipoint pairing',
      'Custom acoustic tuning via companion app'
    ],
    specs: {
      'Battery Life': '45 Hours',
      'Connectivity': 'Bluetooth 5.4 / USB-C Lossless',
      'Weight': '255g',
      'Driver Size': '40mm Custom Titanium'
    },
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Space Black', hex: '#18181b' },
      { name: 'Platinum Silver', hex: '#e2e8f0' },
      { name: 'Midnight Navy', hex: '#1e3a8a' }
    ],
    reviews: [
      { id: 'r1', author: 'Alexander M.', rating: 5, date: '2 days ago', title: 'Flawless soundstage', comment: 'The clarity across highs and deep sub-bass is unmatched at this price point. Noise cancellation easily rivals flagship competitors.' },
      { id: 'r2', author: 'Elena Rostova', rating: 5, date: '1 week ago', title: 'Exceptional build quality', comment: 'The earcups are like pillows. Wore them for a 9-hour flight with zero ear fatigue.' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Aura Pulse Horizon Smartwatch Pro',
    category: 'wearables',
    price: 289,
    originalPrice: 329,
    rating: 4.8,
    reviewsCount: 94,
    stock: 8,
    badge: 'Trending',
    tagline: 'Sapphire glass, titanium chassis, and ECG biometric tracking',
    description: 'The ultimate health and productivity companion on your wrist. Built from aerospace-grade titanium with an always-on 1.4" AMOLED display and 14-day battery reserve.',
    features: [
      'Continuous ECG, SpO2, and HRV biometric tracking',
      'Grade 5 Titanium case with scratchproof sapphire crystal',
      '50m Water Resistance (5 ATM) with swim tracking',
      'Offline onboard GPS and offline maps'
    ],
    specs: {
      'Display': '1.4" Super AMOLED 1000 nits',
      'Chassis': 'Grade 5 Titanium',
      'Battery': 'Up to 14 Days',
      'Water Rating': '5 ATM / 50m'
    },
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Titanium Grey', hex: '#475569' },
      { name: 'Obsidian Black', hex: '#0f172a' },
      { name: 'Rose Gold', hex: '#d97706' }
    ],
    reviews: [
      { id: 'r3', author: 'Marcus Vance', rating: 5, date: '3 days ago', title: 'Best battery life on any smartwatch', comment: 'I only charge this twice a month! Sleep tracking and workout metrics are pinpoint accurate.' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Lumix Aura Ambient Desk Bar Light',
    category: 'smart-home',
    price: 119,
    originalPrice: 149,
    rating: 4.7,
    reviewsCount: 63,
    stock: 22,
    badge: 'Popular',
    tagline: 'Asymmetric optical glare-free screen monitor illumination',
    description: 'Say goodbye to eye strain. Features precision asymmetric optical engineering that illuminates your entire desk surface without causing any screen reflection or glare.',
    features: [
      'Wireless rotary desktop dial for brightness & color temperature',
      'Zero screen glare asymmetric light distribution',
      'Automatic ambient light sensor adjustments',
      'Backlit RGB bias ambient glow mode'
    ],
    specs: {
      'Color Temp': '2700K - 6500K Adjustable',
      'Brightness': 'Up to 500 Lux',
      'Control': 'Wireless 2.4GHz Rotary Dial',
      'Mount': 'Universal weighted clamp'
    },
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517495306984-f84210f9daa8?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Matte Charcoal', hex: '#1e293b' },
      { name: 'Anodized Silver', hex: '#cbd5e1' }
    ],
    reviews: [
      { id: 'r4', author: 'Sarah K.', rating: 5, date: '1 month ago', title: 'Essential for desk workers', comment: 'Eliminated my evening headaches from staring at twin monitors. The wireless puck control is slick.' }
    ]
  },
  {
    id: 'prod-4',
    name: 'Vertex Precision Mechanical Keyboard',
    category: 'accessories',
    price: 189,
    originalPrice: 219,
    rating: 4.9,
    reviewsCount: 154,
    stock: 6,
    badge: 'Editor’s Choice',
    tagline: 'Hot-swappable gasket-mounted tactile typing experience',
    description: 'A masterpiece of acoustics and tactile response. CNC aluminum enclosure, five layers of sound dampening foam, factory-lubed linear switches, and seamless tri-mode wireless connectivity.',
    features: [
      'Tri-mode wireless (2.4GHz, Bluetooth 5.2, USB-C)',
      'Gasket mounted with five acoustic sound-dampening layers',
      'South-facing per-key RGB with double-shot PBT keycaps',
      'Hot-swappable switch sockets (3-pin & 5-pin compatible)'
    ],
    specs: {
      'Layout': '75% Compact with CNC Knob',
      'Weight': '1.45 kg Solid CNC Aluminum',
      'Battery': '4000mAh (up to 200 hours)',
      'Switches': 'Pre-lubed Cream Linear'
    },
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Moonlight Grey', hex: '#334155' },
      { name: 'Retro Cream', hex: '#fef3c7' }
    ],
    reviews: [
      { id: 'r5', author: 'David Chen', rating: 5, date: '2 weeks ago', title: 'The sound is pure satisfaction', comment: 'The deepest, most satisfying "thock" right out of the box without having to mod anything.' }
    ]
  },
  {
    id: 'prod-5',
    name: 'Aura SoundPod Mini Hi-Fi Smart Speaker',
    category: 'audio',
    price: 159,
    originalPrice: 179,
    rating: 4.6,
    reviewsCount: 42,
    stock: 19,
    badge: 'New',
    tagline: '360° omnidirectional high-fidelity room-filling sound',
    description: 'Compact size with explosive room presence. Dual passive radiators and a custom downward-firing neodymium subwoofer produce rich bass and crystal-clear vocals in any room.',
    features: [
      '360° room-filling acoustic architecture',
      'AirPlay 2, Spotify Connect, and Google Cast support',
      'Stereo pairing mode for multi-room synchronization',
      'Touch-capacitive glass surface with ambient breathing ring'
    ],
    specs: {
      'Acoustics': 'High-excursion woofer + dual tweeters',
      'Dimensions': '115mm x 115mm x 140mm',
      'Connectivity': 'Wi-Fi 6 & Bluetooth 5.3',
      'Voice Assist': 'Private offline micro-array mic'
    },
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Glacier White', hex: '#f8fafc' },
      { name: 'Graphite Black', hex: '#1e293b' }
    ],
    reviews: [
      { id: 'r6', author: 'Clara Oswald', rating: 4, date: '4 days ago', title: 'Huge sound for a compact footprint', comment: 'Pairs instantly with iPhone and Mac. Bass doesn’t distort even at 90% volume.' }
    ]
  },
  {
    id: 'prod-6',
    name: 'Titan Orbit MagSafe Wireless Charging Stand',
    category: 'accessories',
    price: 89,
    originalPrice: 109,
    rating: 4.8,
    reviewsCount: 78,
    stock: 31,
    badge: '20% OFF',
    tagline: '3-in-1 fast wireless charging hub for Phone, Watch, and Earbuds',
    description: 'Declutter your nightstand and desk with solid zinc alloy precision. Delivers full 15W Qi2 certified fast charging simultaneously to your smartphone, watch, and wireless charging case.',
    features: [
      '15W Qi2 fast charging certified magnetic pad',
      'Heavy weighted base so you can remove your phone with one hand',
      'Adjustable 45° tilt ball head for FaceTime and StandBy mode',
      'Braided 2m USB-C PD cable included'
    ],
    specs: {
      'Charging Speeds': '15W Phone + 5W Watch + 5W Buds',
      'Material': 'Brushed Zinc Alloy & Vegan Leather',
      'Safety': 'Foreign Object & Thermal Protection',
      'Weight': '420g Anti-Slip weighted'
    },
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622445262464-84b1b0e605d6?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Space Grey', hex: '#334155' },
      { name: 'Silver White', hex: '#f1f5f9' }
    ],
    reviews: [
      { id: 'r7', author: 'Liam Patterson', rating: 5, date: '3 weeks ago', title: 'Finally a stand heavy enough to not slide', comment: 'The magnets snap on super strong and the weighted base doesn’t lift off my nightstand.' }
    ]
  },
  {
    id: 'prod-7',
    name: 'Aura Halo Smart Home Atmosphere Diffuser',
    category: 'smart-home',
    price: 79,
    originalPrice: 99,
    rating: 4.7,
    reviewsCount: 37,
    stock: 12,
    badge: 'Popular',
    tagline: 'Ultrasonic aroma mist with ambient gradient flame lighting',
    description: 'Transform your space into a sanctuary of calm. Employs high-frequency ultrasonic vibrations to disperse pure essential oils accompanied by a hyper-realistic warm flame visual effect.',
    features: [
      'Simulated soothing flame light visual effect',
      'Whisper-quiet operation (< 20dB) for bedroom use',
      'Automatic waterless shutoff protection sensor',
      'Smart timer modes (2h, 4h, 8h continuous)'
    ],
    specs: {
      'Water Tank': '300ml (Up to 12h run time)',
      'Noise Level': '< 20dB Ultra Quiet',
      'Coverage': 'Up to 350 sq ft',
      'Power': 'USB-C Universal 5V/2A'
    },
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Nordic Stone', hex: '#64748b' },
      { name: 'Off White', hex: '#f8fafc' }
    ],
    reviews: [
      { id: 'r8', author: 'Chloe Bennett', rating: 5, date: '1 week ago', title: 'Looks like real fire!', comment: 'The mist plus orange LED looks genuinely like a miniature fireplace. Very relaxing.' }
    ]
  },
  {
    id: 'prod-8',
    name: 'Aura Track Smart Biometric Fitness Band',
    category: 'wearables',
    price: 139,
    originalPrice: 169,
    rating: 4.5,
    reviewsCount: 88,
    stock: 15,
    badge: 'Sale',
    tagline: 'Screen-free recovery and sleep optimization wearable',
    description: 'Zero screen distractions, 100% focus on human performance. Worn 24/7 on wrist or bicep to calibrate physical exertion, sleep stages, and recovery readiness score.',
    features: [
      'Screenless minimalist textile band for zero distractions',
      'Strain, sleep debt, and autonomic recovery insights',
      'Wireless slide-on battery pack (charge while wearing)',
      'Submersible waterproof up to 10 meters'
    ],
    specs: {
      'Battery': '5 Days Continuous Wear',
      'Sensors': 'Optical PPG Heart Rate, Skin Temp, EDA',
      'Weight': '28g Ultra-featherweight',
      'Waterproof': '10m IP68'
    },
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { name: 'Onyx Black', hex: '#0f172a' },
      { name: 'Alpine Moss', hex: '#166534' }
    ],
    reviews: [
      { id: 'r9', author: 'Noah Miller', rating: 5, date: '5 days ago', title: 'Changed my sleep habits', comment: 'Seeing actual HRV recovery numbers helped me optimize my workouts and cut down late night screen time.' }
    ]
  }
];
