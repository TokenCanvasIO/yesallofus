#!/usr/bin/env node
const readline = require('readline');
const https = require('https');
const { exec } = require('child_process');

const API_URL = 'api.dltpays.com';

// Colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgMagenta: '\x1b[45m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

function normalizeUrl(url) {
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
}

async function askWithValidation(question, validator, errorMessage, normalizer = null) {
  while (true) {
    const answer = await ask(question);
    
    if (!answer.trim()) {
      console.log(`${c.red}  ✗ This field is required${c.reset}`);
      continue;
    }
    
    if (validator && !validator(answer.trim())) {
      console.log(`${c.red}  ✗ ${errorMessage}${c.reset}`);
      continue;
    }
    
    return normalizer ? normalizer(answer.trim()) : answer.trim();
  }
}

function apiCall(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_URL,
      port: 443,
      path: `/api/v1${path}`,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  
  exec(command, (err) => {
    if (err) {
      console.log(`${c.dim}  Could not open browser automatically.${c.reset}`);
    }
  });
}

function banner() {
  console.log('');
  console.log(`${c.cyan}    ██╗   ██╗███████╗███████╗ █████╗ ██╗     ██╗      ██████╗ ███████╗██╗   ██╗███████╗${c.reset}`);
  console.log(`${c.cyan}    ╚██╗ ██╔╝██╔════╝██╔════╝██╔══██╗██║     ██║     ██╔═══██╗██╔════╝██║   ██║██╔════╝${c.reset}`);
  console.log(`${c.green}     ╚████╔╝ █████╗  ███████╗███████║██║     ██║     ██║   ██║█████╗  ██║   ██║███████╗${c.reset}`);
  console.log(`${c.green}      ╚██╔╝  ██╔══╝  ╚════██║██╔══██║██║     ██║     ██║   ██║██╔══╝  ██║   ██║╚════██║${c.reset}`);
  console.log(`${c.cyan}       ██║   ███████╗███████║██║  ██║███████╗███████╗╚██████╔╝██║     ╚██████╔╝███████║${c.reset}`);
  console.log(`${c.cyan}       ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝      ╚═════╝ ╚══════╝${c.reset}`);
  console.log('');
  console.log(`${c.bold}${c.white}                    ⚡ Instant Affiliate Commissions on XRPL ⚡${c.reset}`);
  console.log(`${c.dim}                      Pay affiliates in seconds, not months${c.reset}`);
  console.log('');
  console.log(`${c.gray}  ════════════════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log('');
}

function section(emoji, title) {
  console.log('');
  console.log(`${c.gray}  ──────────────────────────────────────────────────────────────────────────────────${c.reset}`);
  console.log(`${c.bold}  ${emoji} ${title}${c.reset}`);
  console.log(`${c.gray}  ──────────────────────────────────────────────────────────────────────────────────${c.reset}`);
}

function box(lines, color = c.cyan) {
  const maxLen = Math.max(...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length));
  const pad = (s) => {
    const plainLen = s.replace(/\x1b\[[0-9;]*m/g, '').length;
    return s + ' '.repeat(maxLen - plainLen);
  };
  console.log(`${color}  ╭${'─'.repeat(maxLen + 2)}╮${c.reset}`);
  lines.forEach(line => {
    console.log(`${color}  │${c.reset} ${pad(line)} ${color}│${c.reset}`);
  });
  console.log(`${color}  ╰${'─'.repeat(maxLen + 2)}╯${c.reset}`);
}

function success(msg) {
  console.log(`${c.green}  ✓ ${msg}${c.reset}`);
}

function info(label, value, indent = '  ') {
  const labelPad = 15;
  const paddedLabel = label.padEnd(labelPad);
  console.log(`${indent}${c.dim}${paddedLabel}${c.reset}${c.bold}${value}${c.reset}`);
}

function spinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  process.stdout.write(`\n${c.yellow}  ${frames[0]} ${text}${c.reset}`);
  return setInterval(() => {
    i = (i + 1) % frames.length;
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${c.yellow}  ${frames[i]} ${text}${c.reset}`);
  }, 80);
}

function stopSpinner(interval) {
  clearInterval(interval);
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
}

