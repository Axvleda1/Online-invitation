import mediaService from '../services/mediaService.js';
import { validationResult } from 'express-validator';
import fs from 'fs';

class MediaController { 
  async uploadMedia(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const mediaData = {
        title: req.body.title,
        description: req.body.description,
        type: req.body.type,
        duration: req.body.duration
      };

      const media = await mediaService.createMedia(
        mediaData,
        req.file,
      );

      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: media
      });
    } catch (error) {
      console.error('Upload controller error:', error);
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllMedia(req, res) {
    try {
      const filters = {
        type: req.query.type,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await mediaService.getAllMedia(filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all media error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async getMediaById(req, res) {
    try {
      const media = await mediaService.getMediaById(req.params.id);

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      console.error('Get media by ID error:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async updateMedia(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const updateData = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        duration: req.body.duration
      };

      const media = await mediaService.updateMedia(req.params.id, updateData);

      res.json({
        success: true,
        message: 'Media updated successfully',
        data: media
      });
    } catch (error) {
      console.error('Update media error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async deleteMedia(req, res) {
    try {
      const result = await mediaService.deleteMedia(req.params.id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async bulkDeleteMedia(req, res) {
    try {
      const { mediaIds } = req.body;

      if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of media IDs'
        });
      }

      const result = await mediaService.bulkDeleteMedia(mediaIds);

      res.json({
        success: true,
        message: 'Bulk delete completed',
        data: result
      });
    } catch (error) {
      console.error('Bulk delete error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async getMediaStats(req, res) {
    try {
      const stats = await mediaService.getMediaStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async getMediaByType(req, res) {
    try {
      const { type } = req.params;
      const limit = req.query.limit || 10;

      const media = await mediaService.getMediaByType(type, limit);

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      console.error('Get media by type error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async searchMedia(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const filters = {
        type: req.query.type,
        status: req.query.status,
        limit: req.query.limit
      };

      const media = await mediaService.searchMedia(q, filters);

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      console.error('Search media error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  
  async bulkUpdateStatus(req, res) {
    try {
      const { mediaIds, status } = req.body;

      if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of media IDs'
        });
      }

      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be "active" or "inactive"'
        });
      }

      const result = await mediaService.bulkUpdateStatus(mediaIds, status);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Bulk update status error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
async getPublicActiveMedia(req, res) {
  try {
    const media = await mediaService.getActivePublicMedia();
    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Get public media error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}





  async getLatestMedia(req, res) {
    try {
      const limit = req.query.limit || 5;
      const media = await mediaService.getLatestMedia(limit);

      res.json({
        success: true,
        data: media
      });
    } catch (error) {
      console.error('Get latest media error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}



export default new MediaController();