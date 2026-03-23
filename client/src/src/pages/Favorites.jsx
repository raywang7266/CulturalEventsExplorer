// Favorites.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/auth/AuthContext';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/users/favorites');
      setFavorites(res.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load favorites');
      setLoading(false);
    }
  };

  const removeFavorite = async (locationId) => {
    if (!confirm('Remove this venue from favorites?')) return;
    try {
      await api.delete(`/users/favorites/${locationId}`);
      setFavorites(favorites.filter(f => f._id !== locationId));
    } catch (err) {
      alert('Failed to remove favorite');
    }
  };

  if (loading) return <div className="loading">Loading your favorites...</div>;

  return (
    <div>
      <h1 className="page-title">My Favorite Venues</h1>

      {favorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '1.3rem', color: '#7f8c8d', marginBottom: '20px' }}>
            You haven't added any favorite venues yet 
          </p>
          <Link to="/locations" className="btn-primary" style={{ padding: '12px 24px' }}>
            Browse All Venues →
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {favorites.map(loc => (
            <div key={loc._id} className="card" style={{ position: 'relative' }}>
              <button
                onClick={() => removeFavorite(loc._id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(231, 76, 60, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  zIndex: 10
                }}
                title="Remove from favorites"
              >
                ×
              </button>

              <h3 style={{ marginBottom: '12px' }}>
                <Link to={`/location/${loc._id}`} style={{ color: '#3498db', textDecoration: 'none' }}>
                  {loc.nameEn}
                </Link>
              </h3>
              <p><strong>District:</strong> {loc.district}</p>
              <p><strong>Address:</strong> {loc.addressEn}</p>
              <p><strong>Events:</strong> {loc.eventCount}</p>

              <div style={{ marginTop: '16px' }}>
                <Link
                  to={`/location/${loc._id}`}
                  className="btn-primary"
                  style={{ display: 'inline-block', padding: '8px 16px', fontSize: '0.95rem' }}
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;