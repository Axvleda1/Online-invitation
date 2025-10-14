
import Guest from '../models/Guest.js';

class GuestService {
  async createOrUpdateGuest(guestData) {
    const { name, email, phone, company, position, going = true } = guestData;

    const doc = await Guest.findOneAndUpdate(
      { $or: [{ email: email.trim().toLowerCase() }, { phone: phone.trim().toLowerCase() }] },
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim().toLowerCase(),
        company: company?.trim() || '',
        position: position?.trim() || '',
        going: Boolean(going),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return doc;
  }

  async getGuests() {
    return Guest.find().sort({ createdAt: -1 });
  }

  async getGuestById(id) {
    return Guest.findById(id);
  }

  async deleteAllGuests() {
    const result = await Guest.deleteMany({});
    return result;
  }
}

export default new GuestService();
