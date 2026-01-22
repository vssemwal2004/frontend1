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

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Protected Routes */}
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsListPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events/:id"
                  element={
                    <ProtectedRoute>
                      <EventDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/booking/confirmation/:id"
                  element={
                    <ProtectedRoute>
                      <BookingConfirmationPage />
                    </ProtectedRoute>
                  }
                />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/events" replace />} />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/events" replace />} />
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
