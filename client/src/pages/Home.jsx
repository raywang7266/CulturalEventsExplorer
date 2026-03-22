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
// Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { format } from 'date-fns';

// number animation component
const AnimatedNumber = ({ target, duration = 1500, startDelay = 0, color }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // if already animated, do not animate again
    if (hasAnimated.current) {
      setCount(target);
      return;
    }

    let startTime;
    let animationFrameId;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - startDelay;

      if (elapsed < 0) {
        // still in delay period
        animationFrameId = requestAnimationFrame(animateCount);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);

      // use easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * target);

      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      } else {
        setCount(target); // ensure it ends exactly at target
        hasAnimated.current = true; // mark as animated
      }
    };

    // start the animation
    animationFrameId = requestAnimationFrame(animateCount);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [target, duration, startDelay]);

  return (
    <h2 style={{
      fontSize: '3rem',
      color: color,
      marginBottom: '12px',
      fontVariantNumeric: 'tabular-nums' // ensure monospaced digits for smoother animation
    }}>
      {count.toLocaleString()}
    </h2>
  );
};

const Home = () => {
  const [stats, setStats] = useState({
    totalLocations: 10,
    totalEvents: 100,
    lastUpdated: null
  });
  const [randomEvent, setRandomEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const MAX_RETRIES = 5;
      const RETRY_DELAY_MS = 2000;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const res = await api.get('/locations/stats');
          if (res.data.totalLocations > 0) {
            setStats(res.data);
            setLoading(false);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } catch (err) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const fetchRandomEvent = async () => {
    try {
      const res = await api.get('/locations/events/random');
      setRandomEvent(res.data);
    } catch (err) {
      alert('Failed to get random event');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Loading...';
    return dateString;
  };

  return (
    <div>
      <h1 className="page-title">Welcome to Cultural Events Explorer</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {/* Cultural Venues - Display animation directly */}
        <div className="card" style={{
          textAlign: 'center',
          padding: '32px',
          transition: 'transform 0.3s ease',
          cursor: 'default'
        }}>
          <AnimatedNumber
            target={stats.totalLocations}
            duration={2000}
            startDelay={300}
            color="#3498db"
          />
          <p style={{ fontSize: '1.2rem', color: '#2c3e50' }}>Cultural Venues</p>
          {loading && (
            <div style={{
              fontSize: '0.8rem',
              color: '#7f8c8d',
              marginTop: '8px',
              animation: 'pulse 1.5s infinite'
            }}>
              Loading live data...
            </div>
          )}
        </div>

        {/* Upcoming Events - Display animation directly */}
        <div className="card" style={{
          textAlign: 'center',
          padding: '32px',
          transition: 'transform 0.3s ease',
          cursor: 'default'
        }}>
          <AnimatedNumber
            target={stats.totalEvents}
            duration={2000}
            startDelay={600} // Delay more, creating a staggered effect
            color="#e67e22"
          />
          <p style={{ fontSize: '1.2rem', color: '#2c3e50' }}>Upcoming Events</p>
          {loading && (
            <div style={{
              fontSize: '0.8rem',
              color: '#7f8c8d',
              marginTop: '8px',
              animation: 'pulse 1.5s infinite'
            }}>
              Loading live data...
            </div>
          )}
        </div>

        <div className="card" style={{
          textAlign: 'center',
          padding: '32px',
          transition: 'transform 0.3s ease',
          cursor: 'default'
        }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2c3e50', marginBottom: '8px' }}>
            Data Last Updated
          </h2>
          <div style={{
            opacity: stats.lastUpdated ? 1 : 0,
            transition: stats.lastUpdated ? 'opacity 3.1s ease' : 'none',
            fontWeight: '600',
            color: '#27ae60',
            fontSize: '1.6rem',
            fontWeight: 'bold'
          }}>
            {stats.lastUpdated ? formatDate(stats.lastUpdated) : 'Loading...'}
          </div>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '8px' }}>
            Automatically fetched from data.gov.hk
          </p>
        </div>
      </div>

      {/* Random Event Picker */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2>Random Event Picker</h2>
        <p style={{ margin: '16px 0' }}>Discover a random cultural event!</p>
        <button onClick={fetchRandomEvent} className="btn-primary" style={{ padding: '12px 24px' }}>
          Get Random Event
        </button>
        {randomEvent && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>{randomEvent.titleEn}</h3>           
            <p><strong>Venue:</strong> {randomEvent.locationId.nameEn}</p>
            <p><strong>Dates:</strong></p>
            {randomEvent.date.map((dateStr, index) => (
              <p key={index} style={{ margin: '0 0 0 20px' }}>
                {format(new Date(dateStr), 'PPP')}
              </p>
            ))}
            <p><strong>Description:</strong> {randomEvent.description || 'No description available'}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>About This Platform</h2>
        <p style={{ margin: '16px 0', lineHeight: '1.8' }}>
          This is a <strong>Single Page Application (SPA)</strong> built for CSCI 2720/ESTR2106 course project.
          All data comes from the official Hong Kong government open data platform.
        </p>
        <ul style={{ margin: '16px 0', paddingLeft: '24px', lineHeight: '1.8' }}>
          <li>Real-time cultural event information across Hong Kong</li>
          <li>Interactive map with Leaflet (no API key required)</li>
          <li>User favorites and comments system</li>
          <li>Full admin panel for event & user management</li>
          <li>Dark mode + fully responsive design</li>
          <li>First login automatically imports and caches data to MongoDB</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;