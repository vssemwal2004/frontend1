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
import MyBookingsPage from '@/pages/MyBookingsPage';
import HomePage from '@/home/HomePage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <Routes>
            {/* Admin Routes (No Navbar/Footer) */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

            {/* Regular Routes with Navbar/Footer */}
            <Route
              path="*"
              element={
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
                        path="/my-bookings"
                        element={
                          <ProtectedRoute>
                            <MyBookingsPage />
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
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
