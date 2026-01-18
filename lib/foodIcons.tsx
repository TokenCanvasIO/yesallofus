// Food & Drink SVG Icon Library - 100 icons
// Free for commercial use, curated from open source libraries

export interface FoodIcon {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  svg: string;
}

export const foodIconCategories = [
  'Hot Drinks',
  'Cold Drinks',
  'Breakfast',
  'Lunch',
  'Snacks',
  'Desserts',
  'Fruits',
  'Meals',
  'Fast Food',
  'Other'
];

export const foodIcons: FoodIcon[] = [
  // ============ HOT DRINKS (10) ============
  {
    id: 'coffee-cup',
    name: 'Coffee Cup',
    category: 'Hot Drinks',
    keywords: ['coffee', 'latte', 'cappuccino', 'espresso', 'americano', 'flat white', 'mocha'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`
  },
  {
    id: 'coffee-bean',
    name: 'Coffee Bean',
    category: 'Hot Drinks',
    keywords: ['coffee', 'espresso', 'bean', 'roast'],
    svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 2 1.3 3.7 3 4.3V22h3v-11.2c1.7-.6 3-2.3 3-4.3C16.5 4 14.5 2 12 2zm0 7c-1.4 0-2.5-1.1-2.5-2.5S10.6 4 12 4s2.5 1.1 2.5 2.5S13.4 9 12 9z"/></svg>`
  },
  {
    id: 'tea-cup',
    name: 'Tea Cup',
    category: 'Hot Drinks',
    keywords: ['tea', 'chai', 'green tea', 'herbal'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8h1a3 3 0 010 6h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1c.5 1.5.5 3 0 4M10 1c.5 1.5.5 3 0 4M14 1c.5 1.5.5 3 0 4"/></svg>`
  },
  {
    id: 'teapot',
    name: 'Teapot',
    category: 'Hot Drinks',
    keywords: ['tea', 'pot', 'brew'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="10" cy="14" rx="7" ry="5"/><path d="M17 14h3a2 2 0 002-2v-1a2 2 0 00-2-2h-3M3 14l-1 5M10 9V6a2 2 0 012-2h0a2 2 0 012 2v3"/></svg>`
  },
  {
    id: 'hot-chocolate',
    name: 'Hot Chocolate',
    category: 'Hot Drinks',
    keywords: ['chocolate', 'cocoa', 'hot', 'marshmallow'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><circle cx="7" cy="5" r="1.5" fill="currentColor"/><circle cx="10" cy="4" r="1" fill="currentColor"/><circle cx="13" cy="5" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'matcha',
    name: 'Matcha',
    category: 'Hot Drinks',
    keywords: ['matcha', 'green tea', 'japanese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14l-2 9H7l-2-9z"/><ellipse cx="12" cy="12" rx="7" ry="2"/><path d="M8 8c0-2 1.8-4 4-4s4 2 4 4"/></svg>`
  },
  {
    id: 'espresso',
    name: 'Espresso',
    category: 'Hot Drinks',
    keywords: ['espresso', 'shot', 'coffee', 'strong'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 8h10v6a5 5 0 01-5 5h0a5 5 0 01-5-5V8z"/><path d="M17 10h2a2 2 0 010 4h-2"/><path d="M7 8c0-2 2-3 5-3s5 1 5 3"/></svg>`
  },
  {
    id: 'latte-art',
    name: 'Latte Art',
    category: 'Hot Drinks',
    keywords: ['latte', 'art', 'coffee', 'milk'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="10" rx="8" ry="3"/><path d="M4 10v5a8 8 0 0016 0v-5"/><path d="M12 10v2M9 11c1 1 2 1 3 0s2-1 3 0"/></svg>`
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    category: 'Hot Drinks',
    keywords: ['cappuccino', 'coffee', 'foam', 'italian'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h16v7a5 5 0 01-5 5h-6a5 5 0 01-5-5v-7z"/><path d="M4 10c0-3 3.5-5 8-5s8 2 8 5"/><ellipse cx="12" cy="10" rx="8" ry="2" fill="currentColor" opacity="0.2"/></svg>`
  },
  {
    id: 'mug',
    name: 'Mug',
    category: 'Hot Drinks',
    keywords: ['mug', 'cup', 'coffee', 'tea', 'drink'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 6h11v11a3 3 0 01-3 3H8a3 3 0 01-3-3V6z"/><path d="M16 9h2a2 2 0 012 2v1a2 2 0 01-2 2h-2"/></svg>`
  },
  {
    id: 'americano',
    name: 'Americano',
    category: 'Hot Drinks',
    keywords: ['americano', 'coffee', 'black', 'long'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M8 4h8M8 20h8"/></svg>`
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    category: 'Hot Drinks',
    keywords: ['flat white', 'coffee', 'milk', 'microfoam'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8h12v8a4 4 0 01-4 4H10a4 4 0 01-4-4V8z"/><circle cx="12" cy="10" r="3" fill="currentColor" opacity="0.3"/></svg>`
  },
  {
    id: 'mocha',
    name: 'Mocha',
    category: 'Hot Drinks',
    keywords: ['mocha', 'chocolate', 'coffee', 'cocoa'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 8h10v9a4 4 0 01-4 4h-2a4 4 0 01-4-4V8z"/><path d="M9 5h6M11 3v4M13 3v4"/></svg>`
  },
  {
    id: 'herbal-tea',
    name: 'Herbal Tea',
    category: 'Hot Drinks',
    keywords: ['herbal', 'tea', 'infusion', 'chamomile'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 9h14v8a3 3 0 01-3 3H8a3 3 0 01-3-3V9z"/><path d="M9 4c1 2 2 3 3 3s2-1 3-3"/></svg>`
  },
  {
    id: 'turkish-coffee',
    name: 'Turkish Coffee',
    category: 'Hot Drinks',
    keywords: ['turkish', 'coffee', 'cezve', 'strong'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4h8l-2 14H10L8 4z"/><path d="M10 18h4M9 8h6"/></svg>`
  },
  {
    id: 'chai-latte',
    name: 'Chai Latte',
    category: 'Hot Drinks',
    keywords: ['chai', 'latte', 'spiced', 'tea'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 7h12v10a3 3 0 01-3 3H9a3 3 0 01-3-3V7z"/><path d="M9 4l3 3 3-3"/></svg>`
  },
  {
    id: 'irish-coffee',
    name: 'Irish Coffee',
    category: 'Hot Drinks',
    keywords: ['irish', 'coffee', 'whiskey', 'cream'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 8h10v8a4 4 0 01-4 4h-2a4 4 0 01-4-4V8z"/><rect x="9" y="4" width="6" height="4" rx="2"/></svg>`
  },
  {
    id: 'affogato',
    name: 'Affogato',
    category: 'Hot Drinks',
    keywords: ['affogato', 'espresso', 'ice cream', 'dessert'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="16" r="5"/><path d="M12 11v-4M8 9l4-4 4 4"/></svg>`
  },
  {
    id: 'cortado',
    name: 'Cortado',
    category: 'Hot Drinks',
    keywords: ['cortado', 'coffee', 'espresso', 'milk'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="6" width="10" height="12" rx="2"/><path d="M9 4h6M11 18h2"/></svg>`
  },
  {
    id: 'bulletproof-coffee',
    name: 'Bulletproof Coffee',
    category: 'Hot Drinks',
    keywords: ['bulletproof', 'coffee', 'butter', 'mct'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8h12v9a3 3 0 01-3 3H9a3 3 0 01-3-3V8z"/><circle cx="12" cy="10" r="2" fill="currentColor"/></svg>`
  },

  // ============ COLD DRINKS (10) ============
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    category: 'Cold Drinks',
    keywords: ['iced', 'coffee', 'cold brew', 'frappe'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4h12l-1 16H7L6 4z"/><path d="M6 4h12"/><rect x="8" y="8" width="3" height="3" rx="0.5"/><rect x="12" y="10" width="3" height="3" rx="0.5"/><rect x="9" y="13" width="3" height="3" rx="0.5"/></svg>`
  },
  {
    id: 'soda',
    name: 'Soda',
    category: 'Cold Drinks',
    keywords: ['soda', 'cola', 'fizzy', 'soft drink', 'pop'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l1 20H7L8 2z"/><path d="M7 6h10"/><circle cx="10" cy="10" r="0.5" fill="currentColor"/><circle cx="14" cy="12" r="0.5" fill="currentColor"/><circle cx="11" cy="14" r="0.5" fill="currentColor"/><circle cx="13" cy="16" r="0.5" fill="currentColor"/></svg>`
  },
  {
    id: 'smoothie',
    name: 'Smoothie',
    category: 'Cold Drinks',
    keywords: ['smoothie', 'shake', 'blend', 'fruit'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3h8l-1 18H9L8 3z"/><path d="M6 3h12"/><path d="M12 3v4"/><ellipse cx="12" cy="10" rx="3" ry="1.5"/></svg>`
  },
  {
    id: 'juice',
    name: 'Juice',
    category: 'Cold Drinks',
    keywords: ['juice', 'orange', 'apple', 'fresh'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4h8v16H8V4z"/><path d="M8 4c0-1 1-2 4-2s4 1 4 2"/><path d="M8 10h8"/><circle cx="12" cy="14" r="2"/></svg>`
  },
  {
    id: 'milkshake',
    name: 'Milkshake',
    category: 'Cold Drinks',
    keywords: ['milkshake', 'shake', 'ice cream', 'dessert'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 8h10l-1 13H8L7 8z"/><path d="M7 8c0-3 2-5 5-5s5 2 5 5"/><circle cx="12" cy="5" r="2" fill="currentColor"/><path d="M12 8v10"/></svg>`
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    category: 'Cold Drinks',
    keywords: ['water', 'bottle', 'mineral', 'sparkling'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 2h6v3l2 2v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7l2-2V2z"/><path d="M9 5h6"/><path d="M7 12h10"/></svg>`
  },
  {
    id: 'beer',
    name: 'Beer',
    category: 'Cold Drinks',
    keywords: ['beer', 'ale', 'lager', 'pint', 'draft'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 6h10v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6z"/><path d="M15 8h3a2 2 0 012 2v4a2 2 0 01-2 2h-3"/><path d="M5 6c0-2 2-3 5-3s5 1 5 3"/><path d="M5 9h10" opacity="0.5"/></svg>`
  },
  {
    id: 'wine',
    name: 'Wine',
    category: 'Cold Drinks',
    keywords: ['wine', 'red', 'white', 'glass', 'vino'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l-1 8a4 4 0 01-3 3.9V20h4v2H8v-2h4v-6.1A4 4 0 019 10L8 2z"/><path d="M8 6h8"/></svg>`
  },
  {
    id: 'cocktail',
    name: 'Cocktail',
    category: 'Cold Drinks',
    keywords: ['cocktail', 'martini', 'drink', 'bar'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h12l-6 9v7h4v2H8v-2h4v-7L6 3z"/><path d="M6 6h12"/><circle cx="14" cy="5" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'lemonade',
    name: 'Lemonade',
    category: 'Cold Drinks',
    keywords: ['lemonade', 'lemon', 'citrus', 'fresh'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 6h10l-1 14H8L7 6z"/><path d="M5 6h14"/><circle cx="12" cy="11" r="2"/><path d="M12 9v-2"/></svg>`
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    category: 'Cold Drinks',
    keywords: ['cold brew', 'coffee', 'iced', 'concentrate'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M8 8h8M8 12h8"/></svg>`
  },
  {
    id: 'frappe',
    name: 'Frappe',
    category: 'Cold Drinks',
    keywords: ['frappe', 'coffee', 'whipped', 'blended'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 6h10l-2 14H9L7 6z"/><path d="M10 10c1 2 3 2 4 0"/></svg>`
  },
  {
    id: 'iced-tea',
    name: 'Iced Tea',
    category: 'Cold Drinks',
    keywords: ['iced tea', 'tea', 'lemon', 'cold'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="4" width="10" height="16" rx="3"/><circle cx="12" cy="14" r="2"/></svg>`
  },
  {
    id: 'bubble-tea',
    name: 'Bubble Tea',
    category: 'Cold Drinks',
    keywords: ['bubble', 'boba', 'pearls', 'tapioca'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="14" rx="2"/><circle cx="9" cy="16" r="2" fill="currentColor"/><circle cx="15" cy="16" r="2" fill="currentColor"/></svg>`
  },
  {
    id: 'energy-drink',
    name: 'Energy Drink',
    category: 'Cold Drinks',
    keywords: ['energy', 'drink', 'can', 'caffeine'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 8h6M9 12h6"/></svg>`
  },
  {
    id: 'mocktail',
    name: 'Mocktail',
    category: 'Cold Drinks',
    keywords: ['mocktail', 'non-alcoholic', 'cocktail', 'juice'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4l-2 14h12l-2-14H8z"/><path d="M10 10l4 4M14 10l-4 4"/></svg>`
  },
  {
    id: 'sparkling-water',
    name: 'Sparkling Water',
    category: 'Cold Drinks',
    keywords: ['sparkling', 'water', 'carbonated', 'bubbles'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="4" width="10" height="16" rx="3"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="14" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'protein-shake',
    name: 'Protein Shake',
    category: 'Cold Drinks',
    keywords: ['protein', 'shake', 'gym', 'fitness'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4h8v16H8V4z"/><path d="M10 8h4M10 12h4"/></svg>`
  },
  {
    id: 'horchata',
    name: 'Horchata',
    category: 'Cold Drinks',
    keywords: ['horchata', 'rice', 'cinnamon', 'mexican'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="7" y="5" width="10" height="14" rx="2"/><path d="M9 9c1 2 4 2 5 0"/></svg>`
  },
  {
    id: 'kombucha',
    name: 'Kombucha',
    category: 'Cold Drinks',
    keywords: ['kombucha', 'fermented', 'tea', 'probiotic'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M10 10c2 2 2 2 4 0"/></svg>`
  },

  // ============ BREAKFAST (10) ============
  {
    id: 'croissant',
    name: 'Croissant',
    category: 'Breakfast',
    keywords: ['croissant', 'pastry', 'french', 'bread'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14c0-4 3-8 8-8s8 4 8 8c0 2-1 4-4 5H8c-3-1-4-3-4-5z"/><path d="M8 14c0-2 1.8-4 4-4s4 2 4 4"/></svg>`
  },
  {
    id: 'bagel',
    name: 'Bagel',
    category: 'Breakfast',
    keywords: ['bagel', 'bread', 'cream cheese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="9" ry="6"/><ellipse cx="12" cy="12" rx="3" ry="2"/></svg>`
  },
  {
    id: 'toast',
    name: 'Toast',
    category: 'Breakfast',
    keywords: ['toast', 'bread', 'slice'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5c0-2 3-3 7-3s7 1 7 3v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/><path d="M8 10h8M8 14h8"/></svg>`
  },
  {
    id: 'pancakes',
    name: 'Pancakes',
    category: 'Breakfast',
    keywords: ['pancakes', 'pancake', 'breakfast', 'syrup'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="17" rx="8" ry="3"/><ellipse cx="12" cy="14" rx="7" ry="2.5"/><ellipse cx="12" cy="11" rx="6" ry="2"/><path d="M14 6c2 0 3 1 3 2s-1 2-3 2"/></svg>`
  },
  {
    id: 'waffle',
    name: 'Waffle',
    category: 'Breakfast',
    keywords: ['waffle', 'breakfast', 'belgian'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 10h16M4 14h16M9 6v12M14 6v12"/></svg>`
  },
  {
    id: 'eggs',
    name: 'Eggs',
    category: 'Breakfast',
    keywords: ['eggs', 'fried', 'breakfast', 'sunny'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="13" rx="9" ry="7"/><circle cx="12" cy="13" r="3" fill="currentColor" opacity="0.3"/></svg>`
  },
  {
    id: 'bacon',
    name: 'Bacon',
    category: 'Breakfast',
    keywords: ['bacon', 'breakfast', 'meat', 'pork'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6c2 0 3 2 5 2s3-2 5-2 3 2 5 2 3-2 3-2"/><path d="M3 11c2 0 3 2 5 2s3-2 5-2 3 2 5 2 3-2 3-2"/><path d="M3 16c2 0 3 2 5 2s3-2 5-2 3 2 5 2 3-2 3-2"/></svg>`
  },
  {
    id: 'cereal',
    name: 'Cereal',
    category: 'Breakfast',
    keywords: ['cereal', 'bowl', 'breakfast', 'milk'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10c0 6 3 10 8 10s8-4 8-10"/><ellipse cx="12" cy="10" rx="8" ry="3"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'yogurt',
    name: 'Yogurt',
    category: 'Breakfast',
    keywords: ['yogurt', 'yoghurt', 'dairy', 'breakfast'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6h12v2l-1 13H7L6 8V6z"/><path d="M6 6c0-2 2-3 6-3s6 1 6 3"/><path d="M9 12c1.5 0 2 1 3 1s1.5-1 3-1"/></svg>`
  },
  {
    id: 'muffin',
    name: 'Muffin',
    category: 'Breakfast',
    keywords: ['muffin', 'breakfast', 'blueberry', 'baked'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 11h14l-2 10H7L5 11z"/><path d="M5 11c0-4 3-7 7-7s7 3 7 7"/><circle cx="10" cy="15" r="1" fill="currentColor"/><circle cx="14" cy="14" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'french-toast',
    name: 'French Toast',
    category: 'Breakfast',
    keywords: ['french toast', 'toast', 'cinnamon', 'breakfast'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="6" width="14" height="12" rx="2"/><path d="M8 8h8M8 12h8"/><path d="M7 4c2 0 3 2 3 4M17 4c-2 0-3 2-3 4"/></svg>`
  },
  {
    id: 'omelette',
    name: 'Omelette',
    category: 'Breakfast',
    keywords: ['omelette', 'omelet', 'eggs', 'folded'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="9" ry="6"/><path d="M6 14c2-3 10-3 12 0"/><circle cx="10" cy="12" r="1.5" fill="currentColor" opacity="0.4"/></svg>`
  },
  {
    id: 'granola',
    name: 'Granola',
    category: 'Breakfast',
    keywords: ['granola', 'oats', 'nuts', 'breakfast'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="8" ry="5"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/><circle cx="11" cy="16" r="1" fill="currentColor"/><circle cx="13" cy="10" r="1.2" fill="currentColor"/></svg>`
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Toast',
    category: 'Breakfast',
    keywords: ['avocado', 'toast', 'breakfast', 'healthy'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="6" width="14" height="12" rx="2"/><ellipse cx="12" cy="12" rx="5" ry="4" fill="currentColor" opacity="0.25"/></svg>`
  },
  {
    id: 'breakfast-burrito',
    name: 'Breakfast Burrito',
    category: 'Breakfast',
    keywords: ['burrito', 'breakfast', 'wrap', 'eggs'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-15 12 12)"/><path d="M6 10c3 1 9 1 12 0"/></svg>`
  },

  // ============ LUNCH (10) ============
  {
    id: 'sandwich',
    name: 'Sandwich',
    category: 'Lunch',
    keywords: ['sandwich', 'sub', 'lunch', 'bread'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8c0-2 4-4 8-4s8 2 8 4v2H4V8z"/><path d="M4 14h16v2c0 2-4 4-8 4s-8-2-8-4v-2z"/><path d="M4 10h16v4H4z"/></svg>`
  },
  {
    id: 'wrap',
    name: 'Wrap',
    category: 'Lunch',
    keywords: ['wrap', 'burrito', 'tortilla'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0-5 4-9 9-9 3 0 5 1 6 3l-15 15c-2-2-3-5 0-9z"/><path d="M8 16l11-11"/></svg>`
  },
  {
    id: 'burger',
    name: 'Burger',
    category: 'Lunch',
    keywords: ['burger', 'hamburger', 'cheeseburger', 'fast food'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8c0-2 3-4 8-4s8 2 8 4H4z"/><path d="M4 16h16c0 2-3 4-8 4s-8-2-8-4z"/><rect x="3" y="11" width="18" height="2" rx="1"/><path d="M4 8v3h16V8"/><path d="M4 13v3h16v-3"/></svg>`
  },
  {
    id: 'pizza-slice',
    name: 'Pizza Slice',
    category: 'Lunch',
    keywords: ['pizza', 'slice', 'italian', 'cheese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L3 20c0 1 1 2 2 2h14c1 0 2-1 2-2L12 2z"/><circle cx="10" cy="12" r="1.5" fill="currentColor"/><circle cx="14" cy="15" r="1.5" fill="currentColor"/><circle cx="11" cy="17" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'salad',
    name: 'Salad',
    category: 'Lunch',
    keywords: ['salad', 'healthy', 'greens', 'bowl'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0 5 4 9 8 9s8-4 8-9"/><ellipse cx="12" cy="12" rx="8" ry="3"/><path d="M8 10c1-2 2-3 4-3M14 9c0-2 1-3 2-4"/></svg>`
  },
  {
    id: 'soup',
    name: 'Soup',
    category: 'Lunch',
    keywords: ['soup', 'bowl', 'hot', 'stew'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 11c0 6 4 10 8 10s8-4 8-10"/><path d="M2 11h20"/><path d="M8 7c.5-1 .5-2 0-3M12 7c.5-1 .5-2 0-3M16 7c.5-1 .5-2 0-3"/></svg>`
  },
  {
    id: 'pasta',
    name: 'Pasta',
    category: 'Lunch',
    keywords: ['pasta', 'spaghetti', 'noodles', 'italian'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14c0 4 4 7 8 7s8-3 8-7"/><ellipse cx="12" cy="14" rx="8" ry="3"/><path d="M6 12c2-6 4-8 6-8M12 4c2 0 4 2 6 8M9 4c1-1 2-1 3 0"/></svg>`
  },
  {
    id: 'sushi',
    name: 'Sushi',
    category: 'Lunch',
    keywords: ['sushi', 'japanese', 'fish', 'rice'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="8" ry="5"/><ellipse cx="12" cy="12" rx="8" ry="5"/><ellipse cx="12" cy="12" rx="4" ry="2" fill="currentColor" opacity="0.3"/></svg>`
  },
  {
    id: 'taco',
    name: 'Taco',
    category: 'Lunch',
    keywords: ['taco', 'mexican', 'tortilla'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 14c0 4 4 7 9 7s9-3 9-7c0-6-4-11-9-11S3 8 3 14z"/><path d="M6 13c1-3 3-5 6-5s5 2 6 5"/></svg>`
  },
  {
    id: 'rice-bowl',
    name: 'Rice Bowl',
    category: 'Lunch',
    keywords: ['rice', 'bowl', 'asian', 'grain'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10c0 6 4 10 8 10s8-4 8-10"/><ellipse cx="12" cy="10" rx="8" ry="3"/><path d="M8 12v4M12 12v5M16 12v4"/></svg>`
  },
  {
    id: 'falafel',
    name: 'Falafel',
    category: 'Lunch',
    keywords: ['falafel', 'chickpea', 'middle eastern', 'ball'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/><circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.3"/><circle cx="12" cy="16" r="3" fill="currentColor" opacity="0.3"/></svg>`
  },
  {
    id: 'queso',
    name: 'Queso',
    category: 'Lunch',
    keywords: ['queso', 'cheese', 'dip', 'mexican'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="8" ry="5"/><path d="M8 10c2 2 6 2 8 0"/></svg>`
  },
  {
    id: 'pho',
    name: 'Pho',
    category: 'Lunch',
    keywords: ['pho', 'noodle', 'soup', 'vietnamese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="8" ry="6"/><path d="M6 8c3 2 9 2 12 0M9 11l3 4 3-4"/></svg>`
  },
  {
    id: 'bento-box',
    name: 'Bento Box',
    category: 'Lunch',
    keywords: ['bento', 'box', 'japanese', 'lunch'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 10h16M12 6v12"/></svg>`
  },
  {
    id: 'gyro',
    name: 'Gyro',
    category: 'Lunch',
    keywords: ['gyro', 'pita', 'greek', 'wrap'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="9" ry="5"/><path d="M8 10c2 3 6 3 8 0"/></svg>`
  },

  // ============ SNACKS (10) ============
  {
    id: 'cookie',
    name: 'Cookie',
    category: 'Snacks',
    keywords: ['cookie', 'biscuit', 'chocolate chip'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="14" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="14" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'chips',
    name: 'Chips',
    category: 'Snacks',
    keywords: ['chips', 'crisps', 'potato', 'snack'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3c-2 0-3 2-3 4v10c0 3 2 5 5 5h6c3 0 5-2 5-5V7c0-2-1-4-3-4"/><path d="M7 3c1 2 3 3 5 3s4-1 5-3"/><path d="M8 11c2 1 4 1 6 0M8 15c2 1 4 1 6 0"/></svg>`
  },
  {
    id: 'popcorn',
    name: 'Popcorn',
    category: 'Snacks',
    keywords: ['popcorn', 'cinema', 'movie', 'snack'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 10l2 11h8l2-11"/><circle cx="8" cy="7" r="3"/><circle cx="12" cy="5" r="3"/><circle cx="16" cy="7" r="3"/></svg>`
  },
  {
    id: 'pretzel',
    name: 'Pretzel',
    category: 'Snacks',
    keywords: ['pretzel', 'bread', 'snack', 'german'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20c-5 0-8-3-8-6 0-2 1-4 3-5 1-1 2-2 2-4 0-1 1-2 3-2s3 1 3 2c0 2 1 3 2 4 2 1 3 3 3 5 0 3-3 6-8 6z"/><path d="M9 12a3 3 0 106 0"/></svg>`
  },
  {
    id: 'nuts',
    name: 'Nuts',
    category: 'Snacks',
    keywords: ['nuts', 'peanuts', 'almonds', 'snack'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="10" rx="4" ry="5"/><ellipse cx="16" cy="10" rx="4" ry="5"/><ellipse cx="12" cy="16" rx="4" ry="5"/></svg>`
  },
  {
    id: 'chocolate-bar',
    name: 'Chocolate Bar',
    category: 'Snacks',
    keywords: ['chocolate', 'candy', 'bar', 'sweet'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="16" height="12" rx="1"/><path d="M4 10h16M4 14h16M9 6v12M14 6v12"/></svg>`
  },
  {
    id: 'granola-bar',
    name: 'Granola Bar',
    category: 'Snacks',
    keywords: ['granola', 'bar', 'healthy', 'oats'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 8v8M11 8v8M15 8v8"/><circle cx="5" cy="12" r="0.5" fill="currentColor"/><circle cx="9" cy="11" r="0.5" fill="currentColor"/><circle cx="13" cy="13" r="0.5" fill="currentColor"/><circle cx="17" cy="12" r="0.5" fill="currentColor"/></svg>`
  },
  {
    id: 'candy',
    name: 'Candy',
    category: 'Snacks',
    keywords: ['candy', 'sweet', 'wrapped'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="5" ry="4"/><path d="M7 12H3c0-2 1-3 2-3s2 1 2 3M17 12h4c0-2-1-3-2-3s-2 1-2 3"/></svg>`
  },
  {
    id: 'crackers',
    name: 'Crackers',
    category: 'Snacks',
    keywords: ['crackers', 'biscuit', 'snack'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="14" height="14" rx="1"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'trail-mix',
    name: 'Trail Mix',
    category: 'Snacks',
    keywords: ['trail', 'mix', 'nuts', 'dried fruit'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8c0 7 3 12 6 12s6-5 6-12"/><ellipse cx="12" cy="8" rx="6" ry="2"/><circle cx="10" cy="12" r="1" fill="currentColor"/><circle cx="14" cy="11" r="1.5" fill="currentColor"/><circle cx="11" cy="15" r="1" fill="currentColor"/></svg>`
  },

  // ============ DESSERTS (10) ============
  {
    id: 'cupcake',
    name: 'Cupcake',
    category: 'Desserts',
    keywords: ['cupcake', 'cake', 'frosting', 'birthday'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 12h12l-1 9H7l-1-9z"/><path d="M6 12c0-4 3-7 6-7s6 3 6 7"/><path d="M12 5V3"/><path d="M10 8c1 1 2 1 4 0"/></svg>`
  },
  {
    id: 'cake',
    name: 'Cake',
    category: 'Desserts',
    keywords: ['cake', 'birthday', 'celebration', 'dessert'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="11" width="16" height="10" rx="1"/><path d="M4 15h16"/><path d="M8 11V9c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M12 7V4"/><circle cx="12" cy="3" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'ice-cream',
    name: 'Ice Cream',
    category: 'Desserts',
    keywords: ['ice cream', 'gelato', 'cone', 'frozen'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22l-5-12h10l-5 12z"/><circle cx="12" cy="7" r="5"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/></svg>`
  },
  {
    id: 'donut',
    name: 'Donut',
    category: 'Desserts',
    keywords: ['donut', 'doughnut', 'glazed', 'dessert'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M9 6c1 .5 2 .5 3 0s2-.5 3 0" opacity="0.5"/></svg>`
  },
  {
    id: 'pie',
    name: 'Pie',
    category: 'Desserts',
    keywords: ['pie', 'apple', 'dessert', 'slice'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 14c0 4 4 7 8 7s8-3 8-7"/><ellipse cx="12" cy="14" rx="8" ry="3"/><path d="M4 14c0-2 1-10 8-10s8 8 8 10"/><path d="M8 11l4-4 4 4"/></svg>`
  },
  {
    id: 'brownie',
    name: 'Brownie',
    category: 'Desserts',
    keywords: ['brownie', 'chocolate', 'dessert', 'fudge'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="16" height="10" rx="1"/><path d="M4 12h16"/><path d="M10 8v10M14 8v10"/></svg>`
  },
  {
    id: 'pudding',
    name: 'Pudding',
    category: 'Desserts',
    keywords: ['pudding', 'custard', 'dessert'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0 5 4 9 8 9s8-4 8-9"/><path d="M4 12c0-3 4-5 8-5s8 2 8 5"/><path d="M12 7V5"/><circle cx="12" cy="4" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'macaron',
    name: 'Macaron',
    category: 'Desserts',
    keywords: ['macaron', 'french', 'dessert', 'cookie'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="8" rx="7" ry="4"/><ellipse cx="12" cy="16" rx="7" ry="4"/><path d="M5 10v4c0 1 3 2 7 2s7-1 7-2v-4"/></svg>`
  },
  {
    id: 'cheesecake',
    name: 'Cheesecake',
    category: 'Desserts',
    keywords: ['cheesecake', 'cake', 'dessert', 'cream'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18h18l-2-8H5l-2 8z"/><path d="M5 10c0-3 3-5 7-5s7 2 7 5"/><path d="M10 14l2-2 2 2"/></svg>`
  },
  {
    id: 'popsicle',
    name: 'Popsicle',
    category: 'Desserts',
    keywords: ['popsicle', 'ice', 'frozen', 'summer'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3h8v12a4 4 0 01-8 0V3z"/><path d="M12 15v6"/><path d="M8 8h8"/></svg>`
  },
  {
    id: 'tiramisu',
    name: 'Tiramisu',
    category: 'Desserts',
    keywords: ['tiramisu', 'italian', 'coffee', 'layered'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="6" width="14" height="12" rx="2"/><path d="M5 10h14M5 14h14"/><circle cx="12" cy="9" r="1.5" fill="currentColor" opacity="0.3"/></svg>`
  },
  {
    id: 'creme-brulee',
    name: 'Crème Brûlée',
    category: 'Desserts',
    keywords: ['creme brulee', 'custard', 'caramelized', 'torch'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="7" ry="5"/><circle cx="12" cy="10" r="3" fill="currentColor" opacity="0.4"/></svg>`
  },
  {
    id: 'eclair',
    name: 'Éclair',
    category: 'Desserts',
    keywords: ['eclair', 'pastry', 'cream', 'chocolate'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="10" ry="4"/><path d="M8 10c2 2 6 2 8 0"/></svg>`
  },
  {
    id: 'cannoli',
    name: 'Cannoli',
    category: 'Desserts',
    keywords: ['cannoli', 'italian', 'tube', 'ricotta'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="12" rx="3" ry="6"/><ellipse cx="16" cy="12" rx="3" ry="6"/><path d="M11 10l2 4"/></svg>`
  },
  {
    id: 'gelato',
    name: 'Gelato',
    category: 'Desserts',
    keywords: ['gelato', 'italian', 'ice cream', 'scoop'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="7" ry="5"/><circle cx="10" cy="11" r="2" fill="currentColor"/><circle cx="14" cy="12" r="1.5" fill="currentColor"/></svg>`
  },

  // ============ FRUITS (10) ============
  {
    id: 'apple',
    name: 'Apple',
    category: 'Fruits',
    keywords: ['apple', 'fruit', 'red', 'healthy'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4c-4 0-8 4-8 10 0 4 2 7 5 7 1 0 2-.5 3-.5s2 .5 3 .5c3 0 5-3 5-7 0-6-4-10-8-10z"/><path d="M12 4c0-2 2-3 3-3"/></svg>`
  },
  {
    id: 'banana',
    name: 'Banana',
    category: 'Fruits',
    keywords: ['banana', 'fruit', 'yellow', 'tropical'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8c0-3 4-5 9-5 6 0 7 3 7 5 0 4-3 8-8 12C8 16 5 12 5 8z"/><path d="M14 3c1 1 2 2 2 4"/></svg>`
  },
  {
    id: 'orange',
    name: 'Orange',
    category: 'Fruits',
    keywords: ['orange', 'fruit', 'citrus'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="13" r="8"/><path d="M12 5V3"/><path d="M10 3c1 1 3 1 4 0"/><path d="M12 13l-4 4M12 13l4 4M12 13v5"/></svg>`
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    category: 'Fruits',
    keywords: ['strawberry', 'fruit', 'berry', 'red'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 6c-5 0-8 4-8 9 0 4 3 7 8 7s8-3 8-7c0-5-3-9-8-9z"/><path d="M8 4c2 1 6 1 8 0"/><path d="M12 4V2"/><circle cx="9" cy="12" r="0.5" fill="currentColor"/><circle cx="15" cy="12" r="0.5" fill="currentColor"/><circle cx="12" cy="15" r="0.5" fill="currentColor"/><circle cx="10" cy="17" r="0.5" fill="currentColor"/><circle cx="14" cy="17" r="0.5" fill="currentColor"/></svg>`
  },
  {
    id: 'grapes',
    name: 'Grapes',
    category: 'Fruits',
    keywords: ['grapes', 'fruit', 'wine', 'purple'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="9" r="3"/><circle cx="15" cy="9" r="3"/><circle cx="6" cy="14" r="3"/><circle cx="12" cy="14" r="3"/><circle cx="18" cy="14" r="3"/><circle cx="9" cy="19" r="3"/><circle cx="15" cy="19" r="3"/><path d="M12 3v3"/></svg>`
  },
  {
    id: 'watermelon',
    name: 'Watermelon',
    category: 'Fruits',
    keywords: ['watermelon', 'fruit', 'summer', 'melon'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12a8 8 0 0116 0"/><path d="M4 12h16"/><path d="M4 12c0 5 4 9 8 9s8-4 8-9"/><circle cx="9" cy="15" r="0.5" fill="currentColor"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/><circle cx="15" cy="15" r="0.5" fill="currentColor"/></svg>`
  },
  {
    id: 'lemon',
    name: 'Lemon',
    category: 'Fruits',
    keywords: ['lemon', 'fruit', 'citrus', 'yellow'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="8" ry="6"/><path d="M12 6v12"/><path d="M8 9c2 1 4 1 4 3s-2 2-4 3"/><path d="M16 9c-2 1-4 1-4 3s2 2 4 3"/></svg>`
  },
  {
    id: 'cherry',
    name: 'Cherry',
    category: 'Fruits',
    keywords: ['cherry', 'fruit', 'red', 'berry'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="16" r="4"/><circle cx="16" cy="16" r="4"/><path d="M8 12c0-4 2-7 4-9"/><path d="M16 12c0-4-2-7-4-9"/><path d="M12 3c2 0 3 1 4 2"/></svg>`
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    category: 'Fruits',
    keywords: ['pineapple', 'fruit', 'tropical'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="6" ry="7"/><path d="M9 3c1 2 2 4 3 4s2-2 3-4"/><path d="M7 5c2 1 3 3 5 3s3-2 5-3"/><path d="M6 14h12M8 10l8 8M16 10l-8 8"/></svg>`
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'Fruits',
    keywords: ['avocado', 'fruit', 'healthy', 'green'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2c-4 0-7 5-7 11 0 5 3 9 7 9s7-4 7-9c0-6-3-11-7-11z"/><ellipse cx="12" cy="14" rx="3" ry="4"/></svg>`
  },

  // ============ MEALS (10) ============
  {
    id: 'steak',
    name: 'Steak',
    category: 'Meals',
    keywords: ['steak', 'beef', 'meat', 'dinner'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0-4 4-8 10-8 4 0 7 2 7 5 0 4-3 9-9 11-5 0-8-4-8-8z"/><path d="M10 10c2 0 4 1 4 3"/></svg>`
  },
  {
    id: 'chicken-leg',
    name: 'Chicken Leg',
    category: 'Meals',
    keywords: ['chicken', 'leg', 'drumstick', 'meat'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 4c3 0 5 2 5 5 0 4-3 7-7 7-2 0-3-1-4-2l-5 6-2-2 6-5c-1-1-2-2-2-4 0-4 3-7 7-7 1 0 2 .5 2 2z"/></svg>`
  },
  {
    id: 'fish',
    name: 'Fish',
    category: 'Meals',
    keywords: ['fish', 'seafood', 'salmon', 'healthy'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12c3-5 9-7 15-4-6 3-12 1-15 4z"/><path d="M3 12c3 5 9 7 15 4-6-3-12-1-15-4z"/><path d="M18 8l3 4-3 4"/><circle cx="7" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'curry',
    name: 'Curry',
    category: 'Meals',
    keywords: ['curry', 'indian', 'spicy', 'rice'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0 5 4 9 8 9s8-4 8-9"/><ellipse cx="12" cy="12" rx="8" ry="3"/><path d="M8 9c.5-1 .5-2 0-3M12 8c.5-1 .5-2 0-3M16 9c.5-1 .5-2 0-3"/></svg>`
  },
  {
    id: 'noodles',
    name: 'Noodles',
    category: 'Meals',
    keywords: ['noodles', 'ramen', 'asian', 'soup'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 11c0 6 4 10 8 10s8-4 8-10"/><path d="M2 11h20"/><path d="M6 6c1 2 2 3 2 5M10 4c1 2 2 4 2 7M14 4c1 2 2 4 2 7M18 6c1 2 2 3 2 5"/></svg>`
  },
  {
    id: 'pot',
    name: 'Pot',
    category: 'Meals',
    keywords: ['pot', 'cooking', 'stew', 'soup'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h16v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/><path d="M2 10h2M20 10h2"/><path d="M8 10V8M12 10V6M16 10V8"/><path d="M6 10c0-2 3-4 6-4s6 2 6 4"/></svg>`
  },
  {
    id: 'plate',
    name: 'Plate',
    category: 'Meals',
    keywords: ['plate', 'dish', 'dinner', 'meal'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="14" rx="10" ry="5"/><ellipse cx="12" cy="14" rx="6" ry="3"/></svg>`
  },
  {
    id: 'fried-rice',
    name: 'Fried Rice',
    category: 'Meals',
    keywords: ['rice', 'fried', 'asian', 'chinese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0 5 4 8 8 8s8-3 8-8"/><ellipse cx="12" cy="12" rx="8" ry="3"/><circle cx="8" cy="14" r="0.5" fill="currentColor"/><circle cx="11" cy="16" r="0.5" fill="currentColor"/><circle cx="14" cy="14" r="0.5" fill="currentColor"/><circle cx="16" cy="16" r="0.5" fill="currentColor"/><circle cx="10" cy="13" r="0.5" fill="currentColor"/></svg>`
  },
  {
    id: 'kebab',
    name: 'Kebab',
    category: 'Meals',
    keywords: ['kebab', 'skewer', 'bbq', 'grill'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20"/><rect x="9" y="5" width="6" height="3" rx="1"/><circle cx="12" cy="11" r="2"/><rect x="9" y="15" width="6" height="3" rx="1"/></svg>`
  },
  {
    id: 'roast',
    name: 'Roast',
    category: 'Meals',
    keywords: ['roast', 'dinner', 'sunday', 'meat'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="15" rx="9" ry="5"/><path d="M6 12c0-3 3-6 6-6s6 3 6 6"/><path d="M9 15v-2M12 15v-4M15 15v-2"/></svg>`
  },

  // ============ FAST FOOD (10) ============
  {
    id: 'fries',
    name: 'Fries',
    category: 'Fast Food',
    keywords: ['fries', 'chips', 'potato', 'fast food'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 10l2 11h8l2-11"/><path d="M8 10V4M11 10V3M14 10V4M17 10V5"/><path d="M5 10h14"/></svg>`
  },
  {
    id: 'hotdog',
    name: 'Hot Dog',
    category: 'Fast Food',
    keywords: ['hotdog', 'sausage', 'fast food', 'bun'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0-3 4-6 8-6s8 3 8 6-4 6-8 6-8-3-8-6z"/><path d="M6 10c3-2 9-2 12 0"/><path d="M6 14c3 2 9 2 12 0"/><path d="M7 12c2.5-1 5-1 10 0"/></svg>`
  },
  {
    id: 'pizza-whole',
    name: 'Pizza',
    category: 'Fast Food',
    keywords: ['pizza', 'whole', 'italian', 'cheese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.36 6.36"/><path d="M12 12L5.64 18.36"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'burrito',
    name: 'Burrito',
    category: 'Fast Food',
    keywords: ['burrito', 'mexican', 'wrap', 'tortilla'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="9" ry="5" transform="rotate(-20 12 12)"/><path d="M5 9c4 2 10 2 14 0"/></svg>`
  },
  {
    id: 'nuggets',
    name: 'Nuggets',
    category: 'Fast Food',
    keywords: ['nuggets', 'chicken', 'fast food', 'fried'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="7" cy="10" rx="4" ry="3"/><ellipse cx="14" cy="8" rx="4" ry="3"/><ellipse cx="17" cy="14" rx="4" ry="3"/><ellipse cx="10" cy="15" rx="4" ry="3"/></svg>`
  },
  {
    id: 'onion-rings',
    name: 'Onion Rings',
    category: 'Fast Food',
    keywords: ['onion', 'rings', 'fried', 'fast food'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="10" rx="4" ry="2"/><ellipse cx="8" cy="10" rx="2" ry="1"/><ellipse cx="16" cy="10" rx="4" ry="2"/><ellipse cx="16" cy="10" rx="2" ry="1"/><ellipse cx="12" cy="16" rx="4" ry="2"/><ellipse cx="12" cy="16" rx="2" ry="1"/></svg>`
  },
  {
    id: 'nachos',
    name: 'Nachos',
    category: 'Fast Food',
    keywords: ['nachos', 'chips', 'mexican', 'cheese'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18l4-14h8l4 14H4z"/><path d="M8 18l2-7M12 18V8M16 18l-2-7"/><circle cx="10" cy="14" r="1" fill="currentColor"/><circle cx="14" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'corn-dog',
    name: 'Corn Dog',
    category: 'Fast Food',
    keywords: ['corn', 'dog', 'fried', 'stick'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c-3 0-5 2-5 5v6c0 3 2 5 5 5s5-2 5-5V8c0-3-2-5-5-5z"/><path d="M12 19v3"/></svg>`
  },
  {
    id: 'quesadilla',
    name: 'Quesadilla',
    category: 'Fast Food',
    keywords: ['quesadilla', 'mexican', 'cheese', 'tortilla'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12h18L12 20 3 12z"/><path d="M3 12L12 4l9 8"/><path d="M7 12h10"/></svg>`
  },
  {
    id: 'sub-sandwich',
    name: 'Sub Sandwich',
    category: 'Fast Food',
    keywords: ['sub', 'sandwich', 'hoagie', 'long'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12c0-2 4-4 9-4s9 2 9 4-4 4-9 4-9-2-9-4z"/><path d="M3 12c0 2 4 4 9 4s9-2 9-4"/><path d="M5 10c4-1 10-1 14 0"/></svg>`
  },

  // ============ OTHER (10) ============
  {
    id: 'cutlery',
    name: 'Cutlery',
    category: 'Other',
    keywords: ['cutlery', 'fork', 'knife', 'utensils'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3v18M6 3c-1 0-2 2-2 4s1 4 2 4M6 3c1 0 2 2 2 4s-1 4-2 4"/><path d="M18 3v7c0 1-1 2-2 2h-1v9"/><path d="M18 3c0 3-1 5-3 7"/></svg>`
  },
  {
    id: 'takeaway',
    name: 'Takeaway',
    category: 'Other',
    keywords: ['takeaway', 'takeout', 'box', 'container'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8h16l-2 13H6L4 8z"/><path d="M8 8V6c0-2 2-4 4-4s4 2 4 4v2"/><path d="M4 12h16"/></svg>`
  },
  {
    id: 'shopping-bag',
    name: 'Shopping Bag',
    category: 'Other',
    keywords: ['bag', 'shopping', 'grocery', 'store'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M8 8V6a4 4 0 018 0v2"/></svg>`
  },
  {
    id: 'gift',
    name: 'Gift',
    category: 'Other',
    keywords: ['gift', 'present', 'box', 'special'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M12 8c-2 0-4-2-4-3s1-2 2-2c2 0 2 2 2 5M12 8c2 0 4-2 4-3s-1-2-2-2c-2 0-2 2-2 5"/></svg>`
  },
  {
    id: 'voucher',
    name: 'Voucher',
    category: 'Other',
    keywords: ['voucher', 'coupon', 'discount', 'ticket'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16v4a2 2 0 100 4v4H4v-4a2 2 0 100-4V6z"/><path d="M10 6v12" stroke-dasharray="2 2"/></svg>`
  },
  {
    id: 'tip',
    name: 'Tip',
    category: 'Other',
    keywords: ['tip', 'gratuity', 'money', 'service'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 6v2M12 16v2M9 9c0-1.5 1.5-2 3-2s3 .5 3 2-1 2-3 2-3 .5-3 2 1.5 2 3 2 3-.5 3-2"/></svg>`
  },
  {
    id: 'menu',
    name: 'Menu',
    category: 'Other',
    keywords: ['menu', 'list', 'food', 'order'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>`
  },
  {
    id: 'clock',
    name: 'Clock',
    category: 'Other',
    keywords: ['clock', 'time', 'hours', 'wait'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>`
  },
  {
    id: 'star',
    name: 'Star',
    category: 'Other',
    keywords: ['star', 'favorite', 'special', 'featured'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"/></svg>`
  },
  {
    id: 'heart',
    name: 'Heart',
    category: 'Other',
    keywords: ['heart', 'love', 'favorite', 'like'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21C12 21 4 14 4 8.5C4 5.5 6.5 3 9.5 3C11 3 12 4 12 4C12 4 13 3 14.5 3C17.5 3 20 5.5 20 8.5C20 14 12 21 12 21Z"/></svg>`
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    category: 'Other',
    keywords: ['restaurant', 'dining', 'eat out'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4V4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`
  },
  {
    id: 'chef-hat',
    name: 'Chef Hat',
    category: 'Other',
    keywords: ['chef', 'hat', 'cook', 'kitchen'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 16c0-4 4-8 6-8s6 4 6 8"/><ellipse cx="12" cy="8" rx="6" ry="4"/></svg>`
  },
  {
    id: 'apron',
    name: 'Apron',
    category: 'Other',
    keywords: ['apron', 'cooking', 'protect'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M8 4v4M16 4v4"/></svg>`
  },
  {
    id: 'recipe-book',
    name: 'Recipe Book',
    category: 'Other',
    keywords: ['recipe', 'book', 'cookbook'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>`
  },
  {
    id: 'grill',
    name: 'Grill',
    category: 'Other',
    keywords: ['grill', 'bbq', 'barbecue'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="16" height="10" rx="2"/><path d="M6 8v-2M10 8v-2M14 8v-2M18 8v-2"/></svg>`
  },
  {
    id: 'microwave',
    name: 'Microwave',
    category: 'Other',
    keywords: ['microwave', 'oven', 'heat'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4"/></svg>`
  },
  {
    id: 'fridge',
    name: 'Fridge',
    category: 'Other',
    keywords: ['fridge', 'refrigerator', 'cool'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="12" height="16" rx="2"/><path d="M6 10h12"/></svg>`
  },
  {
    id: 'delivery',
    name: 'Delivery',
    category: 'Other',
    keywords: ['delivery', 'food', 'scooter'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 7h14l-2 8H7L5 7z"/></svg>`
  },
  {
    id: 'napkin',
    name: 'Napkin',
    category: 'Other',
    keywords: ['napkin', 'serviette', 'table'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/></svg>`
  },
  {
    id: 'spatula',
    name: 'Spatula',
    category: 'Other',
    keywords: ['spatula', 'kitchen', 'tool', 'flip'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="10" y="4" width="4" height="12" rx="1"/><path d="M8 16h8l2 4H6l2-4z"/></svg>`
  },
  {
    id: 'whisk',
    name: 'Whisk',
    category: 'Other',
    keywords: ['whisk', 'beater', 'mix'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4v8M8 12c0 4 8 4 8 0"/></svg>`
  },
  {
    id: 'rolling-pin',
    name: 'Rolling Pin',
    category: 'Other',
    keywords: ['rolling pin', 'dough', 'bake'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="12" rx="10" ry="3"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="12" r="2"/></svg>`
  },
  {
    id: 'cutting-board',
    name: 'Cutting Board',
    category: 'Other',
    keywords: ['cutting board', 'chopping', 'wood'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="6" width="14" height="12" rx="2"/><path d="M8 10h8M8 14h8"/></svg>`
  },
  {
    id: 'salt-shaker',
    name: 'Salt Shaker',
    category: 'Other',
    keywords: ['salt', 'shaker', 'seasoning'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="6" width="6" height="12" rx="3"/><circle cx="12" cy="10" r="1.5" fill="currentColor"/></svg>`
  },
  {
    id: 'pepper-mill',
    name: 'Pepper Mill',
    category: 'Other',
    keywords: ['pepper', 'mill', 'grinder'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="4" width="6" height="14" rx="3"/><path d="M12 18v4"/></svg>`
  },
  {
    id: 'corkscrew',
    name: 'Corkscrew',
    category: 'Other',
    keywords: ['corkscrew', 'wine', 'opener'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4v12M8 16l4 4 4-4"/><path d="M10 10c1 2 3 2 4 0"/></svg>`
  },
  {
    id: 'tray',
    name: 'Tray',
    category: 'Other',
    keywords: ['tray', 'serving', 'waiter'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="8" width="16" height="8" rx="2"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`
  },
  {
    id: 'chopsticks',
    name: 'Chopsticks',
    category: 'Other',
    keywords: ['chopsticks', 'asian', 'eating'],
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 4l-2 16M16 4l2 16"/><path d="M6 12h12"/></svg>`
  }
];

// Helper function to find icon by product name
export function findIconForProduct(name: string, category: string | null): FoodIcon | null {
  const nameLower = name.toLowerCase();
  
  // First try exact keyword match
  for (const icon of foodIcons) {
    for (const keyword of icon.keywords) {
      if (nameLower.includes(keyword)) {
        return icon;
      }
    }
  }
  
  // Then try category match
  if (category) {
    const categoryIcons = foodIcons.filter(i => i.category.toLowerCase() === category.toLowerCase());
    if (categoryIcons.length > 0) {
      return categoryIcons[0];
    }
  }
  
  return null;
}

// Get icon by ID
export function getIconById(id: string): FoodIcon | undefined {
  return foodIcons.find(icon => icon.id === id);
}

// Get icons by category
export function getIconsByCategory(category: string): FoodIcon[] {
  return foodIcons.filter(icon => icon.category === category);
}
