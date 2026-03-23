// client/src/pages/MapView.jsx (context fetch filtered locations)
import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import api from '../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocationContext } from '../components/locations/LocationContext';



delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapView = () => {
  const { filters } = useContext(LocationContext);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        //filters params fetch 
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
        alert('Failed to load map data');
        setLoading(false);
      }
    };
    fetchLocations();
  }, [filters]); 

  if (loading) return <div className="loading">Loading map...</div>;

  return (
    <div>
      <h1 className="page-title">Cultural Venues Map</h1>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden', height: '75vh' }}>
        <MapContainer
          center={[22.3193, 114.1694]}  // Hong Kong center
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map(location => (
            <Marker
              key={location._id}
              position={[location.latitude, location.longitude]}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>
                    <Link to={`/location/${location._id}`} style={{ color: '#3498db', textDecoration: 'none' }}>
                      {location.nameEn || location.name}
                    </Link>
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong>District:</strong> {location.district}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                    <strong>Events:</strong> {location.eventCount}
                  </p>
                  <Link
                    to={`/location/${location._id}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#3498db',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Click on any marker to view venue details • Total: {locations.length} venues</p>
      </div>
    </div>
  );
};

export default MapView;