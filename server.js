const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'luffy-panel.vercel.app')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'luffy-panel.vercel.app', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`💰 MONEY PANEL running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
