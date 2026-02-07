#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = '/Users/markflynn/Local Sites/yesallofus';
const OUT = path.join(BASE, 'swift-reference', 'monolithic_swift_ready.txt');

// Recursively find source files
function findFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git', 'build', 'swift-reference'].includes(entry.name)) continue;
      findFiles(fullPath, results);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Classify flow
function classifyFlow(relpath) {
  if (/^app\/\(main\)\/dashboard\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/\(main\)\/faq\/dashboard\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/\(noheader\)\/take-payment\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/\(noheader\)\/customer-signup\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/\(noheader\)\/signup-customer\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/\(noheader\)\/receipts\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/\(noheader\)\/display\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/staff\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/staffpos\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/analytics\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/pos-/.test(relpath)) return 'Vendor Flow';
  if (/^app\/pay\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/checkout\//.test(relpath)) return 'Vendor Flow';
  if (/^app\/affiliate-dashboard\//.test(relpath)) return 'Affiliate Flow';
  if (/^app\/earn\//.test(relpath)) return 'Affiliate Flow';
  if (/^app\/\(main\)\/commission-dashboard\//.test(relpath)) return 'Affiliate Flow';
  if (/^app\/\(main\)\/discover-vendors\//.test(relpath)) return 'Affiliate Flow';
  if (/^app\/\(main\)\/affiliate-terms\//.test(relpath)) return 'Affiliate Flow';

  // Components
  if (/^components\/DashboardHeader/.test(relpath)) return 'Vendor Flow';
  if (/^components\/Sidebar/.test(relpath)) return 'Vendor Flow';
  if (/^components\/StoreActivity/.test(relpath)) return 'Vendor Flow';
  if (/^components\/WalletFunding/.test(relpath)) return 'Vendor Flow';
  if (/^components\/WalletSettings/.test(relpath)) return 'Vendor Flow';
  if (/^components\/TopUpRLUSD/.test(relpath)) return 'Vendor Flow';
  if (/^components\/WithdrawRLUSD/.test(relpath)) return 'Vendor Flow';
  if (/^components\/PendingPayments/.test(relpath)) return 'Vendor Flow';
  if (/^components\/PendingCustomers/.test(relpath)) return 'Vendor Flow';
  if (/^components\/PaymentOptions/.test(relpath)) return 'Vendor Flow';
  if (/^components\/PaymentSuccess/.test(relpath)) return 'Vendor Flow';
  if (/^components\/ProductsManager/.test(relpath)) return 'Vendor Flow';
  if (/^components\/BarcodeScanner/.test(relpath)) return 'Vendor Flow';
  if (/^components\/CSVImportModal/.test(relpath)) return 'Vendor Flow';
  if (/^components\/DeleteConfirmModal/.test(relpath)) return 'Vendor Flow';
  if (/^components\/EmailReceiptModal/.test(relpath)) return 'Vendor Flow';
  if (/^components\/ReceiptActions/.test(relpath)) return 'Vendor Flow';
  if (/^components\/InventoryHistoryModal/.test(relpath)) return 'Vendor Flow';
  if (/^components\/LinkNFCCard/.test(relpath)) return 'Vendor Flow';
  if (/^components\/NFCPayment/.test(relpath)) return 'Vendor Flow';
  if (/^components\/NFCTapPay/.test(relpath)) return 'Vendor Flow';
  if (/^components\/TapToPaySettings/.test(relpath)) return 'Vendor Flow';
  if (/^components\/SplitBillModal/.test(relpath)) return 'Vendor Flow';
  if (/^components\/StaffSelector/.test(relpath)) return 'Vendor Flow';
  if (/^components\/SendPaymentLink/.test(relpath)) return 'Vendor Flow';
  if (/^components\/TakePaymentHeader/.test(relpath)) return 'Vendor Flow';
  if (/^components\/TakePaymentTour/.test(relpath)) return 'Vendor Flow';
  if (/^components\/TipSelector/.test(relpath)) return 'Vendor Flow';
  if (/^components\/InstantPay/.test(relpath)) return 'Vendor Flow';
  if (/^components\/SignUpCustomerCard/.test(relpath)) return 'Vendor Flow';
  if (/^components\/OnboardingSetup/.test(relpath)) return 'Vendor Flow';
  if (/^components\/MilestoneChecklist/.test(relpath)) return 'Vendor Flow';
  if (/^components\/VendorDashboardTour/.test(relpath)) return 'Vendor Flow';
  if (/^components\/AutoSignModal/.test(relpath)) return 'Vendor Flow';
  if (/^components\/MyPendingStatus/.test(relpath)) return 'Vendor Flow';

  if (/^components\/AffiliateDashboardTour/.test(relpath)) return 'Affiliate Flow';
  if (/^components\/EarnInterest/.test(relpath)) return 'Affiliate Flow';
  if (/^components\/PayoutsTable/.test(relpath)) return 'Affiliate Flow';

  if (/^app\/layout\.tsx$/.test(relpath)) return 'Config';
  if (/^app\/sitemap\.ts$/.test(relpath)) return 'Config';
  if (/^next\.config/.test(relpath)) return 'Config';
  if (/^next-env/.test(relpath)) return 'Config';

  return 'Shared';
}

// Classify type
function classifyType(relpath) {
  if (/^app\/api\//.test(relpath)) return 'API';
  if (/layout\.(tsx|jsx)$/.test(relpath) && /^app\//.test(relpath)) return 'Layout';
  if (/page\.(tsx|jsx)$/.test(relpath) && /^app\//.test(relpath)) return 'Page';
  if (/^components\//.test(relpath)) return 'Component';
  if (/^lib\//.test(relpath)) return 'Utility';
  if (/^utils\//.test(relpath)) return 'Utility';
  if (/^cli\//.test(relpath)) return 'Utility';
  if (/^public\//.test(relpath)) return 'Utility';
  if (/^next\.config/.test(relpath)) return 'Config';
  if (/^next-env/.test(relpath)) return 'Config';
  return 'Utility';
}

// Extract metadata from content
function extractMeta(content) {
  const deps = [];
  const stateVars = [];
  const contexts = [];
  const props = [];
  const apiCalls = [];

  // Dependencies
  const depRegex = /from\s+['"](@\/|\.\.?\/)[^'"]+['"]/g;
  let m;
  while ((m = depRegex.exec(content)) !== null) {
    deps.push(m[0].replace(/from\s+['"]/, '').replace(/['"]/, ''));
  }

  // State
  const stateRegex = /const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g;
  while ((m = stateRegex.exec(content)) !== null) {
    stateVars.push(m[1]);
  }

  // Context
  const ctxRegex = /useContext\((\w+)\)/g;
  while ((m = ctxRegex.exec(content)) !== null) {
    contexts.push(m[1]);
  }

  // Props
  const propsRegex = /^(?:interface|type)\s+(\w*Props\w*)/gm;
  while ((m = propsRegex.exec(content)) !== null) {
    props.push(m[1]);
  }

  // API calls
  const apiRegex = /fetch\(['"`]([^'"`]+)['"`]/g;
  while ((m = apiRegex.exec(content)) !== null) {
    if (!apiCalls.includes(m[1])) apiCalls.push(m[1]);
  }

  return {
    deps: deps.length ? deps.join(', ') : 'none',
    state: stateVars.length ? stateVars.join(', ') : 'none',
    context: contexts.length ? contexts.join(', ') : 'none',
    props: props.length ? props.join(', ') : 'none',
    apiCalls: apiCalls.length ? apiCalls.join(', ') : 'none'
  };
}

// Add MARK annotations to content
function addMarks(content) {
  const lines = content.split('\n');
  const result = [];
  let addedImports = false;
  let addedTypes = false;
  let addedConstants = false;
  let addedState = false;
  let addedEffects = false;
  let addedHandlers = false;
  let addedApiCalls = false;
  let addedHelpers = false;
  let addedRender = false;
  let passedImports = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Imports
    if (!addedImports && (trimmed.startsWith('import ') || trimmed === "'use client';" || trimmed === '"use client";' || trimmed === "'use client'" || trimmed === '"use client"')) {
      result.push('// MARK: - Imports & Dependencies');
      addedImports = true;
    }

    // Types & Interfaces (after imports)
    if (!addedTypes && addedImports && passedImports) {
      if (/^(export\s+)?(interface|type)\s+\w+/.test(trimmed) || /^declare\s+/.test(trimmed)) {
        result.push('');
        result.push('// MARK: - Types & Interfaces');
        addedTypes = true;
      }
    }

    // Detect end of imports
    if (addedImports && !passedImports) {
      if (trimmed !== '' && !trimmed.startsWith('import ') && !trimmed.startsWith('from ') && !trimmed.startsWith("'use ") && !trimmed.startsWith('"use ') && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('{') && !trimmed.startsWith('}')) {
        passedImports = true;
      }
    }

    // Constants
    if (!addedConstants && passedImports) {
      if (/^const\s+(API_URL|BASE_URL|RLUSD|XRPL|CONFIG)\b/.test(trimmed)) {
        result.push('');
        result.push('// MARK: - Constants & Configuration');
        addedConstants = true;
      }
    }

    // State Management
    if (!addedState && /useState[<(]/.test(trimmed)) {
      result.push('');
      result.push('// MARK: - State Management');
      addedState = true;
    }

    // Hooks & Effects
    if (!addedEffects && addedState && /(useEffect|useMemo|useCallback)\s*\(/.test(trimmed)) {
      result.push('');
      result.push('// MARK: - Hooks & Effects');
      addedEffects = true;
    }

    // Event Handlers
    if (!addedHandlers && /^(const|async\s+function|function)\s+(handle[A-Z]|on[A-Z])/.test(trimmed)) {
      result.push('');
      result.push('// MARK: - Event Handlers');
      addedHandlers = true;
    }

    // API Calls / Data Fetching (standalone fetch functions)
    if (!addedApiCalls && passedImports && /^(const|async\s+function|function)\s+\w*(fetch|load|refresh|check|save|update|delete|remove|connect|register)\w*\s*[=(]/.test(trimmed)) {
      result.push('');
      result.push('// MARK: - API Calls & Data Fetching');
      addedApiCalls = true;
    }

    // Helper Functions
    if (!addedHelpers && passedImports && /^(const|function)\s+\w+\s*=?\s*(\(|async\s*\()/.test(trimmed) && !addedHandlers && !addedApiCalls) {
      // Only add if not already handled by other marks
      if (!/handle|on[A-Z]|fetch|load|refresh|useState|useEffect/.test(trimmed)) {
        // Skip
      }
    }

    // Main Render
    if (!addedRender && /^\s*return\s*\(/.test(line) && passedImports) {
      result.push('');
      result.push('// MARK: - Main Render');
      addedRender = true;
    }

    result.push(line);
  }

  // Exports mark at end
  result.push('');
  result.push('// MARK: - Exports');

  return result.join('\n');
}

// Main
const files = findFiles(BASE).sort();
const output = [];

// HEADER
output.push(`// ################################################################################`);
output.push(`// #                                                                              #`);
output.push(`// #     YESALLOFUS - MONOLITHIC SWIFT CONVERSION REFERENCE                       #`);
output.push(`// #     Generated from Next.js Web Project                                       #`);
output.push(`// #     Source: /Users/markflynn/Local Sites/yesallofus/                          #`);
output.push(`// #     Generated: ${new Date().toISOString()}                       #`);
output.push(`// #     Total Files: ${files.length}                                                         #`);
output.push(`// #                                                                              #`);
output.push(`// #     This file contains EVERY source file from the web project with           #`);
output.push(`// #     metadata headers and MARK annotations for Swift conversion.              #`);
output.push(`// #                                                                              #`);
output.push(`// ################################################################################`);
output.push('');
output.push('');

// TABLE OF CONTENTS
output.push('// ============================================================');
output.push('// TABLE OF CONTENTS');
output.push('// ============================================================');
output.push('//');

const flows = { 'Vendor Flow': [], 'Affiliate Flow': [], 'Shared': [], 'Config': [] };
for (const f of files) {
  const relpath = path.relative(BASE, f);
  const flow = classifyFlow(relpath);
  const ctype = classifyType(relpath);
  flows[flow] = flows[flow] || [];
  flows[flow].push({ relpath, ctype });
}

output.push('// ============================================================');
output.push('// VENDOR FLOW (POS / Dashboard / Payments / Inventory / Staff)');
output.push('// ============================================================');
for (const item of (flows['Vendor Flow'] || [])) {
  output.push(`//   [${item.ctype}] ${item.relpath}`);
}

output.push('//');
output.push('// ============================================================');
output.push('// AFFILIATE FLOW (Earn / Commission / Affiliate Dashboard)');
output.push('// ============================================================');
for (const item of (flows['Affiliate Flow'] || [])) {
  output.push(`//   [${item.ctype}] ${item.relpath}`);
}

output.push('//');
output.push('// ============================================================');
output.push('// SHARED (Components / Utilities / Layouts used by both flows)');
output.push('// ============================================================');
for (const item of (flows['Shared'] || [])) {
  output.push(`//   [${item.ctype}] ${item.relpath}`);
}

output.push('//');
output.push('// ============================================================');
output.push('// CONFIG (App configuration, environment, sitemap)');
output.push('// ============================================================');
for (const item of (flows['Config'] || [])) {
  output.push(`//   [${item.ctype}] ${item.relpath}`);
}

output.push('//');
output.push('// ============================================================');
output.push('// COMPONENT DEPENDENCY GRAPH');
output.push('// ============================================================');
output.push('//');
output.push('// Dashboard Page (Vendor Flow - main hub)');
output.push('//   -> LoginScreen');
output.push('//   -> DashboardHeader');
output.push('//   -> Sidebar');
output.push('//   -> StoreActivity');
output.push('//   -> WalletFunding');
output.push('//   -> TopUpRLUSD');
output.push('//   -> WithdrawRLUSD');
output.push('//   -> QRCodeModal');
output.push('//   -> Logo');
output.push('//   -> PendingCustomers');
output.push('//   -> EarnInterest');
output.push('//   -> MilestoneChecklist');
output.push('//   -> CelebrationToast');
output.push('//   -> InfoModal');
output.push('//   -> CollapsibleSection');
output.push('//   -> SignUpCustomerCard');
output.push('//   -> NebulaBackground');
output.push('//   -> VendorDashboardTour');
output.push('//   -> OnboardingSetup');
output.push('//   -> DeleteConfirmModal');
output.push('//');
output.push('// Take Payment Page (Vendor Flow)');
output.push('//   -> TakePaymentHeader');
output.push('//   -> PaymentOptions');
output.push('//   -> PaymentSuccess');
output.push('//   -> TipSelector');
output.push('//   -> SplitBillModal');
output.push('//   -> StaffSelector');
output.push('//   -> ProductsManager');
output.push('//   -> BarcodeScanner');
output.push('//   -> SoundPay / SoundPayButton');
output.push('//   -> NFCTapPay / NFCPayment');
output.push('//   -> InstantPay');
output.push('//   -> SendPaymentLink');
output.push('//   -> TakePaymentTour');
output.push('//');
output.push('// Affiliate Dashboard Page (Affiliate Flow)');
output.push('//   -> LoginScreen');
output.push('//   -> AffiliateDashboardTour');
output.push('//   -> PayoutsTable');
output.push('//   -> EarnInterest');
output.push('//');
output.push('// Earn Page (Affiliate Flow)');
output.push('//   -> LoginScreen');
output.push('//   -> EarnInterest');
output.push('//');
output.push('// ============================================================');
output.push('// API ENDPOINTS (from app/api/)');
output.push('// ============================================================');
output.push('//   POST /api/exchanges  -> app/api/exchanges/route.ts');
output.push('//');
output.push('// External API Base URL: https://api.dltpays.com/api/v1');
output.push('//   POST /payout');
output.push('//   POST /intent');
output.push('//   POST /payout/:id/approve');
output.push('//   POST /affiliate/register');
output.push('//   POST /affiliate/register-public');
output.push('//   GET  /affiliate/dashboard/:wallet');
output.push('//   POST /store/register');
output.push('//   GET  /store/stats');
output.push('//   POST /store/settings');
output.push('//   GET  /store/:store_id/affiliates');
output.push('//   GET  /store/:store_id/payouts');
output.push('//   POST /xaman/connect');
output.push('//   GET  /xaman/poll/:connectionId');
output.push('//   POST /xaman/login');
output.push('//   GET  /xaman/login/poll/:loginId');
output.push('//   GET  /wallet/status/:address');
output.push('//   POST /store/:store_id/logo');
output.push('//   POST /store/:store_id/milestone');
output.push('//   GET  /store/:store_id/affiliate-count');
output.push('//   GET  /store/:store_id/referred-vendors');
output.push('//   GET  /store/by-claim/:claim');
output.push('//   GET  /store/lookup-referral/:ref');
output.push('//   POST /store/save-wallet-public');
output.push('//');
output.push('// ============================================================');
output.push('// END OF TABLE OF CONTENTS');
output.push('// ============================================================');
output.push('');
output.push('');

// PROCESS EACH FILE
for (const filepath of files) {
  const relpath = path.relative(BASE, filepath);
  const flow = classifyFlow(relpath);
  const ctype = classifyType(relpath);

  let content;
  try {
    content = fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    content = `// ERROR: Could not read file: ${e.message}`;
  }

  const meta = extractMeta(content);
  const annotatedContent = addMarks(content);

  output.push('// ============================================================');
  output.push(`// FILE: ${relpath}`);
  output.push('// ============================================================');
  output.push(`// META: Component Type: ${ctype}`);
  output.push(`// META: Flow: ${flow}`);
  output.push(`// META: Dependencies: ${meta.deps}`);
  output.push(`// META: State: ${meta.state}`);
  output.push(`// META: Context: ${meta.context}`);
  output.push(`// META: Props: ${meta.props}`);
  output.push(`// META: API Calls: ${meta.apiCalls}`);
  output.push('// ============================================================');
  output.push('');
  output.push(annotatedContent);
  output.push('');
  output.push('');
  output.push('');
}

// Write output
fs.writeFileSync(OUT, output.join('\n'), 'utf8');

const stats = fs.statSync(OUT);
const lineCount = output.join('\n').split('\n').length;
console.log(`Generated: ${OUT}`);
console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
console.log(`Line count: ${lineCount}`);
console.log(`Files processed: ${files.length}`);
