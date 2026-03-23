// AdminDashboard.jsx
import React, { useState } from 'react';
import EventManagement from './EventManagement';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="admin-tabs" style={{
          display: 'flex',
          borderBottom: '2px solid #eee',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveTab('events')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'events' ? '#3498db' : 'transparent',
              color: activeTab === 'events' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Manage Events
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'users' ? '#3498db' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              marginLeft: '8px'
            }}
          >
            Manage Users
          </button>
        </div>

        {activeTab === 'events' && <EventManagement />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;