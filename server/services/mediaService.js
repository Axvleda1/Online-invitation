import Media from '../models/Media.js';
import fs from 'fs';
import path from 'path';
import { formatBytes } from '../utils/helpers.js';

class MediaService {
  async createMedia(mediaData, file, userId) {
    if (!file) {
      throw new Error('No file provided');
    }

    const { title, description, type, duration, status } = mediaData;

    if (status === 'active') {
      await Media.updateMany(
        { type, status: 'active' },
        { $set: { status: 'inactive' } }
      );
    }

    const media = new Media({
      title,
      description: description || '',
      type,
      fileName: file.filename,
      filePath: `/uploads/${type}s/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      duration: duration || null,
      status: status || 'inactive'
    });

    await media.save();
    return media;
  }

  async getAllMedia(filters = {}) {
    const { type, status, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const media = await Media.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Media.countDocuments(query);

    return {
      media,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  
  async getMediaById(mediaId) {
    const media = await Media.findById(mediaId);
    if (!media) throw new Error('Media not found');
    return media;
  }

  
  async updateMedia(mediaId, updateData) {
    const media = await Media.findById(mediaId);
    if (!media) throw new Error('Media not found');

    Object.assign(media, updateData);
    media.updatedAt = Date.now();
    await media.save();

    return media;
  }

async updateMedia(mediaId, updateData) {
  const media = await Media.findById(mediaId);
  if (!media) throw new Error('Media not found');



  Object.assign(media, updateData);
  media.updatedAt = Date.now();
  await media.save();

  return media;
}




  async deleteMedia(mediaId) {
    const media = await Media.findById(mediaId);

    if (!media) {
      throw new Error('Media not found');
    }


    const filePath = path.join(process.cwd(), 'uploads', `${media.type}s`, media.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }


    await Media.findByIdAndDelete(mediaId);

    return { message: 'Media deleted successfully' };
  }


  async bulkDeleteMedia(mediaIds) {
    const deletedCount = { success: 0, failed: 0 };

    for (const id of mediaIds) {
      try {
        await this.deleteMedia(id);
        deletedCount.success++;
      } catch (error) {
        deletedCount.failed++;
        console.error(`Failed to delete media ${id}:`, error.message);
      }
    }

    return deletedCount;
  }


  async getMediaStats() {
    const totalMedia = await Media.countDocuments();
    const totalVideos = await Media.countDocuments({ type: 'video' });
    const totalImages = await Media.countDocuments({ type: 'image' });
    const activeMedia = await Media.countDocuments({ status: 'active' });
    const inactiveMedia = await Media.countDocuments({ status: 'inactive' });


    const allMedia = await Media.find();
    const totalStorage = allMedia.reduce((sum, media) => sum + media.fileSize, 0);


    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUploads = await Media.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });


    const videoStorage = allMedia
      .filter(m => m.type === 'video')
      .reduce((sum, m) => sum + m.fileSize, 0);
    
    const imageStorage = allMedia
      .filter(m => m.type === 'image')
      .reduce((sum, m) => sum + m.fileSize, 0);
    
    return {
      totalMedia,
      totalVideos,
      totalImages,
      activeMedia,
      inactiveMedia,
      totalStorage,
      totalStorageFormatted: formatBytes(totalStorage),
      recentUploads,
      storageByType: {
        video: {
          count: totalVideos,
          size: videoStorage,
          formatted: formatBytes(videoStorage)
        },
        image: {
          count: totalImages,
          size: imageStorage,
          formatted: formatBytes(imageStorage)
        },

      }
    };
  }


  async getMediaByType(type, limit = 10) {
    return await Media.find({ type, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit);
  }


  async searchMedia(searchTerm, filters = {}) {
    const query = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;

    return await Media.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20);
  }


  async bulkUpdateStatus(mediaIds, status) {
    const result = await Media.updateMany(
      { _id: { $in: mediaIds } },
      { $set: { status, updatedAt: Date.now() } }
    );

    return {
      modifiedCount: result.modifiedCount,
      message: `${result.modifiedCount} media items updated`
    };
  }


  


  async getLatestMedia(limit = 5) {
    return await Media.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  
async getActivePublicMedia() {
  return await Media.find({ status: 'active' })
    .sort({ createdAt: -1 })
}

}

export default new MediaService();