// API Server for Money Panel - Handles APK upload and Telegram notifications
const express = require('express');
const multer = require('multer');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram Bot Configuration (set via environment variables)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Multer configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.apk') || file.mimetype === 'application/vnd.android.package-archive') {
      cb(null, true);
    } else {
      cb(null, true); // Allow for scanning
    }
  }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'luffy-panel.vercel.app')));

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Send message to Telegram
async function sendTelegramMessage(text, parseMode = 'HTML') {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping notification');
    return { success: false, error: 'Bot not configured' };
  }

  return new Promise((resolve) => {
    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: parseMode
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ success: result.ok, data: result });
        } catch (e) {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Telegram API Error:', error);
      resolve({ success: false, error: error.message });
    });

    req.write(data);
    req.end();
  });
}

// Send file to Telegram
async function sendTelegramFile(fileBuffer, fileName, caption) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { success: false, error: 'Bot not configured' };
  }

  // Only send if file is less than 50MB
  if (fileBuffer.length > 50 * 1024 * 1024) {
    return { success: false, error: 'File too large for Telegram' };
  }

  return new Promise((resolve) => {
    const boundary = '----MoneyPanel' + Date.now();
    const parts = [];

    // Chat ID
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${TELEGRAM_CHAT_ID}\r\n`));
    
    // Caption
    if (caption) {
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`));
    }
    
    // File
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`));
    parts.push(fileBuffer);
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const body = Buffer.concat(parts);

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ success: result.ok, data: result });
        } catch (e) {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Telegram File API Error:', error);
      resolve({ success: false, error: error.message });
    });

    req.write(body);
    req.end();
  });
}

// Extract strings from buffer (for APK scanning)
function extractStrings(buffer) {
  const strings = [];
  let current = '';
  
  for (let i = 0; i < buffer.length; i++) {
    const char = buffer[i];
    if (char >= 32 && char < 127) {
      current += String.fromCharCode(char);
    } else {
      if (current.length >= 10) {
        strings.push(current);
      }
      current = '';
    }
  }
  
  if (current.length >= 10) {
    strings.push(current);
  }
  
  return strings;
}

// Scan APK for Firebase credentials
async function scanApkForFirebase(buffer) {
  const strings = extractStrings(buffer);
  const results = {
    urls: [],
    keys: []
  };

  strings.forEach(str => {
    // Firebase URL patterns
    if (str.match(/https:\/\/[a-z0-9._-]+\.firebaseio\.com/i)) {
      results.urls.push(str);
    }
    if (str.match(/https:\/\/[a-z0-9._-]+\.firebasedatabase\.app/i)) {
      results.urls.push(str);
    }
    
    // API Key pattern
    if (str.match(/^AIza[A-Za-z0-9_-]{35}$/)) {
      results.keys.push(str);
    }
  });

  // Remove duplicates
  results.urls = [...new Set(results.urls)];
  results.keys = [...new Set(results.keys)];

  return {
    success: results.urls.length > 0 || results.keys.length > 0,
    url: results.urls[0] || null,
    key: results.keys[0] || null,
    allUrls: results.urls,
    allKeys: results.keys
  };
}

// API endpoint: Telegram notification for Firebase connection
app.post('/api/notify', async (req, res) => {
  try {
    const { text, parse_mode } = req.body;
    
    if (!text) {
      return res.json({ success: false, error: 'Text required' });
    }

    const result = await sendTelegramMessage(text, parse_mode || 'HTML');
    res.json(result);
  } catch (error) {
    console.error('Notify error:', error);
    res.json({ success: false, error: error.message });
  }
});

// API endpoint: APK Upload and Scan
app.post('/api/apk-scan', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, error: 'No file uploaded' });
    }

    console.log(`📦 APK Upload: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Scan APK for Firebase credentials
    const scanResult = await scanApkForFirebase(req.file.buffer);

    // Prepare Telegram message
    const fileName = req.file.originalname;
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let message = `🔥 <b>MONEY PANEL — APK Uploaded</b>\n\n`;
    message += `📁 <b>File:</b> <code>${fileName}</code>\n`;
    message += `📏 <b>Size:</b> ${fileSizeMB} MB\n`;
    message += `⏰ <b>Time:</b> ${timestamp}\n\n`;

    if (scanResult.success) {
      message += `✅ <b>Firebase Detected!</b>\n\n`;
      
      if (scanResult.url) {
        message += `🔗 <b>Firebase URL:</b>\n<code>${scanResult.url}</code>\n\n`;
      }
      
      if (scanResult.key) {
        message += `🔑 <b>API Key:</b>\n<code>${scanResult.key.substring(0, 20)}...</code>\n\n`;
      }

      if (scanResult.allUrls.length > 1) {
        message += `📊 <b>Total URLs Found:</b> ${scanResult.allUrls.length}\n`;
      }
      
      if (scanResult.allKeys.length > 1) {
        message += `🔐 <b>Total Keys Found:</b> ${scanResult.allKeys.length}\n`;
      }
    } else {
      message += `❌ <b>No Firebase credentials found</b>\n`;
    }

    message += `\n🤖 <i>Auto-scanned by Money Panel</i>`;

    // Send notification to Telegram
    const notifyResult = await sendTelegramMessage(message);
    
    // Send APK file if small enough
    if (req.file.size < 50 * 1024 * 1024) {
      const fileCaption = `📦 ${fileName} (${fileSizeMB}MB)`;
      await sendTelegramFile(req.file.buffer, fileName, fileCaption);
    }

    // Return scan results
    res.json({
      success: scanResult.success,
      url: scanResult.url,
      key: scanResult.key,
      allUrls: scanResult.allUrls,
      allKeys: scanResult.allKeys,
      telegram: notifyResult.success,
      fileName: fileName,
      fileSize: fileSizeMB
    });

  } catch (error) {
    console.error('APK scan error:', error);
    res.json({ success: false, error: error.message });
  }
});

