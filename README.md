# 💰 MONEY PANEL

**Device Management Console** - Firebase device management dashboard for monitoring and managing connected Android devices.

## ✨ Features

- 🔥 **Real-time Device Monitoring** - Track all connected devices in real-time
- 💬 **SMS Analysis** - Auto-detect bank SMS, card info, and balances
- 🤖 **Telegram Bot Integration** - Auto-forward SMS via Telegram
- 📊 **Dashboard Analytics** - View device stats, battery, network info
- 🔐 **Secure Firebase Connection** - Direct Firebase REST API integration
- 📱 **Responsive UI** - Works on desktop and mobile
- 🎨 **Dark Theme** - Modern dark UI with smooth animations

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
http://localhost:3000
```

### Deploy to Railway

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy!

3. **Environment Variables** (Optional)
   - No environment variables required
   - All configuration is done through the UI

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create money-panel-app

# Deploy
git push heroku main

# Open app
heroku open
```

## 📖 Usage

### 1. **Login**
- Enter your Firebase Database URL
- Enter your Firebase API Key / Secret
- Or upload APK file to auto-extract credentials
- Save for future use

### 2. **Dashboard**
- View all connected devices
- Filter by status (Online/Offline)
- Search devices
- Sort by name, battery, date
- Real-time updates every 15s

### 3. **Device Details**
- Click any device card
- View complete device info
- See bank SMS with balances
- View card information
- Check all SMS messages
- Send SMS via SIM
- Configure Telegram bot

### 4. **Bot Features**
- Auto-forward SMS to Telegram
- Configure bot token and chat ID
- Select SIM and repeat count
- Auto-detect message formats
- Activity log
- Start/Stop controls

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase Realtime Database
2. Get your database URL: `https://your-project.firebaseio.com`
3. Get API key from Firebase Console → Project Settings
4. Set database rules to allow read/write with authentication

### Telegram Bot Setup
1. Create bot with [@BotFather](https://t.me/BotFather)
2. Get bot token
3. Add bot to your channel/group
4. Get chat ID from [@userinfobot](https://t.me/userinfobot)
5. Configure in Bot tab

## 🛠️ Tech Stack

- **Frontend**: Pure Vanilla JavaScript (No framework!)
- **Backend**: Node.js + Express
- **Database**: Firebase Realtime Database (REST API)
- **Styling**: Custom CSS with dark theme
- **Icons**: Heroicons (inline SVG)
- **Deployment**: Railway / Vercel / Heroku ready

## 📁 Project Structure

```
money-panel/
├── luffy-panel.vercel.app/
│   ├── index.html          # Main HTML
│   ├── style.css           # Styles
│   └── app.js              # JavaScript logic
├── server.js               # Express server
├── package.json            # Dependencies
└── README.md               # Documentation
```

## 🔒 Security

- All Firebase calls use authentication
- Credentials stored in localStorage (encrypted by browser)
- No credentials sent to backend
- HTTPS required for production
- Rate limiting recommended

## 🐛 Troubleshooting

### Connection Failed
- Check Firebase URL format
- Verify API key is correct
- Check Firebase database rules
- Ensure database is not empty

### No Devices Showing
- Verify devices are registered in Firebase
- Check data structure matches expected format
- Try manual refresh

### Bot Not Working
- Verify bot token is correct
- Check chat ID format
- Ensure bot is added to channel/group
- Check bot permissions

## 📝 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [@moneypanelsupport](https://t.me/moneypanelsupport)

## 🎉 Credits

Built with ❤️ by Money Panel Team

---

**⚠️ Disclaimer**: This tool is for authorized device management only. Ensure you have proper authorization before monitoring any devices.
