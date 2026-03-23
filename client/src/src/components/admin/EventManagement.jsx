// EventManagement.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({
    title: '',
    locationId: '',
    dates: [''],
    time: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, locationsRes] = await Promise.all([
        api.get('/locations/events/all'),
        api.get('/locations')
      ]);
      setEvents(eventsRes.data);
      setLocations(locationsRes.data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load events');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validDates = form.dates.filter(date => date.trim() !== '');
    if (validDates.length === 0) {
      alert('Please add at least one valid date');
      return;
    }

    try {
      const submitForm = {
        ...form,
        date: validDates,
      };
      delete submitForm.dates;
      if (editingEvent) {
        await api.put(`/locations/events/${editingEvent._id}`, submitForm);
      } else {
        await api.post('/locations/events', submitForm);
      }
      setShowForm(false);
      setEditingEvent(null);
      setForm({ title: '', locationId: '', dates: [''], time: '', description: '' });
      fetchData();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const eventDates = Array.isArray(event.date)
      ? event.date.map(d => d.split('T')[0])
      : [''];
    setForm({
      title: event.title,
      locationId: event.locationId._id,
      dates: eventDates,
      time: event.time || '',
      description: event.description || ''
    });
    setShowForm(true);
  };

  const addDateInput = () => {
    setForm(prev => ({
      ...prev,
      dates: [...prev.dates, '']
    }));
  };


  const removeDateInput = (index) => {
    if (form.dates.length <= 1) return;
    setForm(prev => ({
      ...prev,
      dates: prev.dates.filter((_, i) => i !== index)
    }));
  };


  const handleDateChange = (index, value) => {
    setForm(prev => {
      const newDates = [...prev.dates];
      newDates[index] = value;
      return { ...prev, dates: newDates };
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event permanently?')) return;
    try {
      await api.delete(`/locations/events/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>All Events ({events.length})</h2>
        <button onClick={() => { setEditingEvent(null); setShowForm(true); }} className="btn-primary">
          Add New Event
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', backgroundColor: '#f9f9f90a' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Venue</label>
              <select
                required
                value={form.locationId}
                onChange={(e) => setForm({ ...form, locationId: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: 6, backgroundColor: '#f9f9f90a' }}
              >
                <option value="">Select venue</option>
                {locations.map(loc => (
                  <option key={loc._id} value={loc._id}>{loc.nameEn}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Event Dates (at least 1)</label>
              {form.dates.map((date, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => handleDateChange(index, e.target.value)}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#f9f9f90a' }}
                  />
                  {form.dates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDateInput(index)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        padding: '8px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDateInput}
                style={{
                  marginTop: '4px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                + Add Another Date
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Time (optional)</label>
              <input
                type="text"
                placeholder="e.g. 19:30"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                style={{ width: '100%', padding: '10px', backgroundColor: '#f9f9f90a' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '10px', borderRadius: 6, backgroundColor: '#f9f9f90a' }}
              />
            </div>

            <div>
              <button type="submit" className="btn-primary" style={{ marginRight: '12px' }}>
                {editingEvent ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingEvent(null); }} style={{ padding: '10px 20px' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', backgroundColor: '#f9f9f90a' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Venue</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px' }}>Time</th>
              <th style={{ textAlign: 'center', padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px' }}>{item.titleEn || item.title}</td>
                <td style={{ padding: '16px' }}>{item.locationId.nameEn || item.locationTd.name}</td>
                <td style={{ padding: '16px' }}>
                  {Array.isArray(item.date) && item.date.length > 0
                    ? item.date.map((d, i) => (
                      <div key={i}>{format(new Date(d), 'PPP')}</div>
                    ))
                    : '-'}
                </td>
                <td style={{ padding: '16px' }}>{item.time || '-'}</td>
                <td style={{ textAlign: 'center', padding: '16px' }}>
                  <button onClick={() => handleEdit(item)} style={{ marginRight: '8px', background: '#f39c12', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
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

export default EventManagement;