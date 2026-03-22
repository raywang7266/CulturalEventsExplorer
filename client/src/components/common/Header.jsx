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
// Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from './ThemeContext';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // do not show header on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>Cultural Events Explorer</h1>
        </Link>
      </div>

      {user && (
        <nav className="navigation">
          <Link to="/locations">Locations</Link>
          <Link to="/map">Map View</Link>
          <Link to="/favorites">Favorites</Link>
          {isAdmin && <Link to="/admin">Admin Panel</Link>}
        </nav>
      )}

      <div className="user-info">
        {user && (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </>
        )}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            marginLeft: '15px'
          }}
          aria-label="Toggle dark mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;