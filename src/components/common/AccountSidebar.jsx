import { X, List, User, Wallet, Tag, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import LoginSignupModal from '../auth/LoginSignupModal';

const AccountSidebar = ({ isOpen, onClose }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState('login');

  const handleOpenLogin = (mode) => {
    setLoginMode(mode);
    setShowLoginModal(true);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-2xl font-bold text-neutral-900">Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-neutral-700" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-73px)]">
          {/* Login Section */}
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">
              Log in to manage your bookings
            </h3>
            <button
              onClick={() => handleOpenLogin('login')}
              className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-center font-semibold py-4 rounded-full transition-colors"
            >
              Log in
            </button>
            <p className="text-neutral-900 mt-4">
              Don't have an account?{' '}
              <button
                onClick={() => handleOpenLogin('signup')}
                className="text-neutral-900 underline font-semibold hover:text-brand-600"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* My details Section */}
          <div className="py-6 border-b border-neutral-200">
            <h3 className="px-6 text-xl font-bold text-neutral-900 mb-4">
              My details
            </h3>
            
            <Link
              to="/bookings"
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <List className="w-5 h-5 text-neutral-700" />
                <span className="text-neutral-900 font-medium">Bookings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </Link>

            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-neutral-700" />
                <span className="text-neutral-900 font-medium">Personal information</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </Link>
          </div>

          {/* Payments Section */}
          <div className="py-6 border-b border-neutral-200">
            <h3 className="px-6 text-xl font-bold text-neutral-900 mb-4">
              Payments
            </h3>
            
            <Link
              to="/wallet"
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-neutral-700" />
                <span className="text-neutral-900 font-medium">EventBus Wallet</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </Link>
          </div>

          {/* More Section */}
          <div className="py-6">
            <h3 className="px-6 text-xl font-bold text-neutral-900 mb-4">
              More
            </h3>
            
            <Link
              to="/offers"
              onClick={onClose}
              className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-neutral-700" />
                <span className="text-neutral-900 font-medium">Offers</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Login/Signup Modal */}
      <LoginSignupModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        defaultMode={loginMode}
      />
    </>
  );
};

export default AccountSidebar;
