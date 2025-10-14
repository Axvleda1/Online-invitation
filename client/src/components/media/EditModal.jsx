import { useState, useEffect } from 'react';
import useMediaStore from '../../store/mediaStore';
import toast from 'react-hot-toast';

const EditModal = ({ media, onClose, onSuccess }) => {
  const { updateMedia, isLoading } = useMediaStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    duration: '',
  });

  useEffect(() => {
    if (media) {
      setFormData({
        title: media.title || '',
        description: media.description || '',
        status: media.status || 'active',
        duration: media.duration || '',
      });
    }
  }, [media]);

  useEffect(() => {
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('დასახელება სავალდებულოა');
      return;
    }

    const result = await updateMedia(media._id, formData);

    if (result.success) {
      toast.success('მედია წარმატებით განახლდა!');
      onSuccess();
    } else {
      toast.error(result.error || 'განახლება ვერ მოხერხდა');
    }
  };

  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 animate-fade-in">
      <div className="bg-tech-gray rounded-xl max-w-2xl w-full">
        <div className="border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">მედია რედაქტირება</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                დასახელება *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="შეიყვანეთ დასახელება"
              required
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                აღწერა
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="შეიყვანეთ მედია აღწერა (არასავალდებულო)"
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                სტატუსი
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="active">აქტიური</option>
              <option value="inactive">გათიშული</option>
            </select>
          </div>

          
          {(media.type === 'video') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ხანგრძლივობა (წამებში)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input-field"
                placeholder="მაგალითად, 120"
              />
            </div>
          )}

          
          <div className="pt-4 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">ტიპი:</span>
                <span className="ml-2 text-white capitalize">{media.type}</span>
              </div>
              <div>
                <span className="text-gray-400">ფაილი:</span>
                <span className="ml-2 text-white">{media.fileName}</span>
              </div>
            </div>
          </div>

            
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="loader mr-2"></div>
                  განახლება...
                </span>
              ) : (
                'შენახვა'
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              გაუქმება
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;