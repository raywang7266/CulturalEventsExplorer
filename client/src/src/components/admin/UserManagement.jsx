// UserManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/global.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({ username: '', password: '' });
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load users');
      setLoading(false);
    }
  };
  const validateField = (name, value) => {
    let error = '';
    if (name === 'username') {
      if (value.trim().length < 3) {
        error = 'Username must be at least 3 characters';
      }
    }
    if (name === 'password' && value !== '') {
      if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    }
    return error;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const usernameError = validateField('username', form.username);
    const passwordError = editingUser ? '' : validateField('password', form.password);

    if (usernameError || (passwordError && !editingUser)) {
      setFormErrors({ username: usernameError, password: passwordError });
      alert('Please fix the form errors before submitting');
      return;
    }
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, form);
      } else {
        await api.post('/users', form);
      }
      setShowForm(false);
      setEditingUser(null);
      setForm({ username: '', password: '', role: 'user' });
      setFormErrors({ username: '', password: '' });
      fetchUsers();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '', // do not prefill password
      role: user.role
    });
    setFormErrors({ username: '', password: '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredUsers = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Users ({users.length})</h2>
        <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="btn-primary">
          Add New User
        </button>
      </div>

      <input
        type="text"
        placeholder="Search users by username..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#f9f9f90a' }}
      />

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, username: value });
                  const error = validateField('username', value);
                  setFormErrors({ ...formErrors, username: error });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: formErrors.username ? '1px solid #e74c3c' : '1px solid #ddd'
                }}
              />
              {formErrors.username && (
                <p style={{ color: '#e74c3c', margin: '4px 0 0 0', fontSize: '14px' }}>
                  {formErrors.username}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Password {editingUser ? '(leave blank to keep current)' : ''}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, password: value });
                  const error = validateField('password', value);
                  setFormErrors({ ...formErrors, password: error });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: formErrors.password ? '1px solid #e74c3c' : '1px solid #ddddddff'
                }}
                required={!editingUser}
              />
              {formErrors.password && (
                <p style={{ color: '#e74c3c', margin: '4px 0 0 0', fontSize: '14px' }}>
                  {formErrors.password}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 6 }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <button type="submit" className="btn-primary" style={{ marginRight: '12px' }}>
                {editingUser ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8303002' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Username</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Joined</th>
              <th style={{ textAlign: 'center', padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>{user.username}</td>
                <td style={{ padding: '16px' }}>{user.role}</td>
                <td style={{ padding: '16px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ textAlign: 'center', padding: '16px' }}>
                  <button onClick={() => handleEdit(user)} style={{ marginRight: '8px', background: '#f39c12', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;