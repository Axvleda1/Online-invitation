
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 2048;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '00:00';
  
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};


export const formatDate = (date) => {
  const d = new Date(date);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('en-US', options);
};


export const getFileIcon = (type) => {
  const icons = {
    video: '🎬',
    image: '🖼️',
  };
  return icons[type] || '📄';
};


export const getMediaTypeColor = (type) => {
  const colors = {
    video: 'text-blue-400',
    image: 'text-green-400',
  };
  return colors[type] || 'text-gray-400';
};


export const getMediaTypeBadge = (type) => {
  const colors = {
    video: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    image: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};


export const getStatusBadge = (status) => {
  const colors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};


export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};


export const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};



export const getAllowedFileTypes = (type) => {
  const types = {
    video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  };
  return types[type] || [];
};


export const getFileAccept = (type) => {
  const accept = {
    video: 'video/*',
    image: 'image/*',
  };
  return accept[type] || '*';
};


export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};


export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};