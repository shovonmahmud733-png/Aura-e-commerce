export const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: 'Sparkles' },
  { id: 'audio', name: 'Studio Wireless Audio', icon: 'Headphones' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'Watch' },
  { id: 'smart-home', name: 'Smart Living & Ambience', icon: 'Home' },
  { id: 'accessories', name: 'Workspace Gadgets & Gear', icon: 'Laptop' },
];

export const PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Aura Studio Wireless Over-Ear Headphones',
    serialNumber: 'AUR-HW-9821-AUD',
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
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Space Black', 
        hex: '#18181b', 
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Platinum Silver', 
        hex: '#e2e8f0', 
        image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Midnight Navy', 
        hex: '#1e3a8a', 
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r1', author: 'Alexander M.', rating: 5, date: '2 days ago', title: 'Flawless soundstage', comment: 'The clarity across highs and deep sub-bass is unmatched at this price point. Noise cancellation easily rivals flagship competitors.' },
      { id: 'r2', author: 'Elena Rostova', rating: 5, date: '1 week ago', title: 'Exceptional build quality', comment: 'The earcups are like pillows. Wore them for a 9-hour flight with zero ear fatigue.' }
    ]
  },
  {
    id: 'prod-2',
    name: 'Aura Pulse Horizon Smartwatch Pro',
    serialNumber: 'AUR-HW-8842-WRB',
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
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Titanium Grey', 
        hex: '#475569', 
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Obsidian Black', 
        hex: '#0f172a', 
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Rose Gold', 
        hex: '#d97706', 
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r3', author: 'Marcus Vance', rating: 5, date: '3 days ago', title: 'Best battery life on any smartwatch', comment: 'I only charge this twice a month! Sleep tracking and workout metrics are pinpoint accurate.' }
    ]
  },
  {
    id: 'prod-3',
    name: 'Lumix Aura Ambient Desk Bar Light',
    serialNumber: 'AUR-HW-5510-HOM',
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
      { 
        name: 'Matte Charcoal', 
        hex: '#1e293b', 
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Anodized Silver', 
        hex: '#cbd5e1', 
        image: 'https://images.unsplash.com/photo-1517495306984-f84210f9daa8?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r4', author: 'Sarah K.', rating: 5, date: '1 month ago', title: 'Essential for desk workers', comment: 'Eliminated my evening headaches from staring at twin monitors. The wireless puck control is slick.' }
    ]
  },
  {
    id: 'prod-4',
    name: 'Vertex Precision Mechanical Keyboard',
    serialNumber: 'AUR-HW-7731-ACC',
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
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Moonlight Grey', 
        hex: '#334155', 
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Retro Cream', 
        hex: '#fef3c7', 
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Cyber Black', 
        hex: '#09090b', 
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r5', author: 'David Chen', rating: 5, date: '2 weeks ago', title: 'The sound is pure satisfaction', comment: 'The deepest, most satisfying "thock" right out of the box without having to mod anything.' }
    ]
  },
  {
    id: 'prod-5',
    name: 'Aura SoundPod Mini Hi-Fi Smart Speaker',
    serialNumber: 'AUR-HW-3320-AUD',
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
      { 
        name: 'Glacier White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Graphite Black', 
        hex: '#1e293b', 
        image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r6', author: 'Clara Oswald', rating: 4, date: '4 days ago', title: 'Huge sound for a compact footprint', comment: 'Pairs instantly with iPhone and Mac. Bass doesn’t distort even at 90% volume.' }
    ]
  },
  {
    id: 'prod-6',
    name: 'Titan Orbit MagSafe Wireless Charging Stand',
    serialNumber: 'AUR-HW-4419-ACC',
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
      { 
        name: 'Space Grey', 
        hex: '#334155', 
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Silver White', 
        hex: '#f1f5f9', 
        image: 'https://images.unsplash.com/photo-1622445262464-84b1b0e605d6?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r7', author: 'Liam Patterson', rating: 5, date: '3 weeks ago', title: 'Finally a stand heavy enough to not slide', comment: 'The magnets snap on super strong and the weighted base doesn’t lift off my nightstand.' }
    ]
  },
  {
    id: 'prod-7',
    name: 'Aura Halo Smart Home Atmosphere Diffuser',
    serialNumber: 'AUR-HW-6628-HOM',
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
      { 
        name: 'Nordic Stone', 
        hex: '#64748b', 
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Off White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r8', author: 'Chloe Bennett', rating: 5, date: '1 week ago', title: 'Looks like real fire!', comment: 'The mist plus orange LED looks genuinely like a miniature fireplace. Very relaxing.' }
    ]
  },
  {
    id: 'prod-8',
    name: 'Aura Track Smart Biometric Fitness Band',
    serialNumber: 'AUR-HW-2215-WRB',
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
      { 
        name: 'Onyx Black', 
        hex: '#0f172a', 
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Alpine Moss', 
        hex: '#166534', 
        image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r9', author: 'Noah Miller', rating: 5, date: '5 days ago', title: 'Changed my sleep habits', comment: 'Seeing actual HRV recovery numbers helped me optimize my workouts and cut down late night screen time.' }
    ]
  },
  {
    id: 'prod-9',
    name: 'Aura Pro ANC Audiophile True Wireless Earbuds',
    serialNumber: 'AUR-HW-9102-AUD',
    category: 'audio',
    price: 249,
    originalPrice: 289,
    rating: 4.9,
    reviewsCount: 116,
    stock: 24,
    badge: 'Top Pick',
    tagline: 'Custom 11mm beryllium drivers with hybrid active noise cancellation',
    description: 'Studio mastering caliber acoustic engineering packed inside a featherweight ergonomic shell. Features LDAC hi-res codec support, spatial audio head tracking, and Qi wireless charging.',
    features: [
      '-45dB Hybrid Active Noise Cancellation',
      'Triple microphone beamforming array for crystal-clear calls',
      'Lossless LDAC & aptX Adaptive streaming audio',
      'Up to 36 hours playtime with wireless charging case'
    ],
    specs: {
      'Drivers': '11mm Custom Beryllium Diaphragm',
      'Battery Life': '8.5h buds / 36h with case',
      'Bluetooth': 'v5.4 Multi-point Low Latency',
      'Water Resistance': 'IPX5 Sweat & Splash Proof'
    },
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Carbon Black', 
        hex: '#18181b', 
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Ceramic White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Midnight Navy', 
        hex: '#1e3a8a', 
        image: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r10', author: 'Dr. Julian Reed', rating: 5, date: '1 day ago', title: 'Studio quality in pocket size', comment: 'The frequency separation between sub-bass and strings is astonishing. ANC cuts airplane engine hum completely.' }
    ]
  },
  {
    id: 'prod-10',
    name: 'Aura Studio Reference Soundbar & Wireless Subwoofer',
    serialNumber: 'AUR-HW-5120-AUD',
    category: 'audio',
    price: 599,
    originalPrice: 699,
    rating: 4.8,
    reviewsCount: 53,
    stock: 9,
    badge: 'Flagship',
    tagline: 'Dolby Atmos 5.1.2 spatial home theatre soundstage',
    description: 'Transform your living room into an IMAX theater. Features 9 high-precision acoustic transducers, upward-firing ceiling height channels, and an 8-inch wireless long-throw subwoofer.',
    features: [
      'Dolby Atmos and DTS:X 3D spatial acoustic decoding',
      'HDMI eARC 4K HDR passthrough with zero audio lag',
      'Acoustic Room Calibrator via companion smartphone mic',
      'Dedicated dialogue enhancement center channel'
    ],
    specs: {
      'Power Output': '360W Total RMS System Power',
      'Channels': '5.1.2 True Spatial Architecture',
      'Subwoofer': '8-inch Wireless Downward Firing',
      'Connectivity': 'HDMI eARC, Optical, Wi-Fi, AirPlay 2'
    },
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Matte Black', 
        hex: '#18181b', 
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Titanium Silver', 
        hex: '#94a3b8', 
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r11', author: 'Samantha Vance', rating: 5, date: '3 days ago', title: 'Cinema sound in our apartment', comment: 'Rumbling bass that vibrates your chest without rattling the walls. Dialogue is razor sharp.' }
    ]
  },
  {
    id: 'prod-11',
    name: 'Aura Master Tube DAC & Headphone Amplifier',
    serialNumber: 'AUR-HW-3814-AUD',
    category: 'audio',
    price: 449,
    originalPrice: 499,
    rating: 4.9,
    reviewsCount: 38,
    stock: 7,
    badge: 'Audiophile',
    tagline: 'Dual ES9038PRO chips with Class-A vacuum tube warmth',
    description: 'Built for uncompromising audiophiles. Unites ultra-clean 32-bit/768kHz DSD512 digital-to-analog conversion with the euphonic warmth of hand-selected dual triode vacuum tubes.',
    features: [
      'Dual ESS Sabre ES9038PRO flagship DAC chips',
      'Matched pair 6N3P vacuum tubes with preamp bypass mode',
      '4.4mm Pentaconn balanced and 6.35mm single-ended outputs',
      'Aircraft-grade solid CNC milled aluminum casing'
    ],
    specs: {
      'Decoding': '32-Bit / 768kHz PCM, Native DSD512',
      'THD+N': '< 0.00015% in Solid State Mode',
      'Output Power': '2000mW @ 32Ω Balanced',
      'Inputs': 'USB-C XMOS XU208, Optical, Coaxial'
    },
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Brushed Silver', 
        hex: '#cbd5e1', 
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Obsidian Black', 
        hex: '#09090b', 
        image: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r12', author: 'Arthur Sterling', rating: 5, date: '1 week ago', title: 'Breathed new life into my Sennheisers', comment: 'The tube warmth gives acoustic tracks unmatched musical intimacy while retaining laser-precise micro-details.' }
    ]
  },
  {
    id: 'prod-12',
    name: 'Aura Smart Ring Gen 3 Biometric Tracker',
    serialNumber: 'AUR-HW-7933-WRB',
    category: 'wearables',
    price: 299,
    originalPrice: 349,
    rating: 4.8,
    reviewsCount: 74,
    stock: 18,
    badge: 'Popular',
    tagline: 'Ultralight titanium ring with medical-grade sleep & temperature sensors',
    description: 'Weighing less than 4 grams, the Aura Ring tracks your sleep architecture, HRV, respiratory rate, and body temperature trends directly from finger arterial blood flow.',
    features: [
      'Continuous finger arterial PPG pulse monitoring',
      'Skin temperature sensor with early illness detection',
      'Up to 7 days battery life with wireless puck charger',
      'Waterproof to 100 meters (surfs, swims, and sauna safe)'
    ],
    specs: {
      'Weight': '3.8 grams',
      'Chassis': 'Titanium with diamond-like carbon (DLC) coating',
      'Battery': '7 Days continuous wear',
      'Sensors': 'Infrared PPG, NTC temperature, 3D accelerometer'
    },
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Stealth Black', 
        hex: '#18181b', 
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Polished Silver', 
        hex: '#e2e8f0', 
        image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Desert Gold', 
        hex: '#eab308', 
        image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r13', author: 'Nadia Solokov', rating: 5, date: '2 weeks ago', title: 'Forgot I was even wearing it', comment: 'So much more comfortable to sleep in than a bulky smartwatch. Battery genuinely lasts 6-7 days.' }
    ]
  },
  {
    id: 'prod-13',
    name: 'Aura Horizon Smart Audio Eyewear',
    serialNumber: 'AUR-HW-1429-WRB',
    category: 'wearables',
    price: 219,
    originalPrice: 249,
    rating: 4.7,
    reviewsCount: 46,
    stock: 11,
    badge: 'New Gadget',
    tagline: 'Polarized UV400 lenses with open-ear directional acoustic micro-speakers',
    description: 'Listen to music, navigate directions, and take voice calls without putting anything in your ears. Directional sound cavity technology ensures your audio stays private.',
    features: [
      'Open-ear micro-speakers with acoustic beamforming',
      'Carl Zeiss polarized UV400 scratch-resistant lenses',
      'Intuitive swipe touch controls on titanium temples',
      'Dual wind-cancelling microphones for calls on the go'
    ],
    specs: {
      'Battery': '8 Hours playback / 160h standby',
      'Weight': '42 grams featherweight acetate',
      'Connectivity': 'Bluetooth 5.3 Low Energy',
      'Protection': 'IP54 sweat and weather resistant'
    },
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Gloss Black', 
        hex: '#09090b', 
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Amber Tortoise', 
        hex: '#78350f', 
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r14', author: 'Jordan Lee', rating: 5, date: '4 days ago', title: 'Brilliant for cycling and running', comment: 'I can hear traffic clearly while enjoying podcasts. People nearby cannot hear what I am listening to.' }
    ]
  },
  {
    id: 'prod-14',
    name: 'Aura Pure Air Purifier Ultra',
    serialNumber: 'AUR-HW-6381-HOM',
    category: 'smart-home',
    price: 279,
    originalPrice: 329,
    rating: 4.8,
    reviewsCount: 61,
    stock: 13,
    badge: 'Home Essential',
    tagline: 'Medical True HEPA H13 filtration with laser PM2.5 real-time monitor',
    description: 'Breathe cleaner air in minutes. Cylindrical 360-degree intake with medical-grade H13 HEPA and activated coconut carbon destroys 99.97% of airborne allergens, pet dander, and VOCs.',
    features: [
      'True HEPA H13 filter with active carbon layer',
      'Laser airborne PM2.5 particle sensor with color LED ring',
      'Whisper-silent Sleep Mode at 18dB sound level',
      'Companion app scheduling and air quality alerts'
    ],
    specs: {
      'Clean Air Delivery (CADR)': '400 m³/h',
      'Room Size': 'Cleans up to 850 sq ft in 30 minutes',
      'Noise Level': '18dB to 48dB Max',
      'Power Consumption': '38W Energy Star Certified'
    },
    images: [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Alpine White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Midnight Slate', 
        hex: '#334155', 
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r15', author: 'Jessica Morgan', rating: 5, date: '2 weeks ago', title: 'Allergy relief within 24 hours', comment: 'Waking up without congestion for the first time in years. The air actually smells crisp and fresh.' }
    ]
  },
  {
    id: 'prod-15',
    name: 'Aura Modular Acoustic Hexagon Light Panels',
    serialNumber: 'AUR-HW-8240-HOM',
    category: 'smart-home',
    price: 169,
    originalPrice: 199,
    rating: 4.7,
    reviewsCount: 52,
    stock: 20,
    badge: 'Ambient Living',
    tagline: 'Modular RGBIC sound-reactive wall lighting panels (9-Pack)',
    description: 'Transform blank walls into luminous interactive art. Features fabric acoustic dampening backing combined with individually addressable RGBIC LEDs that sync to your music and games in real time.',
    features: [
      'Sound-reactive dynamic visualizer with onboard microphone',
      'Magnetic click-to-connect modular expansion',
      'Over 16 million colors with animated gradient presets',
      'Fabric acoustic baffle reduces studio wall echoes'
    ],
    specs: {
      'Pack Size': '9 Hexagonal Panels + Controller + 3M Mounts',
      'Brightness': '100 Lumens per panel',
      'Connectivity': 'Wi-Fi 2.4GHz & Matter / HomeKit compatible',
      'Lifespan': '35,000 Hours'
    },
    images: [
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Frost White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Dark Prism', 
        hex: '#09090b', 
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r16', author: 'Kevin Zhao', rating: 5, date: '1 month ago', title: 'The centerpiece of my desk setup', comment: 'The music sync animation is hypnotic. Setup took under 15 minutes with the included magnetic snap connectors.' }
    ]
  },
  {
    id: 'prod-16',
    name: 'Aura Precision Ergonomic Vertical Wireless Mouse',
    serialNumber: 'AUR-HW-4109-ACC',
    category: 'accessories',
    price: 99,
    originalPrice: 129,
    rating: 4.8,
    reviewsCount: 82,
    stock: 25,
    badge: 'Ergonomics',
    tagline: '57° natural handshake angle with silent optical micro-switches',
    description: 'Engineered by physiotherapists to eliminate wrist strain and carpal fatigue. Features an 8,000 DPI sensor on glass, an OLED battery gauge, and a textured thumb rest.',
    features: [
      '57° ergonomic handshake posture reduces muscular strain',
      'Hyper-fast electromagnetic metal scroll wheel',
      'Silent tactile micro-switches (< 15dB click volume)',
      'Multi-device flow pairing across Mac, Windows, and iPad'
    ],
    specs: {
      'Sensor': 'Darkfield Optical 200 - 8000 DPI',
      'Battery': '500mAh USB-C Quick Charge (Up to 70 days)',
      'Weight': '135g Balanced Ergonomic',
      'Connectivity': 'Bluetooth 5.2 + 2.4GHz Dongle'
    },
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Space Grey', 
        hex: '#334155', 
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Polar White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r17', author: 'Rachel Gomez', rating: 5, date: '1 week ago', title: 'Cured my wrist pain in 3 days', comment: 'I work 10 hours a day in Figma. The natural grip angle completely eliminated forearm cramps.' }
    ]
  },
  {
    id: 'prod-17',
    name: 'Aura Nomad MagSafe 20,000mAh 100W Laptop Power Bank',
    serialNumber: 'AUR-HW-9521-ACC',
    category: 'accessories',
    price: 129,
    originalPrice: 159,
    rating: 4.9,
    reviewsCount: 95,
    stock: 17,
    badge: 'Powerhouse',
    tagline: '100W dual USB-C Power Delivery with real-time smart TFT wattage display',
    description: 'The ultimate travel power station. Delivers full 100W fast charge to MacBook Pro, iPad, and iPhone simultaneously, while the integrated high-resolution TFT screen displays real-time voltage and battery health.',
    features: [
      '100W Fast Charging outputs enough juice for 16-inch laptops',
      'Smart color TFT display monitors watt input/output in real time',
      'Magnetic Qi2 snap surface for wireless iPhone charging',
      'TSA airline approved 74Wh capacity for carry-on luggage'
    ],
    specs: {
      'Capacity': '20,000mAh / 74Wh Airline Safe',
      'Ports': '2x USB-C (100W Max) + 1x USB-A (22.5W) + 15W Qi2',
      'Display': '1.3" IPS Full Color Wattage Gauge',
      'Recharge Time': '0 to 100% in 75 minutes at 65W input'
    },
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Gunmetal Grey', 
        hex: '#1e293b', 
        image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Frost White', 
        hex: '#f8fafc', 
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r18', author: 'Brian Becker', rating: 5, date: '6 days ago', title: 'Must-have for digital nomads', comment: 'Charged my MacBook Pro from 20% to 100% at a coffee shop with zero wall outlets. The wattage display is super helpful.' }
    ]
  },
  {
    id: 'prod-18',
    name: 'Aura Studio Monitor Acoustic Desktop Stands',
    serialNumber: 'AUR-HW-1830-ACC',
    category: 'accessories',
    price: 79,
    originalPrice: 99,
    rating: 4.8,
    reviewsCount: 39,
    stock: 28,
    badge: 'Acoustic Pro',
    tagline: 'Cast iron heavy vibration decouplers with 16° upward acoustic tilt',
    description: 'Elevate your studio monitors to ear level and decouple sound vibrations from your desk. Heavyweight solid steel structure eliminates bass resonance and cleans up acoustic imaging.',
    features: [
      'Solid heavy-gauge steel construction prevents wobbling',
      'Dense anti-vibration silicone dampening pads included',
      '16° upward tilt directs high frequencies directly to ear level',
      'Clutter-free space underneath for audio interfaces and DACs'
    ],
    specs: {
      'Material': 'Solid Cast Carbon Steel + High-Density Silicone',
      'Weight Capacity': 'Up to 15 kg (33 lbs) per stand',
      'Platform Dimensions': '160mm x 215mm',
      'Unit Weight': '2.6 kg pair'
    },
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80'
    ],
    colors: [
      { 
        name: 'Matte Black Steel', 
        hex: '#18181b', 
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80' 
      },
      { 
        name: 'Raw Titanium', 
        hex: '#94a3b8', 
        image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80' 
      }
    ],
    reviews: [
      { id: 'r19', author: 'Mark Henderson', rating: 5, date: '2 weeks ago', title: 'Noticeable difference in bass clarity', comment: 'No more desk rumble when listening at higher volumes. The upward angle puts the tweeters right in the sweet spot.' }
    ]
  }
];
