import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let doc = await Settings.findOne();
    if (!doc) {
      doc = await Settings.create({});
    } else {
      if (doc.showLinearGradient === undefined || doc.showLinearGradient === null) {
        doc.showLinearGradient = true;
      }
      if (doc.showRadialGradient === undefined || doc.showRadialGradient === null) {
        doc.showRadialGradient = true;
      }
      await doc.save();
    }
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/',
  authenticate,
  isAdmin,
  async (req, res) => {
    try {
      let doc = await Settings.findOne();
      if (!doc) {
        doc = await Settings.create({});
      }
      
      if (doc.showLinearGradient === undefined || doc.showLinearGradient === null) {
        doc.showLinearGradient = true;
      }
      if (doc.showRadialGradient === undefined || doc.showRadialGradient === null) {
        doc.showRadialGradient = true;
      }
      
      Object.assign(doc, req.body);
      await doc.save();
      
      res.json({ success: true, data: doc });
    } catch (e) {
      console.error('Settings update error:', e);
      res.status(400).json({ success: false, message: e.message });
    }
  }
);

router.post('/reset',
  authenticate,
  isAdmin,
  async (_req, res) => {
    try {
      const defaults = {
        goingButtonColor: '#ffffff',
        goingButtonTextColor: '#000000',
        goingButtonHoverColor: '#f3f4f6',
        cantGoButtonColor: 'transparent',
        cantGoButtonTextColor: '#ffffff',
        cantGoButtonBorderColor: 'rgba(255, 255, 255, 0.3)',
        cantGoButtonHoverColor: 'rgba(255, 255, 255, 0.1)',
        logoImage: null,
        showLinearGradient: true,
        showRadialGradient: true,
      };
      let doc = await Settings.findOne();
      if (!doc) {
        doc = await Settings.create(defaults);
      } else {
        Object.assign(doc, defaults);
        await doc.save();
      }
      res.json({ success: true, data: doc });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

export default router;
