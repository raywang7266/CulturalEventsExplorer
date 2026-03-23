// client/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage('Please enter both username and password');
      return;
    }

    try {
      await api.post('/auth/register', { username, password, role });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(
        'Registration failed: ' +
        (err.response?.data?.message || err.message || 'Unknown error')
      );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        padding: '2rem',
      }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 440, padding: '40px 30px' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
          Create Your Account
        </h2>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
              required
            />
            <p style={{ fontSize: '16px', color: '#666', marginTop: '4px' }}>
              At least 3 characters
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. admin123"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
              required
            />
            <p style={{ fontSize: '16px', color: '#666', marginTop: '4px' }}>
              At least 6 characters
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              <option value="admin">Administrator</option>
              <option value="user">Regular User</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1rem',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </form>

        {/* Back to Login Button */}
        <div style={{ textAlign: 'center', marginTop: '1.8rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#3498db',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Log in here
            </Link>
          </p>
        </div>

        {message && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '12px',
              borderRadius: '6px',
              textAlign: 'center',
              backgroundColor: message.includes('successful') ? '#d4edda' : '#f8d7da',
              color: message.includes('successful') ? '#155724' : '#721c24',
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;