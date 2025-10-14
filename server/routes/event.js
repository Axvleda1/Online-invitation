import express from 'express';
import { body } from 'express-validator';
import eventController from '../controllers/eventController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', eventController.getAllEvents);
router.get('/active', eventController.getActiveEvent);
router.get('/stats', eventController.getEventStats);
router.get('/:id', eventController.getEventById);

router.post('/',
  authenticate,
  isAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').notEmpty().withMessage('Date is required')
  ],
  eventController.createEvent
);

router.put('/:id',
  authenticate,
  isAdmin,
  eventController.updateEvent
);

router.delete('/:id',
  authenticate,
  isAdmin,
  eventController.deleteEvent
);

router.patch('/:id/toggle-status',
  authenticate,
  isAdmin,
  eventController.toggleEventStatus
);

router.post('/:id/agenda',
  authenticate,
  isAdmin,
  [
    body('time').notEmpty().withMessage('Time is required'),
    body('title').notEmpty().withMessage('Title is required')
  ],
  eventController.addAgendaItem
);

router.put('/:id/agenda/:agendaId',
  authenticate,
  isAdmin,
  eventController.updateAgendaItem
);

router.delete('/:id/agenda/:agendaId',
  authenticate,
  isAdmin,
  eventController.deleteAgendaItem
);

export default router;