// API endpoint: Telegram proxy (for Bot tab features)
// This prevents CORS issues when calling Telegram API from browser
app.get('/api/tg', async (req, res) => {
  try {
    const { method, token, offset, allowed_updates, timeout } = req.query;
    
    if (!method || !token) {
      return res.json({ ok: false, description: 'Method and token required' });
    }

    let telegramUrl = `https://api.telegram.org/bot${token}/${method}`;
    
    // Add query parameters for getUpdates
    if (method === 'getUpdates') {
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset);
      if (allowed_updates) params.append('allowed_updates', allowed_updates);
      if (timeout) params.append('timeout', timeout);
      if (params.toString()) telegramUrl += '?' + params.toString();
    }

    const response = await new Promise((resolve) => {
      https.get(telegramUrl, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ ok: false, description: 'Parse error' });
          }
        });
      }).on('error', (err) => {
        resolve({ ok: false, description: err.message });
      });
    });

    res.json(response);
  } catch (error) {
    res.json({ ok: false, description: error.message });
  }
});

app.post('/api/tg', async (req, res) => {
  try {
    const { method, token, chat_id, text, parse_mode } = req.body;
    
    if (!method || !token) {
      return res.json({ ok: false, description: 'Method and token required' });
    }

    const telegramUrl = `https://api.telegram.org/bot${token}/${method}`;
    
    const postData = JSON.stringify({
      chat_id,
      text,
      parse_mode: parse_mode || 'HTML'
    });

    const response = await new Promise((resolve) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      const apiReq = https.request(telegramUrl, options, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve({ ok: false, description: 'Parse error' });
          }
        });
      });

      apiReq.on('error', (err) => {
        resolve({ ok: false, description: err.message });
      });

      apiReq.write(postData);
      apiReq.end();
    });

    res.json(response);
  } catch (error) {
    res.json({ ok: false, description: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    telegram: TELEGRAM_BOT_TOKEN ? 'configured' : 'not configured'
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'luffy-panel.vercel.app', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`💰 MONEY PANEL running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    console.log(`✅ Telegram Bot: Configured`);
  } else {
    console.log(`⚠️  Telegram Bot: Not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID)`);
  }
});
