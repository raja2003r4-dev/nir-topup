const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const app = express();
const db = new Database(path.join(__dirname, "data", "nir-topup.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS orders (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 order_code TEXT UNIQUE NOT NULL,
 product TEXT NOT NULL,
 package_name TEXT NOT NULL,
 uid TEXT NOT NULL,
 amount REAL NOT NULL,
 method TEXT NOT NULL,
 trx_id TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/orders", (req,res)=>{
  const {product, packageName, uid, amount, method, trxId} = req.body || {};
  if(!product || !packageName || !uid || !amount || !method || !trxId)
    return res.status(400).json({error:"সব তথ্য পূরণ করুন"});
  if(!["bkash","nagad"].includes(method))
    return res.status(400).json({error:"Invalid payment method"});
  const code = "NIR" + Date.now().toString().slice(-8);
  try {
    db.prepare(`INSERT INTO orders
      (order_code,product,package_name,uid,amount,method,trx_id)
      VALUES (?,?,?,?,?,?,?)`).run(code,product,packageName,uid,Number(amount),method,trxId.trim());
    res.json({ok:true,orderCode:code,status:"pending"});
  } catch(e) { res.status(500).json({error:"Order save failed"}); }
});

app.get("/api/orders/:code",(req,res)=>{
  const row = db.prepare("SELECT order_code,product,package_name,uid,amount,method,status,created_at FROM orders WHERE order_code=?")
    .get(req.params.code);
  if(!row) return res.status(404).json({error:"Order not found"});
  res.json(row);
});

// Simple protected admin API. Change this before deployment.
const ADMIN_KEY = process.env.ADMIN_KEY || "CHANGE_THIS_ADMIN_KEY";
app.get("/api/admin/orders",(req,res)=>{
  if(req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  res.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
});
app.patch("/api/admin/orders/:code",(req,res)=>{
  if(req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({error:"Unauthorized"});
  const allowed=["pending","processing","completed","cancelled","refunded"];
  if(!allowed.includes(req.body.status)) return res.status(400).json({error:"Invalid status"});
  db.prepare("UPDATE orders SET status=? WHERE order_code=?").run(req.body.status,req.params.code);
  res.json({ok:true});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>console.log(`NIR TOPUP running on http://localhost:${PORT}`));
