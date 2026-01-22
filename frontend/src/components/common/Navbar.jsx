import { Link } from 'react-router-dom';
import { HelpCircle, List, User } from 'lucide-react';
import { useState } from 'react';
import AccountSidebar from './AccountSidebar';

const Navbar = () => {
  const [showAccountSidebar, setShowAccountSidebar] = useState(false);

  return (
    <>
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Custom Bus Icon */}
          <Link to="/home" className="flex items-center gap-2">
            <div className="relative">
              {/* Simple Bus Icon - Border Only */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-brand-600"
              >
                {/* Bus Body */}
                <rect
                  x="8"
                  y="12"
                  width="24"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Windshield */}
                <line
                  x1="8"
                  y1="20"
                  x2="32"
                  y2="20"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                {/* Left Window */}
                <rect
                  x="11"
                  y="15"
                  width="7"
                  height="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Right Window */}
                <rect
                  x="22"
                  y="15"
                  width="7"
                  height="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
                {/* Left Wheel */}
                <circle
                  cx="14"
                  cy="28"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Right Wheel */}
                <circle
                  cx="26"
                  cy="28"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-neutral-900">
              EventBus
            </span>
          </Link>

          {/* Right Side Menu */}
          <div className="flex items-center gap-8">
            <Link
              to="/help"
              className="flex items-center gap-2 text-neutral-900 hover:text-brand-600 transition-colors font-medium"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Help</span>
            </Link>

            <Link
              to="/my-bookings"
              className="flex items-center gap-2 text-neutral-900 hover:text-brand-600 transition-colors font-medium"
            >
              <List className="w-5 h-5" />
              <span className="hidden sm:inline">My Bookings</span>
            </Link>

            <button
              onClick={() => setShowAccountSidebar(true)}
              className="flex items-center gap-2 text-neutral-900 hover:text-brand-600 transition-colors font-medium"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Account</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Account Sidebar */}
    <AccountSidebar 
      isOpen={showAccountSidebar} 
      onClose={() => setShowAccountSidebar(false)} 
    />
    </>
  );
};

export default Navbar;
