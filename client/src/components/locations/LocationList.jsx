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
// client/src/components/locations/LocationList.jsx (use context to save filters)
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
/* import LocationContext */
import { LocationContext } from './LocationContext';

const LocationList = () => {
  /* use context */
  const { filters, setFilters } = useContext(LocationContext);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchLocations();
  }, [filters]); // listen to filters change

  const fetchLocations = async () => {
    try {
      const params = {
        search: filters.search,
        district: filters.district,
        sortBy: filters.sortBy,
        maxDistance: filters.maxDistance
      };
      const res = await api.get('/locations', { params });
      setLocations(res.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load locations');
      console.error('Error details:', err.response?.data || err.message);
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(locations.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const currentPageData = locations.slice(startIndex, startIndex + pageSize);

  if (loading) return <div className="loading">Loading locations...</div>;

  const districts = [...new Set(locations.map(loc => loc.district))].sort();

  return (
    <div>
      <h1 className="page-title">Cultural Venues</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search name, address..."
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Area</label>
            <select
              value={filters.district}
              onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="name">Name</option>
              <option value="distance">Distance to CUHK</option>
              <option value="events">Number of Events</option>
              <option value="district">District</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            Max Distance to CUHK (km): {filters.maxDistance || 'No limit'}
          </label>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={filters.maxDistance || 50}
            onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: e.target.value === '50' ? '' : e.target.value }))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#7f8c8d' }}>
            <span>0 km</span>
            <span>50 km (No limit)</span>
          </div>
        </div>
      </div>

      <div className="card">
        {locations.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            No venues found matching your criteria
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa10' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>District</th>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Address</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Distance (km)</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Events</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map(loc => (
                  <tr key={loc._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px' }}>
                      <Link to={`/location/${loc._id}`} style={{ color: '#3498db', fontWeight: '600' }}>
                        {loc.nameEn || loc.name}
                      </Link>
                    </td>
                    <td style={{ padding: '16px' }}>{loc.district}</td>
                    <td style={{ padding: '16px' }}>{loc.addressEn || loc.address}</td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>{loc.distance}</td>
                    <td style={{ textAlign: 'center', padding: '16px', fontWeight: 'bold', color: '#e67e22' }}>
                      {loc.eventCount}
                    </td>
                    <td style={{ textAlign: 'center', padding: '16px' }}>
  <Link 
    to={`/location/${loc._id}`} 
    className="btn-primary" 
    style={{ 
      padding: '6px 12px',    // Reduced padding to make button smaller
      fontSize: '0.85rem',    // Slightly smaller font size
      whiteSpace: 'nowrap'    // Prevent text wrapping
    }}
  >
    View Details
  </Link>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-primary" style={{ margin: '0 5px' }}>
              Previous
            </button>
            <span style={{ margin: '0 15px' }}>
              Page {page} of {totalPages}
            </span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-primary" style={{ margin: '0 5px' }}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationList;