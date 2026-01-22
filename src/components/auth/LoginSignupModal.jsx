import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginSignupModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Update mode when modal opens with a new defaultMode
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setEmail('');
      setPassword('');
      setName('');
    }
  }, [isOpen, defaultMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const tempUser = {
      name: mode === 'signup' ? name : email.split('@')[0] || 'Guest',
      email: email || 'guest@example.com'
    };
    
    localStorage.setItem('user_data', JSON.stringify(tempUser));
    onClose();
    navigate('/events');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-down">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Header with Tabs */}
        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-neutral-900 border-b-2 border-brand-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                mode === 'signup'
                  ? 'text-neutral-900 border-b-2 border-brand-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            {mode === 'login' ? 'Login to your account' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {mode === 'login' ? 'Login' : 'Sign up'}
            </button>
          </form>

          <p className="text-center text-neutral-600 text-sm mt-6">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-neutral-900 font-semibold hover:text-brand-600 transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-neutral-900 font-semibold hover:text-brand-600 transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
