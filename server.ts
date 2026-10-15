import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Database storage directory & file
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  passwordHash: string;
  passwordSalt: string;
  createdAt: number;
  approvedAt?: number;
  lastLoginAt?: number;
}

interface DatabaseSchema {
  users: UserRecord[];
  tokens: Record<string, string>; // token -> userId
  financeData: Record<string, any>; // userId -> user finance data
}

// Helpers for password hashing
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(userId: string): string {
  return `tok_${userId}_${crypto.randomBytes(24).toString('hex')}`;
}

// Clean default wallets with 0 balance
const DEFAULT_ZERO_WALLETS = [
  { id: 'cash', nameBn: 'ক্যাশ টাকা', nameEn: 'Cash', balance: 0, iconName: 'Banknote', color: 'emerald' },
  { id: 'bkash', nameBn: 'বিকাশ (bKash)', nameEn: 'bKash', balance: 0, iconName: 'Smartphone', color: 'pink' },
  { id: 'nagad', nameBn: 'নগদ (Nagad)', nameEn: 'Nagad', balance: 0, iconName: 'SmartphoneNfc', color: 'amber' },
  { id: 'bank', nameBn: 'ব্যাংক একাউন্ট', nameEn: 'Bank Account', balance: 0, iconName: 'Landmark', color: 'blue' },
  { id: 'rocket', nameBn: 'রকেট / অন্যান্য', nameEn: 'Rocket / Other', balance: 0, iconName: 'Wallet', color: 'purple' },
];

const DEFAULT_CLEAN_CATEGORIES = [
  { id: 'cat_bazaar', nameBn: 'কাঁচাবাজার ও সদাই', nameEn: 'Groceries & Bazaar', type: 'expense', iconName: 'ShoppingBag', color: 'emerald' },
  { id: 'cat_food', nameBn: 'খাবার ও রেস্তোরাঁ', nameEn: 'Food & Dining', type: 'expense', iconName: 'Utensils', color: 'amber' },
  { id: 'cat_rent', nameBn: 'বাসা ভাড়া', nameEn: 'House Rent', type: 'expense', iconName: 'Home', color: 'rose' },
  { id: 'cat_bills', nameBn: 'বিল (বিদ্যুৎ, গ্যাস, নেট)', nameEn: 'Bills & Utilities', type: 'expense', iconName: 'Zap', color: 'cyan' },
  { id: 'cat_transport', nameBn: 'যাতায়াত ও ভাড়া', nameEn: 'Transport & Commute', type: 'expense', iconName: 'Car', color: 'indigo' },
  { id: 'cat_recharge', nameBn: 'মোবাইল রিচার্জ', nameEn: 'Mobile Recharge', type: 'expense', iconName: 'PhoneCall', color: 'teal' },
  { id: 'cat_health', nameBn: 'চিকিৎসা ও ওষুধ', nameEn: 'Medical & Healthcare', type: 'expense', iconName: 'HeartPulse', color: 'red' },
  { id: 'cat_shopping', nameBn: 'কেনাকাটা ও পোশাক', nameEn: 'Shopping & Clothes', type: 'expense', iconName: 'Shirt', color: 'violet' },
  { id: 'cat_education', nameBn: 'পড়াশোনা ও সন্তানের খরচ', nameEn: 'Education & Fees', type: 'expense', iconName: 'GraduationCap', color: 'blue' },
  { id: 'cat_charity', nameBn: 'দান, যাকাত ও সদকা', nameEn: 'Charity & Donation', type: 'expense', iconName: 'Gift', color: 'teal' },
  { id: 'cat_entertainment', nameBn: 'ঘোরাঘুরি ও বিনোদন', nameEn: 'Outing & Fun', type: 'expense', iconName: 'Camera', color: 'orange' },
  { id: 'cat_other_exp', nameBn: 'অন্যান্য খরচ', nameEn: 'Other Expense', type: 'expense', iconName: 'MoreHorizontal', color: 'slate' },
  // Incomes
  { id: 'cat_salary', nameBn: 'মাসিক বেতন', nameEn: 'Monthly Salary', type: 'income', iconName: 'Briefcase', color: 'emerald' },
  { id: 'cat_business', nameBn: 'ব্যবসার লাভ / আয়', nameEn: 'Business Profit', type: 'income', iconName: 'TrendingUp', color: 'blue' },
  { id: 'cat_freelance', nameBn: 'ফ্রিল্যান্সিং', nameEn: 'Freelance & Projects', type: 'income', iconName: 'Laptop', color: 'purple' },
  { id: 'cat_rent_income', nameBn: 'ভাড়া প্রাপ্তি', nameEn: 'Rental Income', type: 'income', iconName: 'Building', color: 'cyan' },
  { id: 'cat_gift_inc', nameBn: 'উপহার / বকশিশ', nameEn: 'Gift / Reward', type: 'income', iconName: 'Sparkles', color: 'amber' },
  { id: 'cat_other_inc', nameBn: 'অন্যান্য আয়', nameEn: 'Other Income', type: 'income', iconName: 'Coins', color: 'emerald' },
];

