import { Link } from 'react-router-dom';
import { Ticket, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold">EventBook</span>
            </div>
            <p className="text-neutral-400 mb-4 max-w-md">
              Your premier destination for booking the best events. Experience seamless ticket
              booking with real-time seat selection and secure payments.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-neutral-400 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} EventBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
