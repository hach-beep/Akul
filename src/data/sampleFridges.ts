// Sample fridge data for quick testing and demoing without requiring a live camera capture

export interface SampleFridge {
  id: string;
  name: string;
  description: string;
  badge: string;
  itemsSummary: string;
  imageDataUrl: string; // Valid canvas-generated or SVG data URL
}

// Generate an SVG data URL for realistic fridge photo placeholder
function createFridgeDataUrl(theme: 'produce' | 'protein' | 'quick'): string {
  const colors = {
    produce: { bg: '#1c261e', accent: '#34d399', text: 'Fresh Produce & Dairy Fridge' },
    protein: { bg: '#291c18', accent: '#fb923c', text: 'High-Protein Fitness Fridge' },
    quick: { bg: '#1e2430', accent: '#60a5fa', text: 'Weeknight Family Fridge' },
  }[theme];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="${colors.bg}"/>
    <rect x="20" y="20" width="560" height="360" rx="16" fill="#14181d" stroke="#2d3748" stroke-width="3"/>
    <!-- Fridge Shelves -->
    <line x1="30" y1="130" x2="570" y2="130" stroke="#4a5568" stroke-width="6"/>
    <line x1="30" y1="250" x2="570" y2="250" stroke="#4a5568" stroke-width="6"/>
    
    <!-- Crisper Drawer -->
    <rect x="40" y="270" width="250" height="90" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    <rect x="310" y="270" width="250" height="90" rx="8" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    
    <!-- Food Items Stylized -->
    <!-- Shelf 1: Milk, Juices, Jars -->
    <rect x="60" y="45" width="45" height="80" rx="4" fill="#f8fafc"/>
    <text x="65" y="85" font-family="sans-serif" font-size="10" fill="#0f172a" font-weight="bold">MILK</text>
    
    <rect x="120" y="55" width="40" height="70" rx="4" fill="#fbbf24"/>
    <text x="123" y="90" font-family="sans-serif" font-size="9" fill="#78350f" font-weight="bold">JUICE</text>
    
    <rect x="175" y="65" width="35" height="60" rx="4" fill="#dc2626"/>
    <rect x="220" y="60" width="35" height="65" rx="4" fill="#16a34a"/>
    <rect x="270" y="70" width="30" height="55" rx="3" fill="#ca8a04"/>
    <rect x="315" y="50" width="60" height="75" rx="6" fill="#e2e8f0"/>
    <text x="323" y="85" font-family="sans-serif" font-size="9" fill="#1e293b" font-weight="bold">YOGURT</text>
    <rect x="390" y="60" width="70" height="65" rx="4" fill="#fef08a"/>
    <text x="405" y="95" font-family="sans-serif" font-size="10" fill="#854d0e" font-weight="bold">CHEESE</text>

    <!-- Shelf 2: Proteins, Leftovers, Eggs -->
    <rect x="60" y="180" width="100" height="65" rx="6" fill="#cbd5e1" stroke="#94a3b8"/>
    <circle cx="85" cy="200" r="10" fill="#fef3c7"/>
    <circle cx="110" cy="200" r="10" fill="#fef3c7"/>
    <circle cx="135" cy="200" r="10" fill="#fef3c7"/>
    <circle cx="85" cy="225" r="10" fill="#fef3c7"/>
    <circle cx="110" cy="225" r="10" fill="#fef3c7"/>
    <circle cx="135" cy="225" r="10" fill="#fef3c7"/>
    <text x="88" y="172" font-family="sans-serif" font-size="11" fill="#cbd5e1" font-weight="bold">EGGS (12)</text>

    <rect x="180" y="160" width="110" height="85" rx="8" fill="#fda4af"/>
    <text x="195" y="205" font-family="sans-serif" font-size="11" fill="#881337" font-weight="bold">CHICKEN</text>

    <rect x="310" y="170" width="90" height="75" rx="6" fill="#38bdf8"/>
    <text x="320" y="210" font-family="sans-serif" font-size="10" fill="#0369a1" font-weight="bold">LEFTOVERS</text>

    <rect x="420" y="175" width="80" height="70" rx="6" fill="#86efac"/>
    <text x="435" y="210" font-family="sans-serif" font-size="10" fill="#14532d" font-weight="bold">TOFU</text>

    <!-- Crisper items: Greens, Bell peppers, Carrots -->
    <circle cx="90" cy="315" r="22" fill="#22c55e"/>
    <circle cx="130" cy="315" r="20" fill="#15803d"/>
    <circle cx="180" cy="315" r="18" fill="#ef4444"/>
    <circle cx="220" cy="315" r="18" fill="#eab308"/>
    
    <rect x="340" y="300" width="70" height="25" rx="10" fill="#f97316"/>
    <rect x="420" y="305" width="60" height="22" rx="8" fill="#a855f7"/>
    <circle cx="510" cy="315" r="16" fill="#84cc16"/>

    <!-- Banner -->
    <rect x="140" y="355" width="320" height="30" rx="6" fill="#0f172a" opacity="0.9"/>
    <text x="300" y="375" text-anchor="middle" font-family="sans-serif" font-size="13" fill="${colors.accent}" font-weight="bold">${colors.text}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_FRIDGES: SampleFridge[] = [
  {
    id: 'sample-balanced',
    name: 'Balanced Everyday Fridge',
    description: 'Fresh chicken breast, organic eggs, spinach, bell peppers, cheddar cheese, and almond milk.',
    badge: 'Most Popular',
    itemsSummary: 'Eggs, Chicken, Spinach, Bell Peppers, Cheese, Milk, Greek Yogurt',
    imageDataUrl: createFridgeDataUrl('produce'),
  },
  {
    id: 'sample-protein',
    name: 'High-Protein Fitness Fridge',
    description: 'Organic eggs, tofu blocks, chicken cutlets, Greek yogurt, broccoli, and hot sauces.',
    badge: 'High Protein',
    itemsSummary: 'Eggs (12), Chicken Cutlets, Firm Tofu, Broccoli, Hot Sauce, Greek Yogurt',
    imageDataUrl: createFridgeDataUrl('protein'),
  },
  {
    id: 'sample-quick',
    name: 'Quick Weeknight Pantry Fridge',
    description: 'Pasta sauce, shredded mozzarella, leftover roasted veggies, butter, tortillas, and limes.',
    badge: 'Fast & Easy',
    itemsSummary: 'Mozzarella, Tortillas, Butter, Salsa, Leftover Veggies, Limes',
    imageDataUrl: createFridgeDataUrl('quick'),
  },
];
