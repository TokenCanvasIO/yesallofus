/**
 * YesAllofUs Affiliate Tracking SDK v2.0
 * Tracking only - payouts triggered server-side via webhook
 * 
 * Usage:
 * <script src="https://yesallofus.com/js/track.js"></script>
 * 
 * Then read referral at checkout:
 * const ref = YesAllofUs.getReferralCode();
 * // Send 'ref' to your backend with the order
 */

(function() {
  'use strict';

  var COOKIE_NAME = 'yesallofus_ref';
  var COOKIE_DAYS = 30;

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    var domain = location.hostname.replace(/^www\./i, '');
    var domainStr = (domain === 'localhost') ? '' : '; domain=' + domain;
    document.cookie = name + '=' + value + expires + '; path=/' + domainStr + '; SameSite=Lax';
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function isValidRefCode(code) {
    return code && /^[A-Za-z0-9]{4,20}$/.test(code);
  }

  function trackReferral() {
    var params = new URLSearchParams(window.location.search);
    var ref = params.get('ref');
    
    if (ref && isValidRefCode(ref)) {
      setCookie(COOKIE_NAME, ref.toUpperCase(), COOKIE_DAYS);
      console.log('[YesAllofUs] Referral tracked:', ref.toUpperCase());
    }
  }

  function getReferralCode() {
    var code = getCookie(COOKIE_NAME);
    if (!code) {
      try {
        code = sessionStorage.getItem('_yesallofus_ref') || sessionStorage.getItem('yesallofus_ref');
      } catch (e) {}
    }
    return isValidRefCode(code) ? code : null;
  }

  trackReferral();

  window.YesAllofUs = {
    getReferralCode: getReferralCode,
    version: '2.0.0'
  };

  console.log('[YesAllofUs] Tracking SDK v2.0 loaded');

})();