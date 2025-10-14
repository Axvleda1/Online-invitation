import { useEffect } from 'react';
import { formatBytes, formatDate, getMediaTypeBadge, getStatusBadge } from '../../utils/helpers';
import { fileUrl } from '../../utils/fileUrl';

const MediaModal = ({ media, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!media) return null;

  const mediaUrl = fileUrl(media.filePath);

  const renderMedia = () => {
    if (media.type === 'video') {
      return (
        <video
          src={mediaUrl}
          controls
          autoPlay
          muted            // helps autoplay on mobile
          playsInline      // iOS inline
          preload="metadata" // Better mobile loading
          className="w-full max-h-[70vh] rounded-lg"
          onError={(e) => {
            console.error('Video load error:', e);
            setTimeout(() => {
              e.target.load();
            }, 1000);
          }}
        />
      );
    }
    return (
      <img
        src={mediaUrl}
        alt={media.title}
        className="w-full max-h-[70vh] object-contain rounded-lg"
        loading="lazy" // Better mobile performance
        onError={(e) => {
          console.error('Image load error:', e);
          setTimeout(() => {
            e.target.src = mediaUrl + '?t=' + Date.now();
          }, 1000);
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in">
      <div className="bg-tech-gray rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-tech-gray border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">მედია დეტალები</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-6">
          <div className="mb-6">{renderMedia()}</div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">დასახელება</label>
              <p className="text-lg font-semibold text-white">{media.title}</p>
            </div>

            {media.description && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">აღწერა</label>
                <p className="text-gray-300">{media.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <InfoItem label="ტიპი" value={media.type} badge={getMediaTypeBadge(media.type)} />
              <InfoItem label="სტატუსი" value={media.status} badge={getStatusBadge(media.status)} />
              <InfoItem label="ფაილის ზომა" value={formatBytes(media.fileSize)} />
              <InfoItem label="MIME ტიპი" value={media.mimeType} />
              {media.duration && <InfoItem label="ხანგრძლივობა" value={`${media.duration} წამებში`} />}
              <InfoItem label="ატვირთული მომხმარებელი" value={media.uploadedBy?.email || 'უცნობი'} />
              <InfoItem label="Created" value={formatDate(media.createdAt)} />
              <InfoItem label="Updated" value={formatDate(media.updatedAt)} />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <label className="block text-sm font-medium text-gray-400 mb-1">ფაილის ბიქვაზი</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-tech-gray-light px-3 py-2 rounded text-sm text-gray-300 overflow-x-auto">
                  {media.filePath}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(mediaUrl)}
                  className="btn-secondary text-sm"
                >
                  კოპირება
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-tech-gray border-t border-gray-800 p-4 flex justify-end space-x-3">
              <a href={mediaUrl} download className="btn-secondary">ჩამოტვირთვა</a>
          <button onClick={onClose} className="btn-primary">დახურვა</button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, badge }) => (
  <div>
    <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
    {badge ? (
      <span className={`px-2 py-1 rounded text-xs ${badge} border inline-block`}>{value}</span>
    ) : (
      <p className="text-sm text-white">{value}</p>
    )}
  </div>
);

export default MediaModal;
