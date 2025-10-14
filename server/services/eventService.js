import Event from '../models/Event.js';

class EventService {
  
  async createEvent(eventData, userId) {
    const payload = { ...eventData };
    if (payload.date) payload.date = new Date(payload.date);
    if (payload.endDate) payload.endDate = new Date(payload.endDate);
    const event = new Event({
      ...payload,
      createdBy: userId
    });

    await event.save();
    return event;
  }

  
  async getAllEvents(filters = {}) {
    const { page = 1, limit = 10, isActive } = filters;
    
    const query = {};
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    return {
      events,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  
  async getActiveEvent() {
    const event = await Event.findOne({ 
      isActive: true,
      showOnHomepage: true 
    }).sort({ createdAt: -1 });

    return event;
  }

  
  async getEventById(eventId) {
    const event = await Event.findById(eventId).populate('createdBy', 'email');
    
    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  
  async updateEvent(eventId, updateData) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        if (key === 'date' || key === 'endDate') {
          event[key] = new Date(updateData[key]);
        } else {
          event[key] = updateData[key];
        }
      }
    });

    event.updatedAt = Date.now();
    await event.save();

    return event;
  }

  
  async deleteEvent(eventId) {
    const event = await Event.findByIdAndDelete(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    return { message: 'Event deleted successfully' };
  }

  
  async toggleEventStatus(eventId) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.isActive = !event.isActive;
    event.updatedAt = Date.now();
    await event.save();

    return event;
  }

  
  async addAgendaItem(eventId, agendaItem) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.agenda.push(agendaItem);
    event.updatedAt = Date.now();
    await event.save();

    return event;
  }

  
  async updateAgendaItem(eventId, agendaItemId, updateData) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    const agendaItem = event.agenda.id(agendaItemId);
    if (!agendaItem) {
      throw new Error('Agenda item not found');
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        agendaItem[key] = updateData[key];
      }
    });

    event.updatedAt = Date.now();
    await event.save();

    return event;
  }

  
  async deleteAgendaItem(eventId, agendaItemId) {
    const event = await Event.findById(eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    event.agenda.pull(agendaItemId);
    event.updatedAt = Date.now();
    await event.save();

    return event;
  }

  
  async getEventStats() {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const inactiveEvents = await Event.countDocuments({ isActive: false });

    return {
      totalEvents,
      activeEvents,
      inactiveEvents
    };
  }
}

export default new EventService();