function initDB(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data: DatabaseSchema = JSON.parse(content);
      // Ensure Master Admin Tanvirul Hoque is set with phone 01816769679 and password 0011
      const masterIdx = data.users.findIndex(
        (u) => u.id === 'user_admin_master' || u.phone === '01816769679' || u.role === 'admin'
      );
      const adminSalt = generateSalt();
      const adminHash = hashPassword('0011', adminSalt);
      const masterUser: UserRecord = {
        id: 'user_admin_master',
        name: 'Tanvirul Hoque',
        phone: '01816769679',
        role: 'admin',
        status: 'approved',
        passwordHash: adminHash,
        passwordSalt: adminSalt,
        createdAt: Date.now(),
        approvedAt: Date.now(),
      };

      if (masterIdx !== -1) {
        data.users[masterIdx] = masterUser;
      } else {
        data.users.unshift(masterUser);
      }

      // Ensure financeData initialized
      if (!data.financeData['user_admin_master']) {
        data.financeData['user_admin_master'] = {
          userId: 'user_admin_master',
          transactions: [],
          wallets: DEFAULT_ZERO_WALLETS,
          categories: DEFAULT_CLEAN_CATEGORIES,
          budgets: {},
          settings: { language: 'bn', numberFormat: 'bn' },
          updatedAt: Date.now(),
        };
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return data;
    } catch (e) {
      console.error('Error reading db.json, creating new database:', e);
    }
  }

  // Create default Master Admin (Tanvirul Hoque)
  const adminSalt = generateSalt();
  const adminHash = hashPassword('0011', adminSalt);
  const masterAdmin: UserRecord = {
    id: 'user_admin_master',
    name: 'Tanvirul Hoque',
    phone: '01816769679',
    role: 'admin',
    status: 'approved',
    passwordHash: adminHash,
    passwordSalt: adminSalt,
    createdAt: Date.now(),
    approvedAt: Date.now(),
  };

  const initialDB: DatabaseSchema = {
    users: [masterAdmin],
    tokens: {},
    financeData: {
      user_admin_master: {
        userId: 'user_admin_master',
        transactions: [], // 0 clean data
        wallets: DEFAULT_ZERO_WALLETS,
        categories: DEFAULT_CLEAN_CATEGORIES,
        budgets: {},
        settings: { language: 'bn', numberFormat: 'bn' },
        updatedAt: Date.now(),
      },
    },
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
  return initialDB;
}

let db = initDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save db.json:', e);
  }
}

// Authentication Middleware
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const userId = db.tokens[token];

  if (!userId) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired session' });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'User not found' });
  }

  if (user.status !== 'approved' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'forbidden',
      status: user.status,
      message: 'Account not approved yet or suspended by admin',
    });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

// Admin only middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user as UserRecord;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden', message: 'Admin access required' });
  }
  next();
}

// Clean phone number helper (e.g., converts '01712-345678' to '01712345678')
function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

