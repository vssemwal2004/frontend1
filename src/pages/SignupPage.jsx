import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Loader2 } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Temporary bypass - no validation needed
    const tempUser = {
      name: name || 'Guest',
      email: email || 'guest@example.com'
    };
    
    localStorage.setItem('user_data', JSON.stringify(tempUser));
    navigate('/events');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warning-50 via-white to-brand-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-600/20">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
            Create Account
          </h1>
          <p className="text-neutral-600">
            Sign up to start booking your trips
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-error-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Create a password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full flex items-center justify-center gap-2 bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-700 hover:text-brand-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