const PLATFORMS = {
  '1': { name: 'WooCommerce / WordPress', key: 'woocommerce' },
  '2': { name: 'Shopify', key: 'shopify' },
  '3': { name: 'Custom / API Integration', key: 'custom' },
  '4': { name: 'Stripe Checkout', key: 'stripe' },
  '5': { name: 'Gumroad', key: 'gumroad' },
  '6': { name: 'LemonSqueezy', key: 'lemonsqueezy' },
  '7': { name: 'Paddle', key: 'paddle' }
};

function showPlatformMenu() {
  console.log('');
  console.log(`${c.bold}  What platform is your store on?${c.reset}`);
  console.log('');
  Object.entries(PLATFORMS).forEach(([num, platform]) => {
    const icon = num === '1' ? '🟢' : num === '2' ? '🟣' : num === '3' ? '⚡' : '○';
    console.log(`${c.dim}    ${icon}${c.reset} ${c.cyan}[${num}]${c.reset} ${platform.name}`);
  });
  console.log('');
}

function getWooCommerceInstructions(storeId, apiSecret) {
  return `
${c.bold}${c.green}  WooCommerce Setup (Easiest - 2 minutes)${c.reset}

  ${c.bold}Step 1:${c.reset} Download the plugin
  ${c.cyan}https://github.com/TokenCanvasIO/YesAllofUs-wordpress/releases/download/v1.0.0/YesAllofUs.zip${c.reset}

  ${c.bold}Step 2:${c.reset} Install in WordPress
  ${c.dim}WordPress Admin → Plugins → Add New → Upload Plugin → Select the .zip${c.reset}

  ${c.bold}Step 3:${c.reset} Activate & Configure
  ${c.dim}Go to Settings → YesAllofUs and enter your API credentials${c.reset}

  ${c.bold}What you get:${c.reset}
  ${c.green}✓${c.reset} Affiliate signup page        ${c.dim}[yesallofus_affiliate_signup]${c.reset}
  ${c.green}✓${c.reset} Affiliate dashboard           ${c.dim}[yesallofus_affiliate_dashboard]${c.reset}
  ${c.green}✓${c.reset} Auto commission tracking      ${c.dim}on every WooCommerce order${c.reset}
  ${c.green}✓${c.reset} Store admin dashboard         ${c.dim}manage affiliates & payouts${c.reset}
  ${c.green}✓${c.reset} Instant RLUSD payouts         ${c.dim}via Xaman or Crossmark auto-sign${c.reset}
`;
}

function getShopifyInstructions(storeId, apiSecret) {
  return `
${c.bold}${c.magenta}  Shopify Setup${c.reset}

  ${c.bold}Step 1:${c.reset} Add tracking script to your theme
  ${c.dim}Online Store → Themes → Edit Code → theme.liquid (before </head>)${c.reset}

${c.blue}  <script>
    (function() {
      const ref = new URLSearchParams(window.location.search).get('ref');
      if (ref) {
        document.cookie = 'yesallofus_ref=' + ref + ';path=/;max-age=2592000';
      }
    })();
  </script>${c.reset}

  ${c.bold}Step 2:${c.reset} Create a Shopify Flow or use webhooks
  ${c.dim}Settings → Notifications → Webhooks → Create webhook${c.reset}
  ${c.dim}Event: Order payment → URL: Your server endpoint${c.reset}

  ${c.bold}Step 3:${c.reset} Call YesAllofUs API on order completion
  ${c.dim}(See API integration below)${c.reset}

  ${c.yellow}⚠ Shopify requires a small backend to call our API.${c.reset}
  ${c.dim}We're building a native Shopify app - join the waitlist: mark@yesallofus.com${c.reset}
`;
}

function getCustomInstructions(storeId, apiSecret) {
  return `
${c.bold}${c.cyan}  Custom API Integration${c.reset}

  ${c.bold}Step 1:${c.reset} Track referral codes
  ${c.dim}Capture the ?ref= parameter and store it with the user/order${c.reset}

  ${c.bold}Step 2:${c.reset} Call payout endpoint on successful order

${c.blue}  // When order completes successfully:
  const response = await fetch('https://api.dltpays.com/api/v1/payout', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${c.yellow}${apiSecret}${c.blue}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      order_id: orderId,           // Your unique order ID
      order_total: 49.99,          // Order amount in USD
      referral_code: refCode       // The ?ref= code from cookie
    })
  });${c.reset}

  ${c.bold}Step 3:${c.reset} Share your affiliate signup link
  ${c.cyan}https://yesallofus.com/affiliate-signup?store=${storeId}${c.reset}
`;
}

