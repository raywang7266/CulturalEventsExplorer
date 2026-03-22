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
// server/routes/users.js
import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// get user's favorite venues
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// add favorites
router.post('/favorites/:locationId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favorites: req.params.locationId }
    });
    res.status(200).json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete favorites
router.delete('/favorites/:locationId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favorites: req.params.locationId }
    });
    res.status(200).json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// check if it is already favorites
router.get('/favorites/:locationId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const isFavorite = user.favorites.includes(req.params.locationId);
    res.json({ isFavorite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === for admin ===

// get all users
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// create new user
router.post('/', protect, admin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
     if (!username || username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.create({ username, password, role });
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update user
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username && username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }
    if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (username) user.username = username;
    if (role) user.role = role;
    if (password) user.password = password;
    const updatedUser = await user.save();
    const userWithoutPassword = updatedUser.toObject();
    delete userWithoutPassword.password;
    res.json({ message: 'User updated', user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete user
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;