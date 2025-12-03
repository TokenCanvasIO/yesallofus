/**
 * YesAllofUs Affiliate Tracking SDK v1.2
 * 
 * Usage (Simple - Xaman manual mode only):
 * <script src="https://yesallofus.com/js/track.js" data-store="store_xxx"></script>
 * YesAllofUs.purchase({ order_id: '123', amount: 9.99 });
 * 
 * Usage (Secure - with intent token, supports auto-sign):
 * // Backend generates intent token first
 * YesAllofUs.purchase({ intent_token: 'eyJ...' });
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
    // Bind to current domain
    var domain = location.hostname.replace(/^www\./i, '');
    document.cookie = name + '=' + value + expires + '; path=/; domain=' + domain + '; SameSite=Lax; Secure';
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

  // Decode JWT payload (client-side check only - real validation on server)
  function decodeJwtPayload(token) {
    try {
      var parts = token.split('.');
      if (parts.length !== 3) return null;
      var payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (e) {
      return null;
    }
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

  // Get current referral code (check cookie first, then sessionStorage)
  function getReferralCode() {
    var code = getCookie(COOKIE_NAME);
    if (!code) {
      // Fallback: check sessionStorage (some sites store it there)
      try {
        code = sessionStorage.getItem('_yesallofus_ref') || sessionStorage.getItem('yesallofus_ref');
      } catch (e) {}
    }
    return isValidRefCode(code) ? code : null;
  }

  // Trigger payout after purchase
  function purchase(options) {
    options = options || {};
    
    // =================================================================
    // MODE 1: Intent Token (Secure - supports auto-sign)
    // =================================================================
    if (options.intent_token) {
      var payload = decodeJwtPayload(options.intent_token);
      
      if (!payload) {
        console.error('[YesAllofUs] Invalid intent token format');
        return Promise.reject(new Error('Invalid intent token'));
      }
      
      // Check expiry client-side (server will verify properly)
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.error('[YesAllofUs] Intent token expired');
        return Promise.reject(new Error('Intent token expired'));
      }
      
      var refCode = getReferralCode();
      if (!refCode) {
        console.log('[YesAllofUs] No referral code - skipping payout');
        return Promise.resolve({ success: true, message: 'No referral' });
      }
      
      // Duplicate check using order_id from token
      var orderKey = payload.store_id + ':' + payload.order_id;
      if (processedOrders[orderKey]) {
        console.warn('[YesAllofUs] Order already submitted:', payload.order_id);
        return Promise.resolve({ success: true, message: 'Already submitted' });
      }
      
      processedOrders[orderKey] = true;
      
      console.log('[YesAllofUs] Triggering secure payout:', {
        store: payload.store_id,
        order: payload.order_id,
        amount: payload.amount,
        ref: refCode,
        mode: 'intent_token'
      });
      
      return fetch(API_BASE + '/payout/public', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-YesAllofUs-Origin': window.location.hostname
        },
        body: JSON.stringify({
          intent_token: options.intent_token,
          referral_code: refCode
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          console.log('[YesAllofUs] Payout triggered:', data);
        } else {
          console.warn('[YesAllofUs] Payout failed:', data.error);
          delete processedOrders[orderKey];
        }
        return data;
      })
      .catch(function(err) {
        console.error('[YesAllofUs] Payout error:', err);
        delete processedOrders[orderKey];
        throw err;
      });
    }
    
    // =================================================================
    // MODE 2: Direct (Xaman manual mode only)
    // =================================================================
    if (!options.order_id || !options.amount) {
      console.error('[YesAllofUs] purchase() requires intent_token OR (order_id and amount)');
      return Promise.reject(new Error('Missing intent_token or order_id/amount'));
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
      ref: refCode,
      mode: 'direct'
    });

    return fetch(API_BASE + '/payout/public', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-YesAllofUs-Origin': window.location.hostname
      },
      body: JSON.stringify({
        store_id: storeId,
        order_id: String(options.order_id),
        order_total: parseFloat(options.amount),
        referral_code: refCode,
        currency: options.currency || 'USD',
        timestamp: now
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
    version: '1.2.0'
  };

  console.log('[YesAllofUs] SDK v1.2 loaded for store:', storeId);

})();