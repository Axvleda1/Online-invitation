import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);    
  const [mobileOpen, setMobileOpen] = useState(false);     

  
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [mobileOpen]);

  const navigation = [
    { name: 'მედია ', path: '/media', icon: '🎬' },
    { name: 'მედიის ატვირთვა', path: '/upload', icon: '📤' },
    { name: 'ღონისძიებები', path: '/events', icon: '📅' },
    { name: 'პარამეტრები', path: '/settings', icon: '⚙️' },
    { name: 'სია', path: '/guests', icon: '👥' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('გამოსვლა წარმატებით დასრულდა');
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (p) => location.pathname === p;

  return (
    <div className="flex h-screen bg-tech-black overflow-hidden">
      
      <aside
        className={`hidden md:flex ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-tech-gray border-r border-gray-800 transition-all duration-300 flex-col`}
      >
        
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3">
              <span className="font-display font-bold text-gradient text-lg">ადმინ პანელი</span>
            </div>
          ) : (
            <div className="text-2xl mx-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                <path strokeWidth="2" strokeLinecap="round" d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-tech-blue transition-colors"
            aria-label="Toggle sidebar width"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-tech-blue text-tech-black font-semibold'
                  : 'text-gray-400 hover:bg-tech-gray-light hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        
        <div className="p-4 border-t border-gray-800">
          <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-tech-blue rounded-full flex items-center justify-center text-tech-black font-bold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button onClick={handleLogout} className="mt-3 w-full btn-secondary text-sm py-2">
              გამოსვლა
            </button>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <>
          
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed inset-0 z-50 bg-tech-gray md:hidden flex flex-col">
            
            <div className="h-16 px-4 border-b border-gray-800 flex items-center justify-between">
              <span className="font-display font-bold text-gradient text-lg">მენიუ</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-300 hover:text-white"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            
            <nav className="flex-1 overflow-auto p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-4 rounded-lg text-lg ${
                    isActive(item.path)
                      ? 'bg-tech-blue text-tech-black font-semibold'
                      : 'text-gray-200 bg-tech-gray-light/60 hover:bg-tech-gray-light'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-tech-blue rounded-full flex items-center justify-center text-tech-black font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-sm px-3 py-2">
                  გამოსვლა
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <header className="h-16 bg-tech-gray border-b border-gray-800 flex items-center justify-between px-4 sm:px-6">
          
          <div className="flex items-center gap-3">
            
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-display font-bold text-white">
              {
                (
                  [
                    ...navigation,
                    { name: 'დასამართი', path: '/dashboard' },
                  ].find((n) => n.path === location.pathname) || { name: 'დასამართი' }
                ).name
              }
            </h1>
          </div>

          
        </header>

              
        <main className="flex-1 overflow-auto bg-tech-black p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
