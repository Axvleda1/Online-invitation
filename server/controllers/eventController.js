import eventService from '../services/eventService.js';
import { validationResult } from 'express-validator';

class EventController { 
  async createEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const event = await eventService.createEvent(req.body);

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllEvents(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        isActive: req.query.isActive
      };

      const result = await eventService.getAllEvents(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all events error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

    
  async getActiveEvent(req, res) {
    try {
      const event = await eventService.getActiveEvent();

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Get active event error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async getEventById(req, res) {
    try {
      const event = await eventService.getEventById(req.params.id);

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async updateEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const event = await eventService.updateEvent(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async deleteEvent(req, res) {
    try {
      const result = await eventService.deleteEvent(req.params.id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async toggleEventStatus(req, res) {
    try {
      const event = await eventService.toggleEventStatus(req.params.id);

      res.json({
        success: true,
        message: 'Event status updated',
        data: event
      });
    } catch (error) {
      console.error('Toggle status error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async addAgendaItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const event = await eventService.addAgendaItem(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Agenda item added',
        data: event
      });
    } catch (error) {
      console.error('Add agenda item error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async updateAgendaItem(req, res) {
    try {
      const { id, agendaId } = req.params;
      const event = await eventService.updateAgendaItem(id, agendaId, req.body);

      res.json({
        success: true,
        message: 'Agenda item updated',
        data: event
      });
    } catch (error) {
      console.error('Update agenda item error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async deleteAgendaItem(req, res) {
    try {
      const { id, agendaId } = req.params;
      const event = await eventService.deleteAgendaItem(id, agendaId);

      res.json({
        success: true,
        message: 'Agenda item deleted',
        data: event
      });
    } catch (error) {
      console.error('Delete agenda item error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async getEventStats(req, res) {
    try {
      const stats = await eventService.getEventStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get event stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new EventController();