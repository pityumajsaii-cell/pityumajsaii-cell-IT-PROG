require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = "database.json";
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({leads:[], subscribers:[]}, null,2));
}

function readDB(){
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(data){
  fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2));
}

app.get("/", (req,res)=>{
res.send(`
<html>
<head>
<title>AI Growth Agency</title>
<style>
body {background:#0f0f0f;color:white;font-family:Arial;text-align:center;}
.card {border:1px solid #333;padding:20px;margin:20px;}
button {padding:10px 20px;background:#00ff99;border:none;}
</style>
</head>
<body>
<h1>AI Client Acquisition System</h1>
<p>We build automated systems that bring you clients.</p>

<div class="card">
<h2>Basic - $49/mo</h2>
<button onclick="subscribe('basic')">Subscribe</button>
</div>

<div class="card">
<h2>Pro - $149/mo</h2>
<button onclick="subscribe('pro')">Subscribe</button>
</div>

<h2>Book Free Strategy Call</h2>
<form method="POST" action="/lead">
<input name="name" placeholder="Name" required/>
<input name="email" placeholder="Email" required/>
<button type="submit">Book Call</button>
</form>

<script>
async function subscribe(plan){
 const res = await fetch('/create-checkout-session', {
   method:'POST',
   headers:{'Content-Type':'application/json'},
   body: JSON.stringify({plan})
 });
 const data = await res.json();
 window.location = data.url;
}
</script>

</body>
</html>
`);
});

app.post("/lead",(req,res)=>{
 const db = readDB();
 db.leads.push({name:req.body.name,email:req.body.email,date:new Date()});
 saveDB(db);
 res.send("<h1>We will contact you shortly.</h1>");
});

app.post("/create-checkout-session", async (req,res)=>{
 let price;
 if(req.body.plan === "basic"){
   price = process.env.STRIPE_PRICE_BASIC;
 } else {
   price = process.env.STRIPE_PRICE_PRO;
 }

 const session = await stripe.checkout.sessions.create({
   payment_method_types:["card"],
   mode:"subscription",
   line_items:[{price:price,quantity:1}],
   success_url: process.env.DOMAIN + "/success",
   cancel_url: process.env.DOMAIN + "/cancel"
 });

 res.json({url:session.url});
});

app.get("/success",(req,res)=>res.send("<h1>Payment Successful</h1>"));
app.get("/cancel",(req,res)=>res.send("<h1>Payment Cancelled</h1>"));

app.get("/admin",(req,res)=>{
 const auth = req.headers.authorization;
 if(!auth) return res.send("Unauthorized");
 const [user,pass] = Buffer.from(auth.split(" ")[1],"base64").toString().split(":");
 if(user===process.env.ADMIN_USER && pass===process.env.ADMIN_PASS){
   res.json(readDB());
 } else {
   res.send("Unauthorized");
 }
});

app.listen(process.env.PORT || 3000,()=>{
 console.log("FULL AGENCY SYSTEM RUNNING");
});
