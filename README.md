# Mjupa_marketing
DUKA LA NGUO  ONLINE &amp; COMMISSION 
Mjupa Marketing System (full Stack Code)
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
// MJUPA MARKETING - FULL STACK (SIMPLIFIED PRODUCTION STARTER)
//  MARKETING - FULL STACK (SIMPLIFIED PRODUCTION STARTER)
// Frontend: React
// Backend: Node.js (Express)
// Database: MongoDB (easier for tree/referral scaling)
// Database: MMJUPAongoDB (easier for tree/referral scaling)

// ================= BACKEND =================
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/mjupa');

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: { type: String, default: 'pending' }
});

const Order = mongoose.model('Order', orderSchema);

// Register
app.post('/register', async (req, res) => {
  const { name, email, password, ref } = req.body;

  const user = new User({
    name,
    email,
    password,
    referrer: ref || null
  });

  await user.save();
  res.json(user);
});

// Create Order (T-shirt purchase)
app.post('/order', async (req, res) => {
  const { userId } = req.body;

  const order = new Order({
    userId,
    amount: 15000
  });

  await order.save();
Ask ChatGPT to edit
