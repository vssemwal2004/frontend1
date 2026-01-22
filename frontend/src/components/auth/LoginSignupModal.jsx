import { useState, useEffect } from 'react';
import { X, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { handleApiError } from '@/utils/helpers';

const LoginSignupModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState(defaultMode);
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setStep('credentials');
      setEmail('');
      setPassword('');
      setName('');
      setOtp('');
      setError('');
      setResendTimer(0);
    }
  }, [isOpen, defaultMode]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const response = await authService.login({ email, password });
        if (response.requiresOTP) {
          setStep('otp');
          setResendTimer(60); // 60 seconds before can resend
        }
      } else {
        const response = await authService.signup({ name, email, password });
        if (response.requiresOTP) {
          setStep('otp');
          setResendTimer(60);
        }
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.verifyOTP(email, otp);
      if (response.success) {
        setUser(response.user);
        onClose();
        navigate('/');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.resendOTP(email);
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-down">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        <div className="border-b border-neutral-200">
          <div className="flex">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-4 text-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'text-neutral-900 border-b-2 border-red-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-4 text-lg font-semibold transition-all ${
                mode === 'signup'
                  ? 'text-neutral-900 border-b-2 border-red-600'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="p-8">
          {step === 'credentials' ? (
            <>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                {mode === 'login' ? 'Login to your account' : 'Create your account'}
              </h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

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
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Logging in...' : 'Signing up...'}
                </>
              ) : (
                mode === 'login' ? 'Login' : 'Sign up'
              )}
            </button>
          </form>

          <p className="text-center text-neutral-600 text-sm mt-6">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-neutral-900 font-semibold hover:text-red-600 transition-colors"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-neutral-900 font-semibold hover:text-red-600 transition-colors"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </>
      ) : (
        /* OTP Verification Step */
        <>
          <button
            onClick={handleBackToCredentials}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Verify your email
            </h2>
            <p className="text-neutral-600 text-sm">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-neutral-900 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-neutral-500 mt-2 text-center">
                OTP expires in 10 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            {resendTimer > 0 ? (
              <p className="text-neutral-600 text-sm">
                Resend OTP in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={loading}
                className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm"
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;
