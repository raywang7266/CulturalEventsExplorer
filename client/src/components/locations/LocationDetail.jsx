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
// client/src/components/locations/LocationDetail.jsx (add event price and presenter)
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { format } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventLikes, setEventLikes] = useState({});

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      const [locRes, eventRes, commentRes, favRes] = await Promise.all([
        api.get(`/locations/${id}`),
        api.get(`/locations/${id}/events`),
        api.get(`/locations/${id}/comments`),
        user ? api.get(`/users/favorites/${id}`) : Promise.resolve({ data: { isFavorite: false } })
      ]);
      setLocation(locRes.data);
      setEvents(eventRes.data);
      setComments(commentRes.data);
      setIsFavorite(favRes.data.isFavorite);

      if (user) {
        const likesPromises = eventRes.data.map(event =>
          api.get(`/locations/events/${event._id}/like`).then(res => ({ [event._id]: res.data }))
        );
        const likesData = await Promise.all(likesPromises);
        setEventLikes(likesData.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
      }

      setLoading(false);
    } catch (err) {
      alert('Failed to load location details');
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/locations/${id}/comments`, { text: newComment });
      setComments([res.data, ...comments]);
      setNewComment('');
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${id}`);
      } else {
        await api.post(`/users/favorites/${id}`);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert('Failed to update favorite');
    }
  };

  const toggleLike = async (eventId) => {
    try {
      const res = await api.post(`/locations/events/${eventId}/like`);
      setEventLikes(prev => ({
        ...prev,
        [eventId]: { likes: res.data.likes, isLiked: res.data.isLiked }
      }));
    } catch (err) {
      alert('Failed to like event');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!location) return <div className="error">Location not found</div>;

  return (
    <div>
      <h1 className="page-title">{location.nameEn || location.name}</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2>Details</h2>
            <p><strong>Address:</strong> {location.addressEn || location.address}</p>
            <p><strong>District:</strong> {location.district}</p>
            <p>{location.description}</p>

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                <button onClick={toggleFavorite} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
                  {isFavorite ? '⭐' : '☆'}
                </button>
                <span style={{ marginLeft: '8px', color: '#7f8c8d' }}>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px', height: '400px' }}>
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.latitude, location.longitude]}>
                <Popup>{location.nameEn || location.name}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2>Upcoming Events ({events.length})</h2>
        {events.length === 0 ? (
          <p>No upcoming events at this venue.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {events.map(event => (
              <div key={event._id} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
                <h3>{event.titleEn || event.title}</h3>
                <div>
                  <strong>Dates:</strong>
                  {Array.isArray(event.date) && event.date.length > 0 ? (
                    <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                      {event.date.map((dateStr, index) => (
                        <li key={index} style={{ margin: '2px 0' }}>                        
                          {new Date(dateStr).toLocaleDateString('zh-CN')}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    ' Not specified'
                  )}
                </div>
                {/*<p><strong>Time:</strong> {event.time || 'Not specified'}</p>//need to import time and uncomment*/}

                <p><strong>Price:</strong> {event.price || 'Not specified'}</p>
                <p><strong>Presenter:</strong> {event.presenter || 'Not specified'}</p>

                <p>{event.description}</p>
                {user && eventLikes[event._id] && (
                  <button
                    onClick={() => toggleLike(event._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: eventLikes[event._id].isLiked ? '#3498db' : '#7f8c8d',
                      fontSize: '1.2rem'
                    }}
                  >
                    👍 {eventLikes[event._id].likes}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Comments ({comments.length})</h2>
        {user ? (
          <div style={{ marginBottom: '24px' }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
            <button onClick={handleAddComment} className="btn-primary" style={{ marginTop: '12px' }}>
              Post Comment
            </button>
          </div>
        ) : (
          <p><Link to="/login">Login</Link> to leave a comment</p>
        )}

        <div>
          {comments.length === 0 ? (
            <p>No comments yet. Be the first!</p>
          ) : (
            comments.map(comment => (
              <div key={comment._id} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{comment.username}</strong>
                  <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    {format(new Date(comment.createdAt), 'PPP p')}
                  </span>
                </div>
                <p>{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetail;