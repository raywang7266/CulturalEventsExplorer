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
// server/routes/events.js
import express from 'express';
import Event from '../models/Event.js';
import Location from '../models/Location.js';
import { protect, admin } from '../middleware/auth.js';
import crypto from 'crypto';


const router = express.Router();

// Get all activities (for administrators)
router.get('/all', protect, admin, async (req, res) => {
  try {
    const events = await Event.find().populate('locationId', 'name nameEn').sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create events
router.post('/', protect, admin, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      eventId: req.body.eventId || `manual-${crypto.randomUUID()}`
    };

    const event = await Event.create(eventData);


    await Location.findByIdAndUpdate(req.body.locationId, { $inc: { eventCount: 1 } });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update events
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete events
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    await Event.findByIdAndDelete(req.params.id);
    await Location.findByIdAndUpdate(event.locationId, { $inc: { eventCount: -1 } });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get random events (populate venue)
router.get('/random', async (req, res) => {
  try {
    const randomEvent = await Event.aggregate([{ $sample: { size: 1 } }]);
    if (randomEvent.length === 0) return res.status(404).json({ message: 'No events found' });
    const populatedEvent = await Event.findById(randomEvent[0]._id).populate('locationId', 'nameEn');
    res.json(populatedEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// toggle like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user._id;
    const index = event.likes.indexOf(userId);
    let isLiked = false;
    if (index === -1) {
      event.likes.push(userId);
      isLiked = true;
    } else {
      event.likes.splice(index, 1);
    }
    await event.save();
    res.json({ likes: event.likes.length, isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get like status and count
router.get('/:id/like', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const isLiked = event.likes.includes(req.user._id);
    res.json({ likes: event.likes.length, isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;