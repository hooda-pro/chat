// ═══════════════════════════════════════════════════
//  ذكاء — Backend Server (Node.js + Express)
//  مش محتاج قاعدة بيانات خارجية — بيخزن في ملف JSON
// ═══════════════════════════════════════════════════

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── PATHS ──────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, 'data');
const DB_FILE   = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// ─── ADMIN CREDENTIALS (غيّرها زي ما تحب) ──────────
const ADMIN = {
  email:    'hooda2024g1@gmail.com',
  phone:    '01065749774',
  password: hashPass('محمود'),          // مشفّرة
  name:     'محمود أحمد',
  id:       'admin_0001',
  role:     'admin'
};

// ─── HELPERS ────────────────────────────────────────
function hashPass(plain) {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ─── DATABASE (ملف JSON) ────────────────────────────
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const empty = { users: [], convs: [], masterKeys: [], sessions: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch { return { users: [], convs: [], masterKeys: [], sessions: {} }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function findUser(db, idOrEmail) {
  return db.users.find(u =>
    u.email === idOrEmail || u.phone === idOrEmail || u.id === idOrEmail
  ) || null;
}

// ─── AUTH MIDDLEWARE ────────────────────────────────
function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'غير مسجّل دخول' });
  const db = readDB();
  const session = db.sessions[token];
  if (!session) return res.status(401).json({ error: 'الجلسة منتهية، سجّل دخولك تاني' });
  req.userId  = session.userId;
  req.isAdmin = session.isAdmin;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.isAdmin) return res.status(403).json({ error: 'مش مسموح' });
    next();
  });
}

// ─── MIDDLEWARE ─────────────────────────────────────
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public'))); // الـ HTML هنا

// ════════════════════════════════════════════════════
//  AUTH ROUTES
// ════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).json({ error: 'ادخل البيانات كاملة' });

  const hashed = hashPass(password);

  // Admin check
  if ((id === ADMIN.email || id === ADMIN.phone) && hashed === ADMIN.password) {
    const db    = readDB();
    const token = makeToken();
    db.sessions[token] = { userId: ADMIN.id, isAdmin: true, createdAt: Date.now() };
    writeDB(db);
    return res.json({
      token,
      user: { id: ADMIN.id, name: ADMIN.name, role: 'admin', email: ADMIN.email }
    });
  }

  const db = readDB();
  const u  = findUser(db, id);
  if (!u)              return res.status(401).json({ error: 'الحساب مش موجود' });
  if (u.password !== hashed) return res.status(401).json({ error: 'كلمة المرور غلط' });

  const token = makeToken();
  db.sessions[token] = { userId: u.id, isAdmin: false, createdAt: Date.now() };
  writeDB(db);
  res.json({
    token,
    user: { id: u.id, name: u.name, role: u.role, email: u.email, phone: u.phone, age: u.age, keys: u.keys }
  });
});

// POST /api/register
app.post('/api/register', (req, res) => {
  const { name, phone, age, email, password } = req.body;
  if (!name || !phone || !email || !password)
    return res.status(400).json({ error: 'اكمل كل البيانات' });
  if (!/^01[0-9]{9}$/.test(phone))
    return res.status(400).json({ error: 'رقم الهاتف مش صح' });
  if (password.length < 8)
    return res.status(400).json({ error: 'كلمة المرور لازم 8 حروف على الأقل' });

  const db = readDB();
  if (db.users.find(u => u.email === email.toLowerCase()))
    return res.status(409).json({ error: 'البريد الإلكتروني مسجّل قبل كده' });
  if (db.users.find(u => u.phone === phone))
    return res.status(409).json({ error: 'رقم الهاتف مسجّل قبل كده' });

  const newUser = {
    id: 'u_' + Date.now(),
    name,
    phone,
    age: parseInt(age) || 0,
    email: email.toLowerCase(),
    password: hashPass(password),
    role: 'user',
    keys: {},
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);

  const token = makeToken();
  db.sessions[token] = { userId: newUser.id, isAdmin: false, createdAt: Date.now() };
  writeDB(db);

  res.json({
    token,
    user: { id: newUser.id, name: newUser.name, role: newUser.role, email: newUser.email, phone: newUser.phone, age: newUser.age, keys: {} }
  });
});

// POST /api/logout
app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers['x-auth-token'];
  const db = readDB();
  delete db.sessions[token];
  writeDB(db);
  res.json({ ok: true });
});

// GET /api/me  — يجيب بيانات المستخدم الحالي
app.get('/api/me', requireAuth, (req, res) => {
  if (req.isAdmin)
    return res.json({ id: ADMIN.id, name: ADMIN.name, role: 'admin', email: ADMIN.email });
  const db = readDB();
  const u  = findUser(db, req.userId);
  if (!u) return res.status(404).json({ error: 'مش لاقيك' });
  res.json({ id: u.id, name: u.name, role: u.role, email: u.email, phone: u.phone, age: u.age, keys: u.keys });
});

// ════════════════════════════════════════════════════
//  CONVERSATIONS ROUTES
// ════════════════════════════════════════════════════

// GET /api/convs — كل محادثات المستخدم
app.get('/api/convs', requireAuth, (req, res) => {
  const db = readDB();
  const list = db.convs
    .filter(c => c.userId === req.userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(list);
});

// POST /api/convs — حفظ أو تحديث محادثة
app.post('/api/convs', requireAuth, (req, res) => {
  const conv = req.body;
  if (!conv || !conv.id) return res.status(400).json({ error: 'بيانات ناقصة' });
  conv.userId = req.userId;  // أمان — مش بنثق بالكلاينت

  const db = readDB();
  const i  = db.convs.findIndex(c => c.id === conv.id && c.userId === req.userId);
  if (i >= 0) db.convs[i] = conv;
  else db.convs.push(conv);
  writeDB(db);
  res.json({ ok: true });
});

// DELETE /api/convs/:id
app.delete('/api/convs/:id', requireAuth, (req, res) => {
  const db = readDB();
  db.convs = db.convs.filter(c => !(c.id === req.params.id && c.userId === req.userId));
  writeDB(db);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════
//  USER KEYS ROUTES
// ════════════════════════════════════════════════════

// PUT /api/keys — تحديث مفاتيح المستخدم
app.put('/api/keys', requireAuth, (req, res) => {
  if (req.isAdmin) return res.status(403).json({ error: 'الأدمن بيستخدم master keys' });
  const { keys } = req.body;
  const db = readDB();
  const u  = findUser(db, req.userId);
  if (!u) return res.status(404).json({ error: 'مش لاقيك' });
  u.keys = keys || {};
  const i = db.users.findIndex(x => x.id === u.id);
  if (i >= 0) db.users[i] = u;
  writeDB(db);
  res.json({ ok: true });
});

// ════════════════════════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════════════════════════

// GET /api/admin/stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const db = readDB();
  const totalMsgs = db.convs.reduce((s, c) => s + (c.messages?.length || 0), 0);
  res.json({
    users:      db.users.length,
    convs:      db.convs.length,
    masterKeys: db.masterKeys.length,
    totalMsgs
  });
});

// GET /api/admin/users
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const db = readDB();
  const safe = db.users.map(u => ({
    id: u.id, name: u.name, email: u.email, phone: u.phone,
    age: u.age, role: u.role,
    keyCount: Object.keys(u.keys || {}).length,
    convCount: db.convs.filter(c => c.userId === u.id).length,
    createdAt: u.createdAt
  }));
  res.json(safe);
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const db = readDB();
  db.users = db.users.filter(u => u.id !== req.params.id);
  db.convs = db.convs.filter(c => c.userId !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// GET /api/admin/keys
app.get('/api/admin/keys', requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.masterKeys);
});

// POST /api/admin/keys
app.post('/api/admin/keys', requireAdmin, (req, res) => {
  const { provider, key } = req.body;
  if (!provider || !key) return res.status(400).json({ error: 'ناقص' });
  const db = readDB();
  db.masterKeys.push({ provider, key, addedAt: new Date().toISOString() });
  writeDB(db);
  res.json({ ok: true });
});

// DELETE /api/admin/keys/:index
app.delete('/api/admin/keys/:index', requireAdmin, (req, res) => {
  const db  = readDB();
  const idx = parseInt(req.params.index);
  if (isNaN(idx) || idx < 0 || idx >= db.masterKeys.length)
    return res.status(400).json({ error: 'index غلط' });
  db.masterKeys.splice(idx, 1);
  writeDB(db);
  res.json({ ok: true });
});

// GET /api/admin/convs  — آخر 20 محادثة
app.get('/api/admin/convs', requireAdmin, (req, res) => {
  const db = readDB();
  const recent = [...db.convs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20)
    .map(c => {
      const u = findUser(db, c.userId);
      return { ...c, userName: u?.name || 'مجهول' };
    });
  res.json(recent);
});

// ─── Catch-all: رجّع الـ HTML للـ SPA ───────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ السيرفر شغّال على http://localhost:${PORT}`);
});
