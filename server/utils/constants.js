export const ALLOWED_MIME_TYPES = {
  video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

export const ALL_ALLOWED_MIME_TYPES = [
  ...ALLOWED_MIME_TYPES.video,
  ...ALLOWED_MIME_TYPES.image
];


