import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaStore from '../store/mediaStore';
import toast from 'react-hot-toast';
import { validateFileType, getAllowedFileTypes, formatBytes } from '../utils/helpers';

const Upload = () => {
  const navigate = useNavigate();
  const { uploadMedia, isLoading } = useMediaStore();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    duration: '',
  });

  const mediaTypes = [
    { value: 'video', label: 'ვიდეო', icon: '🎬', accept: 'video/*' },
    { value: 'image', label: 'სურათი', icon: '🖼️', accept: 'image/*' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {  
    const allowedTypes = getAllowedFileTypes(formData.type);
    if (!validateFileType(file, allowedTypes)) {
      toast.error(`გთხოვთ, აირჩიოთ ვალიდური ${formData.type} ფაილი`);
      return;
    }

    


    setSelectedFile(file);

    
    if (formData.type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (formData.type === 'video') {
      const videoURL = URL.createObjectURL(file);
      setPreview(videoURL);
    } else {
      setPreview(null);
    }

    
    if (!formData.title) {
      setFormData({ ...formData, title: file.name.split('.')[0] });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (type) => {
    setFormData({ ...formData, type });
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('გთხოვთ, აირჩიოთ ფაილი ატვირთვისთვის');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('გთხოვთ, შეიყვანეთ დასახელება');
      return;
    }

    const data = new FormData();
    data.append('file', selectedFile);
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    if (formData.duration) {
      data.append('duration', formData.duration);
    }

    const result = await uploadMedia(data);

    if (result.success) {
        toast.success('მედია წარმატებით ატვირთულია!');
      
      setFormData({ title: '', description: '', type: 'video', duration: '' });
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);
      
      
      setTimeout(() => {
        navigate('/media');
      }, 1500);
    } else {
      toast.error(result.error || 'ატვირთვა ვერ მოხერხდა');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          მედია ატვირთვა
        </h2>
        <p className="text-gray-400">
          მედია ატვირთვა
        </p>
      </div>

      <div className="card space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            მედია ტიპის არჩევა
          </label>
          <div className="grid grid-cols-2 gap-4">
            {mediaTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === type.value
                    ? 'border-tech-blue bg-tech-blue/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-white">
                  {type.label}
                </div>
              </button>
            ))}
          </div>
        </div>

            
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            მედია ატვირთვა
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-tech-blue bg-tech-blue/5'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInput}
              accept={mediaTypes.find((t) => t.value === formData.type)?.accept}
              className="hidden"
            />

            {!selectedFile ? (
              <div>
                <div className="text-6xl mb-4">📤</div>
                <p className="text-lg text-white mb-2">
                  მედია ატვირთვა
                </p>
                <p className="text-sm text-gray-400 mb-4">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  მედია ატვირთვა
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  მაქსიმალური ფაილის ზომა: 1000MB
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {preview && formData.type === 'image' && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                )}
                {preview && formData.type === 'video' && (
                  <video
                    src={preview}
                    controls
                    className="max-h-48 mx-auto rounded-lg"
                  />
                )}

                
                <div className="bg-tech-gray-light rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">
                        {mediaTypes.find((t) => t.value === formData.type)?.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatBytes(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-red-400 hover:text-red-300"
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
                </div>
              </div>
            )}
          </div>
        </div>

        
        <form onSubmit={handleSubmit} className="space-y-4">
          
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
              placeholder="შეიყვანეთ ფაილის დასახელება"
              required
            />
          </div>

          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              დეტალები
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="შეიყვანეთ ფაილის დეტალები (არასავალდებულო)"
            />
          </div>

          {(formData.type === 'video') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ვიდეოს ხანგრძლივობა (წამებში)
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

                
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="loader mr-2"></div>
                  ატვირთვა...
                </span>
              ) : (
                'ფაილის ატვირთვა'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/media')}
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

export default Upload;