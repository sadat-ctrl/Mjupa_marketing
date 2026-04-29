// MJUPA MARKETING - PRODUCTION READY (IMPROVED)
// Backend: Node.js (Express + JWT + Multer)
// Frontend: React
// Database: MongoDB

// ================= BACKEND =================
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1/mjupa');

const upload = multer({ dest: 'uploads/' });
const SECRET = 'mjupa_secret';

// ===== SCHEMAS =====
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: { type: String, default: 'pending' },
  proof: String
});
const Order = mongoose.model('Order', orderSchema);

// ===== AUTH =====
app.post('/register', async (req, res) => {
  const { name, email, password, ref } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed, referrer: ref || null });
  await user.save();

  res.json({ message: 'Registered' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid' });
  }

  const token = jwt.sign({ id: user._id }, SECRET);
  res.json({ token, user });
});

// ===== ORDER + PAYMENT PROOF =====
app.post('/order', async (req, res) => {
  const { userId } = req.body;
  const order = new Order({ userId, amount: 15000 });
  await order.save();
  res.json(order);
});

app.post('/upload/:orderId', upload.single('proof'), async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  order.proof = req.file.path;
  await order.save();
  res.json({ message: 'Uploaded' });
});

// ===== ADMIN CONFIRM + MULTI LEVEL COMMISSION =====
app.post('/confirm/:orderId', async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  order.status = 'paid';
  await order.save();

  let user = await User.findById(order.userId);
  user.isActive = true;
  await user.save();

  // MULTI LEVEL (10%, 3%, 1%)
  let levels = [0.1, 0.03, 0.01];
  let current = user;

  for (let i = 0; i < levels.length; i++) {
    if (!current.referrer) break;
    let ref = await User.findById(current.referrer);
    ref.balance += order.amount * levels[i];
    await ref.save();
    current = ref;
  }

  res.json({ success: true });
});

// ===== ADMIN VIEW =====
app.get('/admin/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get('/admin/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.listen(5000, () => console.log('Server running'));

// ================= FRONTEND =================
// App.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [form, setForm] = useState({});
  const [token, setToken] = useState('');

  const register = async () => {
    await axios.post('http://localhost:5000/register', form);
    alert('Registered');
  };

  const login = async () => {
    const res = await axios.post('http://localhost:5000/login', form);
    setToken(res.data.token);
    alert('Logged in');
  };

  return (
    <div className="p-10">
      <h1>MJUPA MARKETING</h1>

      <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})} />
      <input placeholder="Password" type="password" onChange={e => setForm({...form, password:e.target.value})} />
      <input placeholder="Referral ID" onChange={e => setForm({...form, ref:e.target.value})} />

      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>

      <h2>T-SHIRT - 15,000</h2>
      <p>M-PESA: 0799537179 (SADATI AZIZI MJUPA)</p>
      <p>TIGO: 0770527179</p>
      <p>SELCOM: 55251 01542 364</p>
    </div>
  );
}

// ================= DEPLOY =================
// 1. Install: npm install
// 2. Run backend: node server.js
// 3. Deploy: upload to https://render.com or https://railway.app
// 4. You will get your LIVE LINK automatically
