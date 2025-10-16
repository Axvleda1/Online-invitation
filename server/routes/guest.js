import express from 'express';

import guestController from '../controllers/guestController.js';

const router = express.Router();

router.get('/', guestController.getGuests);
router.get('/:id', guestController.getGuestById);
router.delete('/all', guestController.deleteAllGuests);

router.post('/', guestController.createGuest);

export default router;