function getStripeInstructions(storeId, apiSecret) {
  return `
${c.bold}${c.blue}  Stripe Checkout Integration${c.reset}

  ${c.bold}Step 1:${c.reset} Add metadata to checkout session

${c.blue}  const session = await stripe.checkout.sessions.create({
    // ... your config
    metadata: {
      referral_code: req.cookies.yesallofus_ref || ''
    }
  });${c.reset}

  ${c.bold}Step 2:${c.reset} Handle checkout.session.completed webhook

${c.blue}  // In your Stripe webhook handler:
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    await fetch('https://api.dltpays.com/api/v1/payout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ${c.yellow}${apiSecret}${c.blue}',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: session.id,
        order_total: session.amount_total / 100,
        referral_code: session.metadata.referral_code
      })
    });
  }${c.reset}
`;
}

function getGenericInstructions(platform, storeId, apiSecret) {
  return `
${c.bold}${c.yellow}  ${PLATFORMS[platform].name} Integration${c.reset}

  ${c.dim}We're working on native integrations for ${PLATFORMS[platform].name}.${c.reset}
  ${c.dim}For now, use the webhook/API approach:${c.reset}

  ${c.bold}Core concept:${c.reset}
  ${c.cyan}1.${c.reset} Track ?ref= parameter in cookies
  ${c.cyan}2.${c.reset} On successful payment, POST to our API
  ${c.cyan}3.${c.reset} We handle commission calculation & instant payout

  ${c.bold}API Endpoint:${c.reset}
  ${c.cyan}POST https://api.dltpays.com/api/v1/payout${c.reset}

  ${c.bold}Request body:${c.reset}
${c.blue}  {
    "order_id": "unique_order_123",
    "order_total": 99.99,
    "referral_code": "ABC123"
  }${c.reset}

  ${c.bold}Need help?${c.reset} ${c.cyan}mark@yesallofus.com${c.reset}
`;
}

