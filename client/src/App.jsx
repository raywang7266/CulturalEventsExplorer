/*
Student Name : QIAN Ziyue
Student ID   : 1155233243
Student Name : ZHU Chunxuan
Student ID   : 1155233366
Student Name : XIONG Meini
Student ID   : 1155233445
Student Name : WANG Ziji
Student ID   : 1155233196
Student Name : WANG Yiran
Student ID   : 1155233101
*/
// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/auth/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import LocationList from './components/locations/LocationList';
import LocationDetail from './components/locations/LocationDetail';
import MapView from './pages/MapView';
import Favorites from './pages/Favorites';
import AdminDashboard from './components/admin/AdminDashboard';

// Common
import Header from './components/common/Header';
import { LocationProvider } from './components/locations/LocationContext';


const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Router>
     
      <LocationProvider>
      
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />

              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />

              <Route path="/locations" element={
                <ProtectedRoute>
                  <LocationList />
                </ProtectedRoute>
              } />

              <Route path="/location/:id" element={
                <ProtectedRoute>
                  <LocationDetail />
                </ProtectedRoute>
              } />

              <Route path="/map" element={
                <ProtectedRoute>
                  <MapView />
                </ProtectedRoute>
              } />

              <Route path="/favorites" element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } />

              <Route path="/admin/*" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      
      </LocationProvider>
     
    </Router>
  );
}

export default App;