// ==================== AUTH API ROUTES ====================

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, phone, password, adminSecret } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'missing_fields', message: 'Name, phone, and password are required' });
  }

  const cleanPhone = normalizePhone(phone);
  if (cleanPhone.length < 10 || cleanPhone.length > 14) {
    return res.status(400).json({ error: 'invalid_phone', message: 'Valid mobile number required' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'short_password', message: 'Password must be at least 4 characters' });
  }

  // Check if phone already registered
  const existingUser = db.users.find((u) => u.phone === cleanPhone);
  if (existingUser) {
    return res.status(400).json({
      error: 'phone_taken',
      message: 'এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে। অনুগ্রহ করে লগইন করুন।',
    });
  }

  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  const userId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  // If registering with admin credentials or owner phone
  const isAdmin = cleanPhone === '01816769679' || adminSecret === '0011';
  const status = isAdmin ? 'approved' : 'pending';

  const newUser: UserRecord = {
    id: userId,
    name: name.trim(),
    phone: cleanPhone,
    role: isAdmin ? 'admin' : 'user',
    status: status,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: Date.now(),
    approvedAt: isAdmin ? Date.now() : undefined,
  };

  db.users.push(newUser);

  // Initialize clean 0-balance user financial space
  db.financeData[userId] = {
    userId,
    transactions: [],
    wallets: DEFAULT_ZERO_WALLETS,
    categories: DEFAULT_CLEAN_CATEGORIES,
    budgets: {},
    settings: { language: 'bn', numberFormat: 'bn' },
    updatedAt: Date.now(),
  };

  const token = generateToken(userId);
  db.tokens[token] = userId;
  saveDB();

  const userSafe = {
    id: newUser.id,
    name: newUser.name,
    phone: newUser.phone,
    role: newUser.role,
    status: newUser.status,
    createdAt: newUser.createdAt,
  };

  return res.json({
    success: true,
    user: userSafe,
    token,
    requiresApproval: status === 'pending',
    message: status === 'pending'
      ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। অ্যাডমিনের অনুমোদনের পর আপনি হিসাব খাতা ব্যবহার করতে পারবেন।'
      : 'অ্যাকাউন্ট সফলভাবে অনুমোদিত ও সক্রিয় হয়েছে।',
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'missing_fields', message: 'Phone and password are required' });
  }

  const cleanPhone = normalizePhone(phone);
  const user = db.users.find((u) => u.phone === cleanPhone);

  if (!user) {
    return res.status(401).json({
      error: 'invalid_credentials',
      message: 'মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।',
    });
  }

  const hash = hashPassword(password, user.passwordSalt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({
      error: 'invalid_credentials',
      message: 'মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।',
    });
  }

  // Check approval status
  if (user.status === 'pending' && user.role !== 'admin') {
    return res.status(403).json({
      error: 'pending_approval',
      status: 'pending',
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, status: user.status },
      message: 'আপনার অ্যাকাউন্টটি এখনো অ্যাডমিনের অনুমোদনের অপেক্ষায় রয়েছে। অনুমোদিত হলে লগইন করতে পারবেন।',
    });
  }

  if (user.status === 'rejected' || user.status === 'suspended') {
    return res.status(403).json({
      error: 'account_inactive',
      status: user.status,
      message: 'আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।',
    });
  }

  // Update last login
  user.lastLoginAt = Date.now();
  const token = generateToken(user.id);
  db.tokens[token] = user.id;
  saveDB();

  const userSafe = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };

  return res.json({
    success: true,
    user: userSafe,
    token,
  });
});

// Get Current User Profile
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const userId = db.tokens[token];
  if (!userId) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    delete db.tokens[token];
    saveDB();
  }
  return res.json({ success: true });
});

// ==================== ADMIN APPROVAL & USER MANAGEMENT ====================

// List all users for admin
app.get('/api/admin/users', authenticateUser, requireAdmin, (req, res) => {
  const userList = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    approvedAt: u.approvedAt,
    lastLoginAt: u.lastLoginAt,
    transactionCount: db.financeData[u.id]?.transactions?.length || 0,
  }));

  const pendingCount = userList.filter((u) => u.status === 'pending').length;

  return res.json({
    success: true,
    users: userList,
    pendingCount,
  });
});