async function main() {
  banner();

  console.log(`${c.bold}  Let's get your store set up with instant affiliate payouts${c.reset}`);
  console.log(`${c.dim}  Takes about 2 minutes for WooCommerce, 5-10 for custom integrations${c.reset}`);
  console.log('');

  // Store details with validation
  const storeName = await askWithValidation(
    `${c.cyan}  Store name: ${c.reset}`,
    (name) => name.length >= 2,
    'Store name must be at least 2 characters'
  );
  
  const storeUrl = await askWithValidation(
    `${c.cyan}  Website URL: ${c.reset}`,
    isValidUrl,
    'Please enter a valid URL (e.g. mystore.com or https://mystore.com)',
    normalizeUrl
  );
  
  const email = await askWithValidation(
    `${c.cyan}  Email: ${c.reset}`,
    isValidEmail,
    'Please enter a valid email address'
  );

  // Referral code (optional)
  const referralCode = await ask(`${c.cyan}  Referral code (optional): ${c.reset}`);
  
  let referred_by_store = null;
  if (referralCode.trim()) {
    const lookupResult = await apiCall('GET', `/store/lookup-referral/${referralCode.trim()}`);
    if (lookupResult.success) {
      referred_by_store = lookupResult.store_id;
      console.log(`${c.green}  ✓ Referred by: ${lookupResult.store_name} (50% off first month!)${c.reset}`);
    } else {
      console.log(`${c.yellow}  ⚠ Referral code not found - continuing without referral${c.reset}`);
    }
  }

  // Platform selection
  showPlatformMenu();
  const platformChoice = await ask(`${c.cyan}  Select platform [1-7]: ${c.reset}`);
  const platform = PLATFORMS[platformChoice] || PLATFORMS['3'];

  const spin = spinner('Registering your store...');

  const result = await apiCall('POST', '/store/register', {
    store_name: storeName,
    store_url: storeUrl,
    email: email,
    platform: platform.key,
    referred_by_store: referred_by_store
  });

  stopSpinner(spin);

if (result.error) {
  console.log(`\n${c.red}  ✗ Error: ${result.error}${c.reset}\n`);
  rl.close();
  return;
}

// ADD THIS BLOCK
if (result.reconnected) {
  console.log('');
  console.log(`${c.yellow}  ⚠ Store already registered for ${storeUrl}${c.reset}`);
  console.log('');
  console.log(`${c.bold}  Log in to your dashboard:${c.reset}`);
  console.log(`${c.cyan}  https://yesallofus.com/dashboard?claim=${result.claim_token}${c.reset}`);
  console.log('');
  console.log(`${c.dim}  Need a new API secret? Regenerate it from the dashboard.${c.reset}`);
  console.log('');
  rl.close();
  return;
}

console.log('');
success('Store registered successfully!');
// ... rest of the success flow

  // Credentials
  section('🔐', 'Your Credentials');
  console.log('');
  box([
    `${c.dim}Store ID${c.reset}       ${c.bold}${result.store_id}${c.reset}`,
    `${c.dim}API Key${c.reset}        ${c.bold}${result.api_key}${c.reset}`,
    `${c.dim}API Secret${c.reset}     ${c.bold}${c.yellow}${result.api_secret}${c.reset}`,
    `${c.dim}Referral Code${c.reset}  ${c.bold}${result.store_referral_code}${c.reset}`
  ]);
  console.log(`\n${c.yellow}  ⚠  Save your API Secret now - it cannot be retrieved later${c.reset}`);

  // Platform-specific instructions
  section('📦', `${platform.name} Setup`);
  
  switch (platform.key) {
    case 'woocommerce':
      console.log(getWooCommerceInstructions(result.store_id, result.api_secret));
      break;
    case 'shopify':
      console.log(getShopifyInstructions(result.store_id, result.api_secret));
      console.log(getCustomInstructions(result.store_id, result.api_secret));
      break;
    case 'stripe':
      console.log(getStripeInstructions(result.store_id, result.api_secret));
      break;
    case 'custom':
      console.log(getCustomInstructions(result.store_id, result.api_secret));
      break;
    default:
      console.log(getGenericInstructions(platformChoice, result.store_id, result.api_secret));
      console.log(getCustomInstructions(result.store_id, result.api_secret));
  }

  // Affiliate signup
  section('🎯', 'Affiliate Signup Page');
  console.log('');
  console.log(`${c.dim}  Share this link for affiliates to register:${c.reset}`);
  console.log('');
  console.log(`${c.bold}${c.cyan}  https://yesallofus.com/affiliate-signup?store=${result.store_id}${c.reset}`);
  
  if (platform.key === 'woocommerce') {
    console.log('');
    console.log(`${c.dim}  Or use the shortcode on any WordPress page:${c.reset}`);
    console.log(`${c.blue}  [yesallofus_affiliate_signup]${c.reset}`);
  }

  // Resources
  section('📚', 'Resources');
  console.log('');
  info('Documentation', 'https://yesallofus.com/docs');
  info('Support', 'mark@yesallofus.com');
  info('Twitter', '@YesAllofUs');
  
  console.log('');
  console.log(`${c.gray}  ════════════════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log('');
  console.log(`${c.bold}${c.green}  🚀 You're ready to pay affiliates instantly!${c.reset}`);
  console.log(`${c.dim}     Lagos to London, same speed. That's the future.${c.reset}`);
  console.log('');

  // Wallet connection
  section('👛', 'Connect Your Wallet');
  console.log('');
  console.log(`${c.dim}  Payout options:${c.reset}`);
  console.log(`${c.green}  • Xaman${c.reset} ${c.dim}- Manual approval via push notification${c.reset}`);
  console.log(`${c.blue}  • Crossmark${c.reset} ${c.dim}- Automatic payouts within your limits${c.reset}`);
  console.log('');
  
  const dashboardUrl = `https://yesallofus.com/dashboard?claim=${result.claim_token}`;
  
  console.log(`${c.bold}  Open this URL to connect your wallet:${c.reset}`);
  console.log('');
  console.log(`${c.cyan}  ${dashboardUrl}${c.reset}`);
  console.log('');
  console.log(`${c.yellow}  💡 Use Chrome or Brave for best experience (required for Crossmark)${c.reset}`)
  
  console.log('');
  console.log(`${c.gray}  ════════════════════════════════════════════════════════════════════════════════════${c.reset}`);
  console.log('');
  console.log(`${c.bold}${c.white}  Thanks for choosing YesAllofUs! 🤝${c.reset}`);
  console.log(`${c.dim}  Questions? mark@yesallofus.com${c.reset}`);
  console.log('');

  rl.close();
}

main().catch(err => {
  console.error(`${c.red}Error: ${err.message}${c.reset}`);
  rl.close();
});