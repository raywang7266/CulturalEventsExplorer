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
// client/src/pages/Login.jsx
import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStyle, setAnimationStyle] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  // Perform circular animation
  const triggerCircleAnimation = (event) => {
    if (!buttonRef.current) return;
    
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setAnimationStyle({
      left: `${x}px`,
      top: `${y}px`,
      opacity: 1,
      transform: 'scale(0)'
    });
    
    setIsAnimating(true);
    
    // Start animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimationStyle({
          left: `${x}px`,
          top: `${y}px`,
          opacity: 1,
          transform: 'scale(40)',
          transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s'
        });
      });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    // trigger animation
    triggerCircleAnimation(e);
    
    // Log in after the animation is complete
    setTimeout(async () => {
      const result = await login(username, password);
      setLoading(false);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed');
        setIsAnimating(false);
      }
    }, 1000);
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* circle animation layer */}
      {isAnimating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(47, 144, 235, 0.8)',
            opacity: 0,
            transform: 'scale(0)',
            ...animationStyle,
            mixBlendMode: 'screen'
          }} />
        </div>
      )}

      <div className="card" style={{ 
        width: '100%', 
        maxWidth: 420,
        position: 'relative',
        zIndex: 1,
        transform: isAnimating ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.3s ease'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          color: '#2c3e50',
          position: 'relative'
        }}>
          Cultural Events Explorer
          <div style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #3498db, transparent)'
          }} />
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                backgroundColor: isAnimating ? '#f5f5f5' : 'white'
              }}
              required
              autoFocus
              disabled={isAnimating}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                transition: 'border-color 0.3s',
                backgroundColor: isAnimating ? '#f5f5f5' : 'white'
              }}
              required
              disabled={isAnimating}
            />
          </div>

          {error && (
            <div style={{
              color: '#e74c3c',
              textAlign: 'center',
              margin: '10px 0',
              fontWeight: '500',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(231, 76, 60, 0.1)'
            }}>
              {error}
            </div>
          )}

          <button
            ref={buttonRef}
            type="submit"
            disabled={loading || isAnimating}
            style={{
              position: 'relative',
              width: '100%',
              padding: '14px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.1rem',
              cursor: loading || isAnimating ? 'not-allowed' : 'pointer',
              opacity: loading || isAnimating ? 0.7 : 1,
              transition: 'all 0.3s ease',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!loading && !isAnimating) {
                e.target.style.backgroundColor = '#2980b9';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && !isAnimating) {
                e.target.style.backgroundColor = '#3498db';
              }
            }}
          >
            {loading || isAnimating ? (
              <>
                <span style={{ opacity: 0.8 }}>Logging in...</span>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, #3498db, #fff, #3498db)',
                  width: '100%',
                  animation: 'loading 1.5s infinite'
                }} />
              </>
            ) : 'Login'}
          </button>
        </form>

        {/* Registration link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#7f8c8d', fontSize: '0.95rem' }}>
            Don't have an account yet?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#3498db', 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.color = '#2980b9'}
              onMouseOut={(e) => e.target.style.color = '#3498db'}
            >
              Click here to register
            </Link>
          </p>
        </div>

        {/* Sample account prompts */}
        <div style={{ 
          marginTop: '2rem',
          textAlign: 'center', 
          color: '#7f8c8d', 
          fontSize: '0.9rem',
          padding: '1rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '6px'
        }}>
          <p><strong>Demo accounts:</strong></p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#95a5a6' }}>
            Please first register for an account
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;