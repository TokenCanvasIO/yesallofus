/**
 * YesAllofUs Affiliate Tracking SDK v1.1
 * 
 * Usage:
 * <script src="https://yesallofus.com/js/track.js" data-store="store_xxx"></script>
 * 
 * Then on purchase:
 * YesAllofUs.purchase({ order_id: '123', amount: 9.99 });
 */

(function() {
  'use strict';

  var API_BASE = 'https://api.dltpays.com/api/v1';
  var COOKIE_NAME = 'yesallofus_ref';
  var COOKIE_DAYS = 30;

  // Security: Track processed orders to prevent duplicate calls
  var processedOrders = {};
  var lastPurchaseTime = 0;
  var MIN_PURCHASE_INTERVAL = 5000; // 5 seconds between purchases

  // Get store ID from script tag
  var scripts = document.getElementsByTagName('script');
  var currentScript = scripts[scripts.length - 1];
  var storeId = currentScript.getAttribute('data-store');

  if (!storeId) {
    console.warn('[YesAllofUs] Missing data-store attribute');
  }

  // Cookie helpers
  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + value + expires + '; path=/; SameSite=Lax; Secure';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  // Security: Validate referral code format
  function isValidRefCode(code) {
    return code && /^[A-Za-z0-9]{4,20}$/.test(code);
  }

  // Security: Validate order ID format
  function isValidOrderId(id) {
    return id && String(id).length >= 1 && String(id).length <= 100;
  }

  // Security: Validate amount
  function isValidAmount(amount) {
    var num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num < 100000;
  }

  // Auto-track ?ref= parameter on page load
  function trackReferral() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    
    if (ref && isValidRefCode(ref)) {
      setCookie(COOKIE_NAME, ref.toUpperCase(), COOKIE_DAYS);
      console.log('[YesAllofUs] Referral tracked:', ref);
    }
  }

  // Get current referral code
  function getReferralCode() {
    var code = getCookie(COOKIE_NAME);
    return isValidRefCode(code) ? code : null;
  }

  // Trigger payout after purchase
  function purchase(options) {
    // Validate inputs
    if (!options || !options.order_id || !options.amount) {
      console.error('[YesAllofUs] purchase() requires order_id and amount');
      return Promise.reject(new Error('Missing order_id or amount'));
    }

    if (!isValidOrderId(options.order_id)) {
      console.error('[YesAllofUs] Invalid order_id');
      return Promise.reject(new Error('Invalid order_id'));
    }

    if (!isValidAmount(options.amount)) {
      console.error('[YesAllofUs] Invalid amount');
      return Promise.reject(new Error('Invalid amount'));
    }

    // Security: Prevent duplicate order submissions
    var orderKey = storeId + ':' + options.order_id;
    if (processedOrders[orderKey]) {
      console.warn('[YesAllofUs] Order already submitted:', options.order_id);
      return Promise.resolve({ success: true, message: 'Already submitted' });
    }

    // Security: Rate limit purchases
    var now = Date.now();
    if (now - lastPurchaseTime < MIN_PURCHASE_INTERVAL) {
      console.warn('[YesAllofUs] Rate limited - too fast');
      return Promise.reject(new Error('Please wait before submitting another order'));
    }

    var refCode = getReferralCode();
    
    if (!refCode) {
      console.log('[YesAllofUs] No referral code - skipping payout');
      return Promise.resolve({ success: true, message: 'No referral' });
    }

    if (!storeId) {
      console.error('[YesAllofUs] No store ID configured');
      return Promise.reject(new Error('No store ID'));
    }

    // Mark order as processing
    processedOrders[orderKey] = true;
    lastPurchaseTime = now;

    console.log('[YesAllofUs] Triggering payout:', {
      store: storeId,
      order: options.order_id,
      amount: options.amount,
      ref: refCode
    });

    return fetch(API_BASE + '/payout/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        order_id: String(options.order_id),
        order_total: parseFloat(options.amount),
        referral_code: refCode,
        currency: options.currency || 'USD',
        timestamp: now,
        origin: window.location.hostname
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.success) {
        console.log('[YesAllofUs] Payout triggered:', data);
      } else {
        console.warn('[YesAllofUs] Payout failed:', data.error);
        // Allow retry on failure
        delete processedOrders[orderKey];
      }
      return data;
    })
    .catch(function(err) {
      console.error('[YesAllofUs] Payout error:', err);
      // Allow retry on error
      delete processedOrders[orderKey];
      throw err;
    });
  }

  // Initialize on load
  trackReferral();

  // Expose global API
  window.YesAllofUs = {
    purchase: purchase,
    getReferralCode: getReferralCode,
    storeId: storeId,
    version: '1.1.0'
  };

  console.log('[YesAllofUs] SDK loaded for store:', storeId);

})();