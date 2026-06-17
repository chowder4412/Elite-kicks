import { Product } from './types';

export const products: Product[] = [
  {
    id: 'velocity-nitro-3',
    name: 'VELOCITY NITRO 3',
    category: 'RUNNING',
    price: 160.00,
    rating: 4.8,
    reviewsCount: 154,
    image: '/src/assets/images/velocity_nitro_3_1781621309881.jpg',
    description: 'Engineered for ultimate responsiveness and maximum cushioning, the Velocity Nitro 3 features our latest nitrogen-infused foam technology. Designed for athletes who demand speed without compromising on comfort.',
    isNewDrop: true,
    specs: [
      'Nitrogen-infused Nitro Foam midsole technology',
      'Engineered lightweight hyper-breathable technical mesh',
      'PUMAGRIP high-friction rubber outsole compound',
      'Heel spoiler stabilizer for enhanced balance'
    ],
    colors: ['Electric Blue', 'Stealth Black', 'Rocket Red']
  },
  {
    id: 'aero-blast-v2',
    name: 'AERO BLAST V2',
    category: 'RUNNING',
    price: 225.00,
    rating: 4.9,
    reviewsCount: 180,
    image: '/src/assets/images/aero_blast_v2_1781620432071.jpg',
    description: 'Maximum propulsion for elite sprinters. Featuring a stiff carbon fiber speedplate, featherweight ultra-weave mesh, and zoned traction paths that bite into any track surfaces for explosive starts.',
    isNewDrop: true,
    specs: [
      'Carbon-fiber composite performance plate',
      'Ultraweight breathable mesh upper (weighs only 6.2 oz)',
      'Engineered responsive dual-layer foam cushioning',
      'Advanced grip micro-patterns for all-weather traction'
    ],
    colors: ['Neon Crimson', 'Phantom Black', 'Bolt Orange']
  },
  {
    id: 'volt-glide-runner',
    name: 'VOLT GLIDE RUNNER',
    category: 'RUNNING',
    price: 185.00,
    rating: 4.8,
    reviewsCount: 120,
    image: '/src/assets/images/volt_glide_runner_1781620445672.jpg',
    description: 'A masterpiece of distance running engineering. The Volt Glide Runner matches premium reactive foam cushioning with an asymmetrical multi-textured high-breathability upper for infinite comfort.',
    specs: [
      'Reactive multi-density midsole',
      'Adaptive knit collar for locked-in support',
      'Asymmetric laces pattern relieving pressure',
      'Reinforced high-wear heel strike rubber pad'
    ],
    colors: ['Sunset Bronze', 'Midnight Slate', 'Pure Teal']
  },
  {
    id: 'court-master-elite',
    name: 'COURT MASTER ELITE',
    category: 'BASKETBALL',
    price: 210.00,
    rating: 4.9,
    reviewsCount: 85,
    image: '/src/assets/images/court_master_elite_1781620461715.jpg',
    description: 'Engineered for absolute domination in the paint. High-top architecture offers supreme structural ankle lockdowns, while the high-rebound forefoot chambers power high-altitude jumps.',
    specs: [
      'Anatomically padded high-top wrap collar',
      'Dual-chamber pneumatic shock dispersion',
      'High-tensile knit stability containment straps',
      'Multi-directional Herringbone squeak rubber traction'
    ],
    colors: ['Acid Lime & Jet Black', 'Primal Red', 'Stealth Grey']
  },
  {
    id: 'neo-urban-loft',
    name: 'NEO URBAN LOFT',
    category: 'LIFESTYLE',
    price: 140.00,
    rating: 4.7,
    reviewsCount: 230,
    image: '/src/assets/images/neo_urban_loft_1781620478828.jpg',
    description: 'Street-ready architectural form meets track-hardened comfort. Clean seamless structures and an electric athletic-green design give your modern urban commutes a bold stylish edge.',
    specs: [
      'Seamless water-repellent performance knit',
      'Memory foam form-fitting cozy insole',
      'Eco-conscious sugarcane midsole compound',
      'Slip-on speed lacing structure'
    ],
    colors: ['Volt Green', 'Minimalist Slate', 'Carbon Matte']
  },
  {
    id: 'cloud-pace-3-0',
    name: 'CLOUD PACE 3.0',
    category: 'RUNNING',
    price: 195.00,
    rating: 5.0,
    reviewsCount: 42,
    image: '/src/assets/images/cloud_pace_3_0_1781620499054.jpg',
    description: 'The ultimate sensation of weightlessness. Utilizing proprietary hollow-pocket cloud foam cells, this shoe cushions impact forces dynamically while restoring momentum continuously.',
    specs: [
      'Proprietary hollow cushion pocket layout',
      'Engineered stretch-matrix open cell canvas',
      'Anatomic transition channels promoting natural gaits',
      'Reflective safety micro-structures for night runs'
    ],
    colors: ['Alabaster White', 'Zen Grey', 'Glacier Frost']
  },
  {
    id: 'apex-cross-trainer',
    name: 'APEX CROSS TRAINER',
    category: 'TRAINING',
    price: 160.00,
    rating: 4.7,
    reviewsCount: 114,
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
    description: 'Built for high-intensity interval training, heavy weightlifting, and agile foot drills. Flat heel platform provides superb grounded power, while lateral protective wraps resist high-impact friction.',
    specs: [
      'Reinforced flat-heel lifting stability block',
      'Dual-density side wraps for lateral containment',
      'High-friction rubber wrapping upwards on midfoot',
      'Moisture-wicking mesh upper'
    ],
    colors: ['Solar Crimson & Slate', 'Stealth Graphite']
  },
  {
    id: 'retro-revival-x',
    name: 'RETRO REVIVAL X',
    category: 'LIFESTYLE',
    price: 125.00,
    rating: 4.6,
    reviewsCount: 340,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    description: 'Bringing back the vibrant energy of 90s running heritage with a luxurious modern rebuild. Combining premium suede overlays with dynamic retro color blocking and responsive modern foam inserts.',
    specs: [
      'Premium long-nap suede and layered mesh panels',
      'Vintage aesthetic chunky EVA midsole',
      'Plush padded terry fabric inner lining',
      'Toughened gum-rubber outsole core'
    ],
    colors: ['Grape & Orchid Dream', 'Vintage Cream', 'Classic Pastel']
  },
  {
    id: 'court-glide-pro',
    name: 'COURT GLIDE PRO',
    category: 'BASKETBALL',
    price: 175.00,
    rating: 4.8,
    reviewsCount: 96,
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop&q=80',
    description: 'Dominate the blacktop with low-profile swiftness. The Court Glide Pro trades high-top weight for targeted structural ankle strap systems and optimized responsive forefoot springboards.',
    specs: [
      'Low-cut flexibility with structural ankle straps',
      'High-responsive spring-back forefoot base',
      'Abrasion-resistant toe cap for longevity',
      'Radial grip tread designed for outdoor courts'
    ],
    colors: ['Off-White & Red Slate', 'Hyper Violet']
  },
  {
    id: 'vaporfly-elite-3',
    name: 'VAPORFLY ELITE 3',
    category: 'RUNNING',
    price: 250.00,
    rating: 4.9,
    reviewsCount: 218,
    image: '/src/assets/images/vaporfly_elite_3_1781621690013.jpg',
    description: 'The pinnacle of marathon racing performance. Featuring a full-length carbon fiber Flyplate and ultra-responsive ZoomX foam, the Vaporfly Elite 3 is tuned for peak velocity and efficiency over any distance.',
    specs: [
      'Full-length carbon fiber Flyplate',
      'Ultra-responsive ZoomX cushioning foam',
      'Breathable lightweight Flyknit upper ventilation',
      'High-friction targeted rubber traction points'
    ],
    colors: ['Speed Red', 'Stealth Black', 'Volt Green']
  },
  {
    id: 'aerostratus-prime',
    name: 'AEROSTRATUS PRIME',
    category: 'RUNNING',
    price: 180.00,
    rating: 4.8,
    reviewsCount: 88,
    image: '/src/assets/images/aerostratus_prime_1781621707932.jpg',
    description: 'Next-generation shock absorbency structured with premium visible Air-Sole columns. Aerostratus Prime provides active spring energy-return and multi-directional flex grips.',
    specs: [
      'Visible heel Zoom Air-Sole columns cushioning',
      'Flexible breathable Engineered mono-mesh collar',
      'Molded structural midfoot lock cage support',
      'Extruded performance dynamic road friction grids'
    ],
    colors: ['Volt Green', 'Classic Crimson', 'Stealth Grey']
  },
  {
    id: 'eko-royal-loafers',
    name: 'EKO ROYAL LOAFERS',
    category: 'CUSTOM',
    price: 120.00,
    rating: 4.9,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80',
    description: 'Individually crafted by master cordwainers in Lagos, the Eko Royal is the ultimate handmade leather loafer. Features premium top-grain leather from Kaduna/Kano tanneries, soft comfortable insoles, and distinct hand-stitching made to stand out at any traditional wedding or corporate event.',
    isNewDrop: true,
    specs: [
      '100% hand-lasted premium Nigerian calfskin leather',
      'Custom hand-stitched traditional center-seam detailing',
      'Ergonomic inner leather cushioning for all-day comfort',
      'Reinforced lightweight resin-rubber dress outsole'
    ],
    colors: ['Oba Mahogany', 'Midnight Onyx', 'Kano Tan']
  },
  {
    id: 'aba-handcrafted-monks',
    name: 'ABA SIGNATURE MONK STRAP',
    category: 'CUSTOM',
    price: 145.00,
    rating: 4.8,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
    description: 'Precision handmade leather double monk strap shoes from the legendary artisan hub of Aba. Specially designed to pair perfectly with traditional Senator wear, Kaftans, and formal suits while maintaining supreme hot-weather breathability.',
    specs: [
      'Hand-burnished premium full-grain leather upper',
      'Dual adjustable polished gold buckle closures',
      'Fully breathable leather lining for hot climates',
      'Non-slip supportive lightweight hard outsole'
    ],
    colors: ['Classic Black', 'Senator Brown']
  },
  {
    id: 'lekki-cloud-slides',
    name: 'LEKKI CLOUD SLIDES',
    category: 'SLIDES',
    price: 45.00,
    rating: 4.9,
    reviewsCount: 312,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    description: 'Step into pure comfort. Designed for premium high-fashion and relaxed beach walks along Lekki coastlines, these slides feature a double-density EVA platform cushion, custom green accent branding, and a broad padded footstrap.',
    isNewDrop: true,
    specs: [
      'Supreme double-density EVA compression foam',
      'Ergonomic contoured arch-supporting footbed',
      'Waterproof and grip-enhanced tread pattern',
      'Ultra-broad premium padded soft strap'
    ],
    colors: ['Green-White-Green', 'Stealth Charcoal', 'Sand Beige']
  },
  {
    id: 'gidi-comfy-slides',
    name: 'GIDI PREMIUM SLIDES',
    category: 'SLIDES',
    price: 50.00,
    rating: 4.7,
    reviewsCount: 145,
    image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600&auto=format&fit=crop&q=80',
    description: 'Your perfect everyday slide for the Lagos lifestyle. Extra durable construction meets flexible high-rebound cushioning. Lightweight, water-friendly, and fitted with deep traction treads to keep you steady.',
    specs: [
      'Heavy-duty flexible responsive foam construction',
      'Anti-slip textured traction tread pattern',
      'Anatomical footbed designed to reduce joint fatigue',
      'Durable raised rim for secure foot placement'
    ],
    colors: ['Onyx Black', 'Eko Gold', 'Palm Green']
  }
];
