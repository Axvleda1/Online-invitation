
import guestService from '../services/guestService.js';

class GuestController {
  async createGuest(req, res, next) {
    try {
      const { name, email, phone, company, position, going } = req.body;
      if (!name?.trim() || !email?.trim() || !phone?.trim()) {
        return res.status(400).json({ message: 'Name, email and phone are required.' });
      }

      const guest = await guestService.createOrUpdateGuest({ name, email, phone, company, position, going });
      return res.status(201).json(guest);
    } catch (err) {
      
      if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(409).json({ message: `A guest with that ${field} already exists.` });
      }
      next(err);
    }
  }

  async getGuests(req, res, next) {
    try {
      const guests = await guestService.getGuests();
      return res.status(200).json(guests); 
    } catch (err) {
      next(err);
    }
  }

  async getGuestById(req, res, next) {
    try {
      const guest = await guestService.getGuestById(req.params.id);
      if (!guest) return res.status(404).json({ message: 'Guest not found' });
      return res.status(200).json(guest);
    } catch (err) {
      next(err);
    }
  }

  async deleteAllGuests(req, res, next) {
    try {
      const result = await guestService.deleteAllGuests();
      return res.status(200).json({ 
        message: `Successfully deleted ${result.deletedCount} guests`,
        deletedCount: result.deletedCount 
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new GuestController();
