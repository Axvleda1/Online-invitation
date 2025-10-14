import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
        toast.error('გთხოვთ, შეიყვანეთ ყველა ველი');
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      toast.success('შესვლა წარმატებით დასრულდა!');
      navigate('/media');
    } else {
      toast.error(result.error || 'შესვლა ვერ მოხერხდა');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-tech-black">
      
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-tech-black via-tech-gray to-tech-black"></div>
        

      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="card backdrop-blur-xl bg-tech-gray/80 border-2 border-tech-blue/30 shadow-2xl animate-fade-in">

          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-tech-blue blur-xl opacity-50 animate-pulse"></div>
                
              </div>
            </div>
            
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              ადმინ პანელი
            </h1>
          </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                ელექტრონული ფოსტა
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="შეიყვანეთ ელექტრონული ფოსტა"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                პაროლი
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="შეიყვანეთ პაროლი"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-tech-blue transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loader mr-2"></div>
                    <span>დამუშავება...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">შესვლა</span>
                    <div className="absolute inset-0 bg-tech-blue-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        
        <div className="mt-8 text-center">
        </div>
      </div>

      
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-tech-blue/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-tech-blue/20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-tech-blue/20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-tech-blue/20"></div>
    </div>
  );
};

export default Login;