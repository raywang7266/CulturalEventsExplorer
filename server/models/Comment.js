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
// server/models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: { type: String, required: true },
  text: { type: String, required: true, maxlength: 500 }
}, { timestamps: true });

commentSchema.index({ locationId: 1 });

export default mongoose.model('Comment', commentSchema);