// Approve user
app.post('/api/admin/approve-user', authenticateUser, requireAdmin, (req, res) => {
  const { userId } = req.body;
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'not_found', message: 'User not found' });
  }

  user.status = 'approved';
  user.approvedAt = Date.now();
  saveDB();

  return res.json({
    success: true,
    message: `${user.name} (${user.phone}) অ্যাকাউন্ট সফলভাবে অনুমোদন করা হয়েছে।`,
  });
});

// Reject / Suspend user
app.post('/api/admin/reject-user', authenticateUser, requireAdmin, (req, res) => {
  const { userId, action } = req.body; // action: 'reject' | 'delete' | 'suspend'
  const targetIndex = db.users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return res.status(404).json({ error: 'not_found', message: 'User not found' });
  }

  const targetUser = db.users[targetIndex];

  // Prevent modifying the master admin
  if (targetUser.role === 'admin' && targetUser.id === 'user_admin_master') {
    return res.status(400).json({ error: 'forbidden', message: 'Master admin cannot be deleted or rejected' });
  }

  if (action === 'delete') {
    // Delete user and their tokens and data
    db.users.splice(targetIndex, 1);
    delete db.financeData[userId];
    // Remove any active tokens for this user
    for (const [token, uid] of Object.entries(db.tokens)) {
      if (uid === userId) delete db.tokens[token];
    }
  } else if (action === 'suspend') {
    targetUser.status = 'suspended';
  } else {
    targetUser.status = 'rejected';
  }

  saveDB();

  return res.json({
    success: true,
    message: 'User status updated successfully',
  });
});

// Toggle user status (approved <-> suspended)
app.post('/api/admin/toggle-status', authenticateUser, requireAdmin, (req, res) => {
  const { userId } = req.body;
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'not_found', message: 'User not found' });
  }

  if (user.id === 'user_admin_master') {
    return res.status(400).json({ error: 'forbidden', message: 'Cannot suspend master admin' });
  }

  user.status = user.status === 'approved' ? 'suspended' : 'approved';
  saveDB();

  return res.json({
    success: true,
    newStatus: user.status,
    message: `ব্যবহারকারীর স্ট্যাটাস এখন: ${user.status === 'approved' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}`,
  });
});

// ==================== USER ISOLATED FINANCE DATA ====================

// Get current user's financial ledger
app.get('/api/finance/data', authenticateUser, (req, res) => {
  const user = (req as any).user as UserRecord;
  let userData = db.financeData[user.id];

  if (!userData) {
    userData = {
      userId: user.id,
      transactions: [],
      wallets: DEFAULT_ZERO_WALLETS,
      categories: DEFAULT_CLEAN_CATEGORIES,
      budgets: {},
      settings: { language: 'bn', numberFormat: 'bn' },
      updatedAt: Date.now(),
    };
    db.financeData[user.id] = userData;
    saveDB();
  }

  return res.json({
    success: true,
    data: userData,
  });
});

// Save / Sync current user's financial ledger
app.post('/api/finance/sync', authenticateUser, (req, res) => {
  const user = (req as any).user as UserRecord;
  const { transactions, wallets, categories, budgets, settings } = req.body;

  db.financeData[user.id] = {
    userId: user.id,
    transactions: Array.isArray(transactions) ? transactions : [],
    wallets: Array.isArray(wallets) ? wallets : DEFAULT_ZERO_WALLETS,
    categories: Array.isArray(categories) ? categories : DEFAULT_CLEAN_CATEGORIES,
    budgets: budgets || {},
    settings: settings || { language: 'bn', numberFormat: 'bn' },
    updatedAt: Date.now(),
  };

  saveDB();

  return res.json({
    success: true,
    updatedAt: db.financeData[user.id].updatedAt,
  });
});

// App configuration & public metadata
app.get('/api/app-info', (req, res) => {
  const pendingCount = db.users.filter((u) => u.status === 'pending').length;
  return res.json({
    name: 'আয় ব্যয় হিসাব',
    version: '1.2.0',
    approvalRequired: true,
    pendingUsers: pendingCount,
  });
});

// ==================== VITE OR STATIC SERVING ====================

async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
