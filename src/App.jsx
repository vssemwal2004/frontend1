import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { BookingProvider } from '@/contexts/BookingContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import EventsListPage from '@/pages/EventsListPage';
import EventDetailPage from '@/pages/EventDetailPage';
import BookingConfirmationPage from '@/pages/BookingConfirmationPage';
import HomePage from '@/home/HomePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Routes */}
                <Route
                  path="/events"
                  element={<EventsListPage />}
                />
                <Route
                  path="/events/:id"
                  element={<EventDetailPage />}
                />
                <Route
                  path="/booking/confirmation/:id"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmationPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
