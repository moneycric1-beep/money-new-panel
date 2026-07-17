# 🚀 MONEY PANEL - Railway Deployment

## ✅ Features Working
- SMS Forwarding (Device → Telegram)
- Telegram to SMS (Bot tab)
- APK Scanning (Browser-side)
- Firebase connection notifications
- Balance display
- All Bot features

## Deploy (2 Minutes)

### 1. Push to GitHub
```bash
cd "money new panel"
git init
git add .
git commit -m "Money Panel"
git push origin main
```

### 2. Deploy on Railway
- Go to railway.app
- New Project → Deploy from GitHub
- Select your repo
- Done!

### 3. Add Variables (Optional for Telegram)
Railway Dashboard → Variables:
```
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 4. Test
- Open your Railway URL
- Connect Firebase
- Test Bot tab features
- SMS forwarding works automatically

## Get Telegram Credentials

**Bot Token:**  
Telegram → @BotFather → /newbot

**Chat ID:**  
Telegram → @userinfobot

## Done! 🎉

Your Money Panel is live with all features working.
