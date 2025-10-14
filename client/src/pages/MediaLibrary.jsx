import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useMediaStore from '../store/mediaStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
  formatBytes,
  formatDate,
  getMediaTypeBadge,
  getStatusBadge,
  truncateText,
} from '../utils/helpers';
import { fileUrl } from '../utils/fileUrl';
import MediaModal from '../components/media/MediaModal';
import EditModal from '../components/media/EditModal';
import AdminLogin from '../components/AdminLogin';

const MediaLibrary = () => {
  const {
    media,
    pagination,
    filters,
    isLoading,
    fetchMedia,
    deleteMedia,
    setFilters,
    clearFilters,
  } = useMediaStore();

  const { isAdmin, isAuthenticated } = useAuthStore();

  const [viewMode, setViewMode] = useState('grid');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchMedia(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ [key]: value });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters({ search: value });
  };

  const handlePageChange = (page) => {
    fetchMedia(page);
  };

  const handleView = (item) => {
    setSelectedMedia(item);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    if (!isAdmin) {
      setShowAdminLogin(true);
      return;
    }
    setSelectedMedia(item);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setShowAdminLogin(true);
      return;
    }

    if (window.confirm('Are you sure you want to delete this media?')) {
      const result = await deleteMedia(id);
      if (result.success) {
        toast.success('Media deleted successfully');
        fetchMedia(pagination.page);
      } else {
        toast.error(result.error || 'Delete failed');
      }
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === media.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(media.map((m) => m._id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">
            მედია 
          </h2>
          <p className="text-gray-400 mt-1">
            {pagination.total} items total
          </p>
        </div>

        {isAdmin ? (
          <Link to="/upload" className="btn-primary">
            <span className="flex items-center space-x-2">
              <span>📤</span>
              <span>მედია ატვირთვა</span>
            </span>
          </Link>
        ) : (
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="btn-primary"
          >
            <span className="flex items-center space-x-2">
              <span>🔐</span>
              <span>ადმინ პანელი</span>
            </span>
          </button>
        )}
      </div>

      
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="მოძებნეთ მედია"
                value={filters.search}
                onChange={handleSearch}
                className="input-field pl-10"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          
          <div>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field"
            >
              <option value="">ყველა ტიპი</option>
              <option value="video">ვიდეო</option>
              <option value="image">სურათი</option>
             
            </select>
          </div>

          
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              <option value="">ყველა სტატუსი</option>
              <option value="active">მოქმედი</option>
              <option value="inactive">გათიშული</option>
            </select>
          </div>
        </div>

        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-gray-400">
                    {selectedItems.length} მონაცემები მონიშნულია
                </span>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-tech-blue hover:text-tech-blue-dark"
                >
                  გასუფთავება
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-tech-blue text-tech-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-tech-blue text-tech-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {filters.type || filters.status || filters.search ? (
              <button
                onClick={clearFilters}
                className="btn-secondary text-sm"
              >
                ფილტრის გასუფთავება
              </button>
            ) : null}
          </div>
        </div>
      </div>

      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loader"></div>
        </div>
      ) : media.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-bold text-white mb-2">მონაცემები ვერ მოიძებნა</h3>
          <p className="text-gray-400 mb-6">
          </p>
          {isAdmin ? (
            <Link to="/upload" className="btn-primary inline-block">
              მედიის ატვირთვა
            </Link>
          ) : (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="btn-primary inline-block"
            >
              მედიის ატვირთვის შესვლა
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {media.map((item) => (
            <MediaCard
              key={item._id}
              item={item}
              isSelected={selectedItems.includes(item._id)}
              onToggleSelect={toggleSelection}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <MediaTable
            media={media}
            selectedItems={selectedItems}
            onToggleSelect={toggleSelection}
            onSelectAll={selectAll}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        </div>
      )}

      
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            წინა
          </button>

          {[...Array(pagination.pages)].map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pagination.page === page
                    ? 'bg-tech-blue text-tech-black'
                    : 'bg-tech-gray text-white hover:bg-tech-gray-light'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
              შემდეგი
          </button>
        </div>
      )}

      
      {showModal && (
        <MediaModal
          media={selectedMedia}
          onClose={() => {
            setShowModal(false);
            setSelectedMedia(null);
          }}
        />
      )}

      {showEditModal && (
        <EditModal
          media={selectedMedia}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMedia(null);
          }}
          onSuccess={() => {
            fetchMedia(pagination.page);
            setShowEditModal(false);
          }}
        />
      )}

      {showAdminLogin && (
        <AdminLogin
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
};

const MediaCard = ({ item, isSelected, onToggleSelect, onView, onEdit, onDelete, isAdmin }) => {
  const getMediaPreview = () => {
    const mediaUrl = fileUrl(item.filePath);
    
    if (item.type === 'image') {
      return (
        <img
          src={mediaUrl}
          alt={item.title}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            console.error('Thumbnail load error:', e);
            setTimeout(() => {
              e.target.src = mediaUrl + '?t=' + Date.now();
            }, 1000);
          }}
        />
      );
    } else if (item.type === 'video') {
      return (
        <div className="relative w-full h-48 bg-tech-gray-light overflow-hidden group">
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
            controls={false}
            loop={false}
            autoPlay={false}
            poster=""
            onLoadedMetadata={(e) => {
              console.log('Video metadata loaded:', mediaUrl);
              e.target.currentTime = 0;
            }}
            onCanPlay={(e) => {
              console.log('Video can play:', mediaUrl);
              e.target.currentTime = 0;
              e.target.pause();
            }}
            onLoadStart={(e) => {
              console.log('Video load started:', mediaUrl);
            }}
            onError={(e) => {
              console.error('Video thumbnail load error:', e);
              const container = e.target.parentElement;
              container.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-tech-gray-light">
                  <div class="text-center">
                    <div class="text-4xl mb-2">🎬</div>
                    <div class="text-xs text-gray-400">ვიდეოს გამოხმაურება</div>
                  </div>
                </div>
              `;
            }}
          />
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black bg-opacity-70 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-tech-gray-light">
          <span className="text-6xl">🎵</span>
        </div>
      );
    }
  };

  return (
    <div className="card p-0 overflow-hidden hover:scale-105 transition-transform group">
      
      <div className="relative cursor-pointer" onClick={() => onView(item)}>
        {getMediaPreview()}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
          <button className="opacity-0 group-hover:opacity-100 bg-tech-blue text-tech-black w-12 h-12 rounded-full flex items-center justify-center">
            ▶
          </button>
        </div>

        
        {isAdmin && (
          <div className="absolute top-2 left-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(item._id)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
        )}

        
        <div className="absolute top-2 right-2 flex gap-2">
          <span className={`px-2 py-1 rounded text-xs ${getMediaTypeBadge(item.type)} border`}>
            {item.type}
          </span>
        </div>
      </div>

      
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{item.title}</h3>
        <p className="text-xs text-gray-400 mb-2">
          {formatBytes(item.fileSize)} • {formatDate(item.createdAt)}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
          <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(item.status)} border`}>
            {item.status === 'active' ? 'აქტიური' : 'გათიშული'}
          </span>

          {isAdmin && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="text-blue-400 hover:text-blue-300"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(item._id)}
                className="text-red-400 hover:text-red-300"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MediaTable = ({ media, selectedItems, onToggleSelect, onSelectAll, onView, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-tech-gray-light">
          <tr>
            {isAdmin && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedItems.length === media.length}
                  onChange={onSelectAll}
                  className="w-5 h-5 cursor-pointer"
                />
              </th>
            )}
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">დასახელება</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ტიპი</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">ზომა</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">სტატუსი</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">თარიღი</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">ქმედებები</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {media.map((item) => (
            <tr key={item._id} className="hover:bg-tech-gray-light transition-colors">
              {isAdmin && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => onToggleSelect(item._id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </td>
              )}
              <td className="px-4 py-3">
                <button
                  onClick={() => onView(item)}
                  className="text-white hover:text-tech-blue font-medium text-left"
                >
                  {truncateText(item.title, 40)}
                </button>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getMediaTypeBadge(item.type)} border`}>
                  {item.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {formatBytes(item.fileSize)}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(item.status)} border`}>
                  {item.status === 'active' ? 'აქტიური' : 'გათიშული'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(item)}
                    className="text-tech-blue hover:text-tech-blue-dark text-sm"
                    title="View"
                  >
                    👁️
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDelete(item._id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MediaLibrary;