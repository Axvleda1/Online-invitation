import express from 'express';
import { body } from 'express-validator';
import mediaController from '../controllers/mediaController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', mediaController.getAllMedia);
router.get('/search', mediaController.searchMedia);
router.get('/stats/overview', mediaController.getMediaStats);
router.get('/latest', mediaController.getLatestMedia);
router.get('/type/:type', mediaController.getMediaByType);
router.get('/:id', mediaController.getMediaById);
router.get('/public/test', mediaController.getPublicActiveMedia);

router.post('/upload',
  authenticate,
  isAdmin,
  upload.single('file'),
  mediaController.uploadMedia
);

router.put('/:id',
  authenticate,
  isAdmin,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
  ],
  mediaController.updateMedia
);

router.delete('/:id', 
  authenticate,
  isAdmin,
  mediaController.deleteMedia
);

router.post('/bulk-delete',
  authenticate,
  isAdmin,
  mediaController.bulkDeleteMedia
);

router.post('/bulk-update-status',
  authenticate,
  isAdmin,
  mediaController.bulkUpdateStatus
);

export default router;