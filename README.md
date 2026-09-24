# NIR TOPUP — Ready Starter

এটি NIR TOPUP-এর ready-to-run full-stack starter:
- White/light frontend
- Game/product selection
- Order form
- bKash/Nagad method selection
- Transaction ID capture
- SQLite order database
- Order tracking
- Protected admin API for status changes

## চালানোর নিয়ম
1. Node.js 20+ install করুন।
2. এই folder-এ terminal খুলুন।
3. `npm install`
4. `ADMIN_KEY=YOUR_SECRET_KEY npm start`
5. Browser-এ `http://localhost:3000`

Windows PowerShell:
`$env:ADMIN_KEY="YOUR_SECRET_KEY"; npm start`

## গুরুত্বপূর্ণ
bKash/Nagad-এর real automatic payment verification এখনো gateway credentials/API ছাড়া করা যাবে না।
Production-এ যাওয়ার আগে:
- official merchant/payment gateway account নিন
- gateway credentials server environment variables-এ রাখুন
- HTTPS ব্যবহার করুন
- ADMIN_KEY অবশ্যই পরিবর্তন করুন
- real product prices/UID rules আপনার ব্যবসার অনুযায়ী সেট করুন

## Admin API
GET `/api/admin/orders` with header `x-admin-key: YOUR_SECRET_KEY`
PATCH `/api/admin/orders/NIR12345678` with JSON `{"status":"completed"}`

Allowed status: pending, processing, completed, cancelled, refunded.
