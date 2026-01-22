import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  Route,
  Calendar,
  TrendingUp,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { handleApiError } from '@/utils/helpers';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('routes');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [routeForm, setRouteForm] = useState({
    source: '',
    destination: '',
    distance: '',
    duration: '',
    price: '',
  });

  const [busForm, setBusForm] = useState({
    busNumber: '',
    busName: '',
    busType: 'AC',
    totalSeats: 40,
    amenities: [],
  });

  const [scheduleForm, setScheduleForm] = useState({
    routeId: '',
    busId: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    validFrom: '',
    validTo: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, routesData, busesData, schedulesData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllRoutes(),
        adminService.getAllBuses(),
        adminService.getAllSchedules(),
      ]);
      setStats(statsData.data);
      setRoutes(routesData.data || []);
      setBuses(busesData.data || []);
      setSchedules(schedulesData.data || []);
    } catch (err) {
      console.error('Error loading dashboard:', handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin/login');
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'route') {
      setRouteForm(item ? {
        source: item.from || '',
        destination: item.to || '',
        distance: item.distance || '',
        duration: item.duration || '',
        price: item.baseFare || '',
      } : {
        source: '',
        destination: '',
        distance: '',
        duration: '',
        price: '',
      });
    } else if (type === 'bus') {
      setBusForm(item || {
        busNumber: '',
        busName: '',
        busType: 'AC',
        totalSeats: 40,
        amenities: [],
      });
    } else if (type === 'schedule') {
      setScheduleForm(item ? {
        routeId: item.route?._id || '',
        busId: item.bus?._id || '',
        departureTime: item.departureTime || '',
        arrivalTime: item.arrivalTime || '',
        fare: item.fare || '',
        availableDays: item.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split('T')[0] : '',
        validTo: item.validTo ? new Date(item.validTo).toISOString().split('T')[0] : '',
      } : {
        routeId: '',
        busId: '',
        departureTime: '',
        arrivalTime: '',
        fare: '',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        validFrom: '',
        validTo: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setEditingItem(null);
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting route:', routeForm);
      if (editingItem) {
        await adminService.updateRoute(editingItem._id, routeForm);
      } else {
        const result = await adminService.createRoute(routeForm);
        console.log('Route created:', result);
      }
      await loadDashboardData();
      closeModal();
    } catch (err) {
      console.error('Route submit error:', err);
      alert(handleApiError(err));
    }
  };

  const handleBusSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await adminService.updateBus(editingItem._id, busForm);
      } else {
        await adminService.createBus(busForm);
      }
      await loadDashboardData();
      closeModal();
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting schedule:', scheduleForm);
      console.log('Available days:', scheduleForm.availableDays);
      
      if (editingItem) {
        await adminService.updateSchedule(editingItem._id, scheduleForm);
      } else {
        const result = await adminService.createSchedule(scheduleForm);
        console.log('Schedule created:', result);
      }
      await loadDashboardData();
      closeModal();
    } catch (err) {
      console.error('Schedule submit error:', err);
      alert(handleApiError(err));
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await adminService.deleteSchedule(id);
        await loadDashboardData();
      } catch (err) {
        alert(handleApiError(err));
      }
    }
  };

  const toggleDay = (day) => {
    setScheduleForm(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleDeleteRoute = async (id) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await adminService.deleteRoute(id);
        await loadDashboardData();
      } catch (err) {
        alert(handleApiError(err));
      }
    }
  };

  const handleDeleteBus = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await adminService.deleteBus(id);
        await loadDashboardData();
      } catch (err) {
        alert(handleApiError(err));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Total Routes</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{stats?.totalRoutes || 0}</p>
              </div>
              <Route className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Total Buses</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{stats?.totalBuses || 0}</p>
              </div>
              <Bus className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Total Schedules</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{stats?.totalSchedules || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">
                  ₹{stats?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-neutral-200">
            <nav className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('routes')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'routes'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Routes
              </button>
              <button
                onClick={() => setActiveTab('buses')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'buses'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Buses
              </button>
              <button
                onClick={() => setActiveTab('schedules')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'schedules'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Schedules
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Routes Tab */}
            {activeTab === 'routes' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">Manage Routes</h2>
                  <button
                    onClick={() => openModal('route')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Route
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Source</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Destination</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Distance</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Duration</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route) => (
                        <tr key={route._id} className="border-b border-neutral-100">
                          <td className="py-3 px-4">{route.from}</td>
                          <td className="py-3 px-4">{route.to}</td>
                          <td className="py-3 px-4">{route.distance} km</td>
                          <td className="py-3 px-4">{route.duration}</td>
                          <td className="py-3 px-4">₹{route.baseFare}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal('route', route)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoute(route._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Buses Tab */}
            {activeTab === 'buses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">Manage Buses</h2>
                  <button
                    onClick={() => openModal('bus')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Bus
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buses.map((bus) => (
                    <div key={bus._id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-neutral-900">{bus.busName}</h3>
                          <p className="text-sm text-neutral-600">{bus.busNumber}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('bus', bus)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-neutral-600">
                          <span className="font-medium">Type:</span> {bus.busType}
                        </p>
                        <p className="text-neutral-600">
                          <span className="font-medium">Seats:</span> {bus.totalSeats}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">Manage Schedules</h2>
                  <button
                    onClick={() => openModal('schedule')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add Schedule
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Route</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Bus</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Departure</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Arrival</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Fare</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Days</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Valid Period</th>
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule._id} className="border-b border-neutral-100">
                          <td className="py-3 px-4">
                            {schedule.route?.from} → {schedule.route?.to}
                          </td>
                          <td className="py-3 px-4">
                            {schedule.bus?.busNumber}
                          </td>
                          <td className="py-3 px-4">{schedule.departureTime}</td>
                          <td className="py-3 px-4">{schedule.arrivalTime}</td>
                          <td className="py-3 px-4">₹{schedule.fare}</td>
                          <td className="py-3 px-4">
                            <div className="text-xs">
                              {schedule.availableDays?.slice(0, 3).map(d => d.slice(0, 3)).join(', ')}
                              {schedule.availableDays?.length > 3 && '...'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(schedule.validFrom).toLocaleDateString()} - {new Date(schedule.validTo).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openModal('schedule', schedule)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(schedule._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {schedules.length === 0 && (
                    <p className="text-center py-8 text-neutral-500">No schedules created yet. Click "Add Schedule" to create one.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {modalType === 'route' ? 'Route' : modalType === 'bus' ? 'Bus' : 'Schedule'}
            </h3>

            {modalType === 'route' && (
              <form onSubmit={handleRouteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Source</label>
                  <input
                    type="text"
                    value={routeForm.source}
                    onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Destination</label>
                  <input
                    type="text"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={routeForm.distance}
                    onChange={(e) => setRouteForm({ ...routeForm, distance: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Duration (hrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={routeForm.duration}
                    onChange={(e) => setRouteForm({ ...routeForm, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={routeForm.price}
                    onChange={(e) => setRouteForm({ ...routeForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-neutral-200 text-neutral-900 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalType === 'bus' && (
              <form onSubmit={handleBusSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Bus Number</label>
                  <input
                    type="text"
                    value={busForm.busNumber}
                    onChange={(e) => setBusForm({ ...busForm, busNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Bus Name</label>
                  <input
                    type="text"
                    value={busForm.busName}
                    onChange={(e) => setBusForm({ ...busForm, busName: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Bus Type</label>
                  <select
                    value={busForm.busType}
                    onChange={(e) => setBusForm({ ...busForm, busType: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                    <option value="Sleeper">Sleeper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Total Seats</label>
                  <input
                    type="number"
                    value={busForm.totalSeats}
                    onChange={(e) => setBusForm({ ...busForm, totalSeats: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-neutral-200 text-neutral-900 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {modalType === 'schedule' && (
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Select Route</label>
                  <select
                    value={scheduleForm.routeId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, routeId: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Choose a route</option>
                    {routes.map(route => (
                      <option key={route._id} value={route._id}>
                        {route.from} → {route.to} ({route.distance} km)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Select Bus</label>
                  <select
                    value={scheduleForm.busId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, busId: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Choose a bus</option>
                    {buses.map(bus => (
                      <option key={bus._id} value={bus._id}>
                        {bus.busNumber} - {bus.busName} ({bus.busType}, {bus.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1">Departure Time</label>
                    <input
                      type="time"
                      value={scheduleForm.departureTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, departureTime: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1">Arrival Time</label>
                    <input
                      type="time"
                      value={scheduleForm.arrivalTime}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, arrivalTime: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-1">Fare (₹)</label>
                  <input
                    type="number"
                    value={scheduleForm.fare}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, fare: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-900 mb-2">Available Days</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          scheduleForm.availableDays.includes(day)
                            ? 'bg-red-600 text-white'
                            : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1">Valid From</label>
                    <input
                      type="date"
                      value={scheduleForm.validFrom}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, validFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-900 mb-1">Valid To</label>
                    <input
                      type="date"
                      value={scheduleForm.validTo}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, validTo: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-neutral-200 text-neutral-900 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
