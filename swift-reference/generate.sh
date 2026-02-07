#!/bin/bash
# Generate monolithic Swift reference file from Next.js project
# This script reads every source file and annotates it with metadata

BASE="/Users/markflynn/Local Sites/yesallofus"
OUT="$BASE/swift-reference/monolithic_swift_ready.txt"

# Classify file into flow
classify_flow() {
  local relpath="$1"
  local content="$2"

  case "$relpath" in
    app/\(main\)/dashboard/*) echo "Vendor Flow" ;;
    app/\(main\)/faq/dashboard/*) echo "Vendor Flow" ;;
    app/\(noheader\)/take-payment/*) echo "Vendor Flow" ;;
    app/\(noheader\)/customer-signup/*) echo "Vendor Flow" ;;
    app/\(noheader\)/signup-customer/*) echo "Vendor Flow" ;;
    app/\(noheader\)/receipts/*) echo "Vendor Flow" ;;
    app/\(noheader\)/display/*) echo "Vendor Flow" ;;
    app/staff/*) echo "Vendor Flow" ;;
    app/staffpos/*) echo "Vendor Flow" ;;
    app/analytics/*) echo "Vendor Flow" ;;
    app/pos-*) echo "Vendor Flow" ;;
    app/pay/*) echo "Vendor Flow" ;;
    app/checkout/*) echo "Vendor Flow" ;;
    app/sound-pay/*) echo "Shared" ;;
    app/affiliate-dashboard/*) echo "Affiliate Flow" ;;
    app/earn/*) echo "Affiliate Flow" ;;
    app/\(main\)/commission-dashboard/*) echo "Affiliate Flow" ;;
    app/\(main\)/discover-vendors/*) echo "Affiliate Flow" ;;
    app/\(main\)/affiliate-terms/*) echo "Affiliate Flow" ;;
    app/\(noheader\)/page.tsx) echo "Shared" ;;
    app/\(main\)/layout.tsx) echo "Shared" ;;
    app/\(noheader\)/layout.tsx) echo "Shared" ;;
    app/layout.tsx) echo "Config" ;;
    app/sitemap.ts) echo "Config" ;;
    app/\(main\)/about/*) echo "Shared" ;;
    app/\(main\)/announcements/*) echo "Shared" ;;
    app/\(main\)/blog/*) echo "Shared" ;;
    app/\(main\)/connect/*) echo "Shared" ;;
    app/\(main\)/cookies/*) echo "Shared" ;;
    app/\(main\)/docs/*) echo "Shared" ;;
    app/\(main\)/faq/page.tsx) echo "Shared" ;;
    app/\(main\)/guides/*) echo "Shared" ;;
    app/\(main\)/home/*) echo "Shared" ;;
    app/\(main\)/press/*) echo "Shared" ;;
    app/\(main\)/privacy/*) echo "Shared" ;;
    app/\(main\)/resources/*) echo "Shared" ;;
    app/\(main\)/terms/*) echo "Shared" ;;
    app/\(main\)/trustline/*) echo "Shared" ;;
    app/\(main\)/wallet-guide/*) echo "Shared" ;;
    app/\(main\)/acceptable-use/*) echo "Shared" ;;
    app/cover/*) echo "Shared" ;;
    app/install/*) echo "Shared" ;;
    app/problem-opportunity/*) echo "Shared" ;;
    app/solution/*) echo "Shared" ;;
    app/team/*) echo "Shared" ;;
    app/api/*) echo "Shared" ;;
    components/LoginScreen*) echo "Shared" ;;
    components/SoundPay*) echo "Shared" ;;
    components/SoundBroadcast*) echo "Shared" ;;
    components/SoundListen*) echo "Shared" ;;
    components/SoundPayment*) echo "Shared" ;;
    components/Footer*) echo "Shared" ;;
    components/Header*) echo "Shared" ;;
    components/Logo*) echo "Shared" ;;
    components/InstallAppButton*) echo "Shared" ;;
    components/BackgroundVideo*) echo "Shared" ;;
    components/NebulaBackground*) echo "Shared" ;;
    components/TourProvider*) echo "Shared" ;;
    components/TourCard*) echo "Shared" ;;
    components/CollapsibleCard*) echo "Shared" ;;
    components/CollapsibleSection*) echo "Shared" ;;
    components/InfoModal*) echo "Shared" ;;
    components/CelebrationToast*) echo "Shared" ;;
    components/SuccessMessage*) echo "Shared" ;;
    components/MoveCloserAnimation*) echo "Shared" ;;
    components/LiveConversionWidget*) echo "Shared" ;;
    components/VolumeReminder*) echo "Shared" ;;
    components/QRCodeModal*) echo "Shared" ;;
    # Vendor-specific components
    components/DashboardHeader*) echo "Vendor Flow" ;;
    components/Sidebar*) echo "Vendor Flow" ;;
    components/StoreActivity*) echo "Vendor Flow" ;;
    components/WalletFunding*) echo "Vendor Flow" ;;
    components/WalletSettings*) echo "Vendor Flow" ;;
    components/TopUpRLUSD*) echo "Vendor Flow" ;;
    components/WithdrawRLUSD*) echo "Vendor Flow" ;;
    components/PendingPayments*) echo "Vendor Flow" ;;
    components/PendingCustomers*) echo "Vendor Flow" ;;
    components/PaymentOptions*) echo "Vendor Flow" ;;
    components/PaymentSuccess*) echo "Vendor Flow" ;;
    components/ProductsManager*) echo "Vendor Flow" ;;
    components/BarcodeScanner*) echo "Vendor Flow" ;;
    components/CSVImportModal*) echo "Vendor Flow" ;;
    components/DeleteConfirmModal*) echo "Vendor Flow" ;;
    components/EmailReceiptModal*) echo "Vendor Flow" ;;
    components/ReceiptActions*) echo "Vendor Flow" ;;
    components/InventoryHistoryModal*) echo "Vendor Flow" ;;
    components/LinkNFCCard*) echo "Vendor Flow" ;;
    components/NFCPayment*) echo "Vendor Flow" ;;
    components/NFCTapPay*) echo "Vendor Flow" ;;
    components/TapToPaySettings*) echo "Vendor Flow" ;;
    components/SplitBillModal*) echo "Vendor Flow" ;;
    components/StaffSelector*) echo "Vendor Flow" ;;
    components/SendPaymentLink*) echo "Vendor Flow" ;;
    components/TakePaymentHeader*) echo "Vendor Flow" ;;
    components/TakePaymentTour*) echo "Vendor Flow" ;;
    components/TipSelector*) echo "Vendor Flow" ;;
    components/InstantPay*) echo "Vendor Flow" ;;
    components/SignUpCustomerCard*) echo "Vendor Flow" ;;
    components/OnboardingSetup*) echo "Vendor Flow" ;;
    components/MilestoneChecklist*) echo "Vendor Flow" ;;
    components/VendorDashboardTour*) echo "Vendor Flow" ;;
    components/AutoSignModal*) echo "Vendor Flow" ;;
    components/MyPendingStatus*) echo "Vendor Flow" ;;
    # Affiliate-specific components
    components/AffiliateDashboardTour*) echo "Affiliate Flow" ;;
    components/EarnInterest*) echo "Affiliate Flow" ;;
    components/PayoutsTable*) echo "Affiliate Flow" ;;
    # Lib files
    lib/*) echo "Shared" ;;
    # Utils
    utils/*) echo "Shared" ;;
    # Config files
    next.config*) echo "Config" ;;
    next-env*) echo "Config" ;;
    # CLI
    cli/*) echo "Shared" ;;
    # Public
    public/*) echo "Shared" ;;
    *) echo "Shared" ;;
  esac
}

# Determine component type
classify_type() {
  local relpath="$1"

  case "$relpath" in
    app/api/*) echo "API" ;;
    app/*/layout.tsx) echo "Layout" ;;
    app/layout.tsx) echo "Layout" ;;
    app/sitemap.ts) echo "Utility" ;;
    app/*/page.tsx) echo "Page" ;;
    app/*/page.jsx) echo "Page" ;;
    components/*) echo "Component" ;;
    lib/*) echo "Utility" ;;
    utils/*) echo "Utility" ;;
    cli/*) echo "Utility" ;;
    public/*) echo "Utility" ;;
    next.config*) echo "Config" ;;
    next-env*) echo "Config" ;;
    *) echo "Utility" ;;
  esac
}

# Extract imports that reference local project files
extract_dependencies() {
  local filepath="$1"
  grep -oE "from ['\"](@/|\.\.?/)[^'\"]+['\"]" "$filepath" 2>/dev/null | sed "s/from ['\"]//;s/['\"]//" | tr '\n' ', ' | sed 's/,$//'
}

# Extract useState variables
extract_state() {
  local filepath="$1"
  grep -oE "useState(<[^>]*>)?\([^)]*\)" "$filepath" 2>/dev/null | head -20 | tr '\n' ', ' | sed 's/,$//'
}

# Extract context usage
extract_context() {
  local filepath="$1"
  grep -oE "useContext\([^)]+\)" "$filepath" 2>/dev/null | tr '\n' ', ' | sed 's/,$//'
}

# Extract props interface
extract_props() {
  local filepath="$1"
  grep -E "^(interface|type)\s+\w*Props" "$filepath" 2>/dev/null | head -5 | tr '\n' ', ' | sed 's/,$//'
}

# Extract API calls
extract_api_calls() {
  local filepath="$1"
  grep -oE "fetch\(['\"][^'\"]+['\"]" "$filepath" 2>/dev/null | sed "s/fetch(['\"]//;s/['\"]//" | sort -u | tr '\n' ', ' | sed 's/,$//'
}

# Start building the output
{
  # ================================================================
  # HEADER
  # ================================================================
  cat << 'HEADER'
// ################################################################################
// #                                                                              #
// #     YESALLOFUS - MONOLITHIC SWIFT CONVERSION REFERENCE                       #
// #     Generated from Next.js Web Project                                       #
// #     Source: /Users/markflynn/Local Sites/yesallofus/                          #
// #                                                                              #
// #     This file contains EVERY source file from the web project with           #
// #     metadata headers and MARK annotations for Swift conversion.              #
// #                                                                              #
// ################################################################################

HEADER

  # ================================================================
  # TABLE OF CONTENTS
  # ================================================================
  echo "// ============================================================"
  echo "// TABLE OF CONTENTS"
  echo "// ============================================================"
  echo "//"
  echo "// ============================================================"
  echo "// VENDOR FLOW (POS / Dashboard / Payments / Inventory / Staff)"
  echo "// ============================================================"

  find "$BASE" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" \
    -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/swift-reference/*" | sort | while read f; do
    relpath="${f#$BASE/}"
    flow=$(classify_flow "$relpath" "")
    ctype=$(classify_type "$relpath")
    if [ "$flow" = "Vendor Flow" ]; then
      echo "//   [$ctype] $relpath"
    fi
  done

  echo "//"
  echo "// ============================================================"
  echo "// AFFILIATE FLOW (Earn / Commission / Affiliate Dashboard)"
  echo "// ============================================================"

  find "$BASE" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" \
    -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/swift-reference/*" | sort | while read f; do
    relpath="${f#$BASE/}"
    flow=$(classify_flow "$relpath" "")
    ctype=$(classify_type "$relpath")
    if [ "$flow" = "Affiliate Flow" ]; then
      echo "//   [$ctype] $relpath"
    fi
  done

  echo "//"
  echo "// ============================================================"
  echo "// SHARED (Components / Utilities / Layouts used by both flows)"
  echo "// ============================================================"

  find "$BASE" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" \
    -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/swift-reference/*" | sort | while read f; do
    relpath="${f#$BASE/}"
    flow=$(classify_flow "$relpath" "")
    ctype=$(classify_type "$relpath")
    if [ "$flow" = "Shared" ]; then
      echo "//   [$ctype] $relpath"
    fi
  done

  echo "//"
  echo "// ============================================================"
  echo "// CONFIG (App configuration, environment, sitemap)"
  echo "// ============================================================"

  find "$BASE" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" \
    -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/swift-reference/*" | sort | while read f; do
    relpath="${f#$BASE/}"
    flow=$(classify_flow "$relpath" "")
    ctype=$(classify_type "$relpath")
    if [ "$flow" = "Config" ]; then
      echo "//   [$ctype] $relpath"
    fi
  done

  echo "//"
  echo "// ============================================================"
  echo "// COMPONENT DEPENDENCY GRAPH"
  echo "// ============================================================"
  echo "//"
  echo "// Dashboard Page (Vendor Flow - main hub)"
  echo "//   -> LoginScreen"
  echo "//   -> DashboardHeader"
  echo "//   -> Sidebar"
  echo "//   -> StoreActivity"
  echo "//   -> WalletFunding"
  echo "//   -> TopUpRLUSD"
  echo "//   -> WithdrawRLUSD"
  echo "//   -> QRCodeModal"
  echo "//   -> Logo"
  echo "//   -> PendingCustomers"
  echo "//   -> EarnInterest"
  echo "//   -> MilestoneChecklist"
  echo "//   -> CelebrationToast"
  echo "//   -> InfoModal"
  echo "//   -> CollapsibleSection"
  echo "//   -> SignUpCustomerCard"
  echo "//   -> NebulaBackground"
  echo "//   -> VendorDashboardTour"
  echo "//   -> OnboardingSetup"
  echo "//   -> DeleteConfirmModal"
  echo "//"
  echo "// Take Payment Page (Vendor Flow)"
  echo "//   -> TakePaymentHeader"
  echo "//   -> PaymentOptions"
  echo "//   -> PaymentSuccess"
  echo "//   -> TipSelector"
  echo "//   -> SplitBillModal"
  echo "//   -> StaffSelector"
  echo "//   -> ProductsManager"
  echo "//   -> BarcodeScanner"
  echo "//   -> SoundPay / SoundPayButton"
  echo "//   -> NFCTapPay / NFCPayment"
  echo "//   -> InstantPay"
  echo "//   -> SendPaymentLink"
  echo "//   -> TakePaymentTour"
  echo "//"
  echo "// Affiliate Dashboard Page (Affiliate Flow)"
  echo "//   -> LoginScreen"
  echo "//   -> AffiliateDashboardTour"
  echo "//   -> PayoutsTable"
  echo "//   -> EarnInterest"
  echo "//"
  echo "// Earn Page (Affiliate Flow)"
  echo "//   -> LoginScreen"
  echo "//   -> EarnInterest"
  echo "//"
  echo "// ============================================================"
  echo "// API ENDPOINTS (from app/api/)"
  echo "// ============================================================"
  echo "//   POST /api/exchanges  -> app/api/exchanges/route.ts"
  echo "//"
  echo "// External API Base URL: https://api.dltpays.com/api/v1"
  echo "//   POST /payout"
  echo "//   POST /intent"
  echo "//   POST /payout/:id/approve"
  echo "//   POST /affiliate/register"
  echo "//   POST /affiliate/register-public"
  echo "//   GET  /affiliate/dashboard/:wallet"
  echo "//   POST /store/register"
  echo "//   GET  /store/stats"
  echo "//   POST /store/settings"
  echo "//   GET  /store/:store_id/affiliates"
  echo "//   GET  /store/:store_id/payouts"
  echo "//   POST /xaman/connect"
  echo "//   GET  /xaman/poll/:connectionId"
  echo "//   POST /xaman/login"
  echo "//   GET  /xaman/login/poll/:loginId"
  echo "//   GET  /wallet/status/:address"
  echo "//   POST /store/:store_id/logo"
  echo "//   POST /store/:store_id/milestone"
  echo "//   GET  /store/:store_id/affiliate-count"
  echo "//   GET  /store/:store_id/referred-vendors"
  echo "//   GET  /store/by-claim/:claim"
  echo "//   GET  /store/lookup-referral/:ref"
  echo "//   POST /store/save-wallet-public"
  echo "//"
  echo "// ============================================================"
  echo "// END OF TABLE OF CONTENTS"
  echo "// ============================================================"
  echo ""
  echo ""

  # ================================================================
  # PROCESS EACH FILE
  # ================================================================

  find "$BASE" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.next/*" -not -path "*/dist/*" \
    -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/swift-reference/*" | sort | while read filepath; do

    relpath="${filepath#$BASE/}"
    flow=$(classify_flow "$relpath" "")
    ctype=$(classify_type "$relpath")
    deps=$(extract_dependencies "$filepath")
    state=$(extract_state "$filepath")
    ctx=$(extract_context "$filepath")
    props=$(extract_props "$filepath")
    apis=$(extract_api_calls "$filepath")

    # Write metadata header
    echo "// ============================================================"
    echo "// FILE: $relpath"
    echo "// ============================================================"
    echo "// META: Component Type: $ctype"
    echo "// META: Flow: $flow"
    echo "// META: Dependencies: ${deps:-none}"
    echo "// META: State: ${state:-none}"
    echo "// META: Context: ${ctx:-none}"
    echo "// META: Props: ${props:-none}"
    echo "// META: API Calls: ${apis:-none}"
    echo "// ============================================================"
    echo ""

    # Read the file content and add MARK sections
    content=$(cat "$filepath")

    # We'll add MARK comments by detecting code patterns
    # First, output the content but with MARK annotations inserted

    in_imports=0
    in_types=0
    in_constants=0
    passed_imports=0
    found_state=0
    found_effect=0
    found_handler=0
    found_render=0
    found_export_bottom=0
    line_num=0
    marks_added=""

    while IFS= read -r line || [ -n "$line" ]; do
      line_num=$((line_num + 1))

      # Detect and add MARK sections

      # MARK: - Imports & Dependencies (at first import or 'use client')
      if [ $in_imports -eq 0 ]; then
        if echo "$line" | grep -qE "^(import |'use client'|\"use client\"|from |require\()"; then
          echo "// MARK: - Imports & Dependencies"
          in_imports=1
        fi
      fi

      # MARK: - Types & Interfaces
      if [ $in_types -eq 0 ] && [ $passed_imports -eq 0 ]; then
        if echo "$line" | grep -qE "^(interface |type |declare )"; then
          echo ""
          echo "// MARK: - Types & Interfaces"
          in_types=1
          passed_imports=1
        fi
      fi

      # Detect end of imports
      if [ $in_imports -eq 1 ] && [ $passed_imports -eq 0 ]; then
        if ! echo "$line" | grep -qE "^(import |from |'use |\"use |$|//)"; then
          if ! echo "$line" | grep -qE "^\s*$"; then
            passed_imports=1
          fi
        fi
      fi

      # MARK: - Constants & Configuration
      if echo "$line" | grep -qE "^const (API_URL|BASE_URL|CONFIG)" && ! echo "$marks_added" | grep -q "constants"; then
        echo ""
        echo "// MARK: - Constants & Configuration"
        marks_added="${marks_added}constants,"
      fi

      # MARK: - State Management
      if echo "$line" | grep -qE "useState|useReducer" && [ $found_state -eq 0 ]; then
        echo ""
        echo "// MARK: - State Management"
        found_state=1
      fi

      # MARK: - Hooks & Effects
      if echo "$line" | grep -qE "useEffect|useMemo|useCallback|useRef" && [ $found_effect -eq 0 ] && [ $found_state -eq 1 ]; then
        echo ""
        echo "// MARK: - Hooks & Effects"
        found_effect=1
      fi

      # MARK: - Event Handlers
      if echo "$line" | grep -qE "(const|function|async function)\s+(handle|on[A-Z])" && [ $found_handler -eq 0 ]; then
        echo ""
        echo "// MARK: - Event Handlers"
        found_handler=1
      fi

      # MARK: - Main Render (return statement in component)
      if echo "$line" | grep -qE "^\s*return \(" && [ $found_render -eq 0 ]; then
        echo ""
        echo "// MARK: - Main Render"
        found_render=1
      fi

      # Output the line
      echo "$line"

    done <<< "$content"

    echo ""
    echo "// MARK: - Exports"
    echo ""
    echo ""
    echo ""

  done

} > "$OUT"

echo "Generated: $OUT"
echo "File size: $(du -h "$OUT" | cut -f1)"
echo "Line count: $(wc -l < "$OUT")"
