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
// server/routes/locations.js
import express from 'express';
import Location from '../models/Location.js';
import Event from '../models/Event.js';
import Comment from '../models/Comment.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Haversine formula calculates the distance between two points (km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

//Get the time in standard format
const formatToHKTime = (date) => {
  if (!date) return 'Never';
  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Hong_Kong',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  .replace(/\//g, '/')
  .replace(',', ', ');
}

// Get all venues (with filtering, distance filtering and sorting)
router.get('/', async (req, res) => {
  try {
    const { district, search, sortBy, maxDistance } = req.query;
    let query = {};

    if (district) query.district = district;
    if (search) {
      query.$text = { $search: search };
    }

    let locations = await Location.find(query);

    // CUHK location
    const cuhkLat = 22.4197;
    const cuhkLng = 114.2069;

    // calculate distance
    locations = locations.map(loc => {
      const distance = calculateDistance(loc.latitude, loc.longitude, cuhkLat, cuhkLng);
      return { ...loc.toObject(), distance: parseFloat(distance.toFixed(1)) };
    });

    // If there is maxDistance, filter
    if (maxDistance) {
      locations = locations.filter(loc => loc.distance <= parseFloat(maxDistance));
    }

    
    if (sortBy === 'name') {
      locations.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'events') {
      locations.sort((a, b) => b.eventCount - a.eventCount);
    } else if (sortBy === 'district') {
      locations.sort((a, b) => a.district.localeCompare(b.district));
    } else if (sortBy === 'distance') {
      locations.sort((a, b) => a.distance - b.distance);
    }

    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//get event count and dates
router.get('/stats', async (req, res) => {
  try {
    const totalLocations = await Location.countDocuments();
    
    const totalEvents = await Event.countDocuments(); 
    
    const latest = await Location.findOne().sort({ lastUpdated: -1 });
    const lastUpdated = latest?.lastUpdated 
      ? latest.lastUpdated 
      : new Date();

    const lastUpdatedHKString = formatToHKTime(lastUpdated);
    
    res.json({ totalLocations, totalEvents, lastUpdated: lastUpdatedHKString });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get data', errorDetail: err.message });
  }
});

// details for single venue
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get events
router.get('/:id/events', async (req, res) => {
  try {
    const events = await Event.find({ locationId: req.params.id })
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get comments for venues
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ locationId: req.params.id })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// add comments
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const comment = await Comment.create({
      locationId: req.params.id,
      userId: req.user._id,
      username: req.user.username,
      text: req.body.text
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





export default router;