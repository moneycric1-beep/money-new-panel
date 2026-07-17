const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram config from Railway variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'application/octet-stream', limit: '200mb' }));
app.use(express.static(path.join(__dirname, 'luffy-panel.vercel.app')));

// Simple Telegram send function
function sendToTelegram(text) {
  return new Promise((resolve) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return resolve({ success: false, error: 'Bot not configured' });
    }

    const data = JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ success: result.ok, data: result });
        } catch (e) {
          resolve({ success: false, error: 'Parse error' });
        }
      });
    });

    req.on('error', (error) => resolve({ success: false, error: error.message }));
    req.write(data);
    req.end();
  });
}

// Telegram bot proxy endpoints (for Bot tab)
app.get('/api/tg', async (req, res) => {
  try {
    const { method, token, offset, allowed_updates, timeout } = req.query;
    if (!method || !token) return res.json({ ok: false, description: 'Method and token required' });

    let telegramUrl = `https://api.telegram.org/bot${token}/${method}`;
    if (method === 'getUpdates') {
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset);
      if (allowed_updates) params.append('allowed_updates', allowed_updates);
      if (timeout) params.append('timeout', timeout);
      if (params.toString()) telegramUrl += '?' + params.toString();
    }

    https.get(telegramUrl, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try { res.json(JSON.parse(data)); }
        catch (e) { res.json({ ok: false, description: 'Parse error' }); }
      });
    }).on('error', (err) => res.json({ ok: false, description: err.message }));
  } catch (error) {
    res.json({ ok: false, description: error.message });
  }
});

app.post('/api/tg', async (req, res) => {
  try {
    const { method, token, chat_id, text, parse_mode } = req.body;
    if (!method || !token) return res.json({ ok: false, description: 'Method and token required' });

    const postData = JSON.stringify({ chat_id, text, parse_mode: parse_mode || 'HTML' });
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': postData.length }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try { res.json(JSON.parse(data)); }
        catch (e) { res.json({ ok: false, description: 'Parse error' }); }
      });
    });

    apiReq.on('error', (err) => res.json({ ok: false, description: err.message }));
    apiReq.write(postData);
    apiReq.end();
  } catch (error) {
    res.json({ ok: false, description: error.message });
  }
});

// Firebase connection notification
app.post('/api/notify', async (req, res) => {
  const { text, parse_mode } = req.body;
  if (!text) return res.json({ success: false, error: 'Text required' });
  
  const result = await sendToTelegram(text);
  res.json(result);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    telegram: TELEGRAM_BOT_TOKEN ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'luffy-panel.vercel.app', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`💰 MONEY PANEL running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    console.log(`✅ Telegram Bot: Configured (Chat: ${TELEGRAM_CHAT_ID})`);
  } else {
    console.log(`⚠️  Telegram Bot: Not configured`);
  }
});
