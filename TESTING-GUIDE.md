# 🧪 MONEY PANEL - Testing Guide

## SMS Auto-Refresh Testing

### Check Console Logs:

Open browser DevTools (F12) → Console tab

You should see:
```
✅ SMS auto-refresh enabled (every 45 seconds)
🔄 SMS auto-refresh triggered at 12:30:45
✅ Refreshed 5 devices SMS
```

### If NOT showing:
1. Check Firebase is connected
2. Check devices are loaded
3. Look for errors in console

### Manual Test:
1. Open dashboard
2. Wait 45 seconds
3. Check console for "🔄 SMS auto-refresh triggered"
4. Device cards should update automatically

## Bank Name Display Testing

### Check Console:
```
Rendering bank: HDFC Bank Balance: 50000
Rendering bank: SBI Balance: 25000
```

### Visual Check:
Device card should show:
```
┌────────────────────────────┐
│ HDFC Bank                  │
│ ₹50,000.00                 │
│ -₹5,000.00 debit          │
└────────────────────────────┘
```

### If Bank Name NOT showing:
1. Check SMS contains bank sender ID (HDFCBK, SBIINB, etc.)
2. Check console logs for "Rendering bank:"
3. Verify SMS has balance keywords (bal, balance, credited, etc.)

## Common Issues

### SMS not refreshing:
- ❌ Firebase permissions issue
- ❌ Network error
- ✅ Check console for errors

### Bank name missing:
- ❌ SMS doesn't have bank sender ID
- ❌ SMS format not matched
- ✅ Check console: "Rendering bank:"

### Balance not showing:
- ❌ SMS doesn't have amount pattern
- ❌ No balance keywords in SMS
- ✅ Check SMS analysis in console

## Debug Commands

Open browser console and run:

```javascript
// Check refresh timer
console.log('Timer active:', !!STATE.smsRefreshTimer);

// Manual refresh
refreshAllSms();

// Check devices
console.log('Devices:', STATE.devices.length);

// Check SMS loaded
console.log('SMS loaded:', STATE.smsLoaded.size);
```

## Expected Behavior

✅ **SMS Auto-Refresh:**
- Triggers every 45 seconds
- Console shows refresh message
- Cards update in real-time
- Stats update automatically

✅ **Bank Display:**
- Shows bank name clearly
- ₹ symbol visible
- Balance formatted (₹50,000.00)
- Transaction type color-coded

## Test Checklist

- [ ] Console shows "SMS auto-refresh enabled"
- [ ] Console shows refresh trigger every 45s
- [ ] Device cards update automatically
- [ ] Bank name visible in cards
- [ ] ₹ symbol shows properly
- [ ] Balance formatted correctly
- [ ] Transaction type shows (credit/debit)
- [ ] No errors in console

## All Working! ✅

If you see console logs and cards updating, everything is working properly!
