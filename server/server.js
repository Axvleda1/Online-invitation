// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// import authenticate from './middleware/auth.js'; // (kept if you use it)
import { getLocalIp } from './ip.js';

import authRoutes from './routes/auth.js';
import mediaRoutes from './routes/media.js';
import eventRoutes from './routes/event.js';
import settingsRoutes from './routes/settings.js';
import guestRoutes from './routes/guest.js';

import Media from './models/Media.js';
import Guest from './models/Guest.js';
import Settings from './models/Settings.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', true);

// ---------- Logging ----------
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} | IP:${req.ip} | UA:${req.headers['user-agent'] || '-'} | Auth:${req.headers.authorization ? 'yes' : 'no'}`
  );
  next();
});

// ---------- Network + CORS config ----------
const LOCAL_IP = process.env.LOCAL_IP || getLocalIp(); // auto-detected if not provided
const FRONTEND_PORT = process.env.FRONTEND_PORT || '3000';
const BACKEND_PORT = process.env.BACKEND_PORT || '5000';

// Optional extra explicit allowlist (comma-separated full origins, e.g. http://phone:3000)
const EXTRA_ORIGINS = (process.env.ALLOW_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function isPrivate(host) {
  return (
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    (host.startsWith('172.') && (() => {
      const n = Number(host.split('.')[1]);
      return n >= 16 && n <= 31;
    })())
  );
}
function same24(a, b) {
  const A = a.split('.'), B = b.split('.');
  return A[0] === B[0] && A[1] === B[1] && A[2] === B[2];
}

const corsOptions = {
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','Accept'],
  origin: (origin, cb) => {
    // No origin (curl/Postman/native apps) -> allow
    if (!origin) return cb(null, true);

    try {
      const u = new URL(origin);
      const host = u.hostname;
      const port = u.port || (u.protocol === 'https:' ? '443' : '80');

      const allowed =
        // local dev ports
        (host === 'localhost' && port === FRONTEND_PORT) ||
        (host === '127.0.0.1' && port === FRONTEND_PORT) ||
        // same machine LAN IP (frontend or backend)
        (host === LOCAL_IP && (port === FRONTEND_PORT || port === BACKEND_PORT)) ||
        // any private host on the same /24 as the server (good for phones/2nd PCs on LAN)
        (isPrivate(host) && same24(host, LOCAL_IP)) ||
        // explicit allowlist via env
        EXTRA_ORIGINS.includes(origin);

      return allowed ? cb(null, true) : cb(new Error(`Not allowed by CORS: ${origin}`));
    } catch {
      return cb(new Error(`Invalid Origin: ${origin}`));
    }
  }
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ---------- Body parsers ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- Static /uploads with helpful headers ----------
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// (Optional) also serve uploads at root for convenience
app.use(express.static(path.join(__dirname, 'uploads')));

// ---------- Default media fallbacks ----------
const defaultMediaMap = {
  '/default-image.jpg': 'https://picsum.photos/1200/800.jpg',
  '/default-video.mp4': 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
};

app.get(Object.keys(defaultMediaMap), (req, res) => {
  const localPath = path.join(process.cwd(), 'server', 'public', req.path);
  fs.access(localPath, fs.constants.F_OK, (err) => {
    if (!err) {
      return res.sendFile(localPath);
    }
    const remoteUrl = defaultMediaMap[req.path];
    if (remoteUrl) {
      return res.redirect(remoteUrl);
    }
    return res.status(404).send('Not Found');
  });
});

// ---------- API routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/guests', guestRoutes);

// ---------- Health & debug ----------
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', hostIp: LOCAL_IP });
});

app.get('/api/_whoami', (req, res) => {
  res.json({
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    origin: req.headers.origin || null,
    ua: req.headers['user-agent'] || null,
    serverIp: LOCAL_IP
  });
});

app.get('/api/_debug/db', async (req, res) => {
  try {
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    const build = await admin.buildInfo();
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ ok: true, mongoVersion: build.version, collections: collections.map(c => c.name) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/_debug/counts', async (req, res) => {
  try {
    const mediaCount = await Media.countDocuments();
    const guestCount = await Guest.countDocuments();
    const settingsCount = await Settings.countDocuments();
    res.json({ ok: true, mediaCount, guestCount, settingsCount });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------- 404 & error handlers ----------
app.use(notFound);
app.use(errorHandler);

// ---------- DB + server start ----------
const connectDB = async () => {
  try {
    mongoose.set('debug', true);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || BACKEND_PORT;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Detected LAN IP: http://${LOCAL_IP}:${PORT}`);
    console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
  });
});
