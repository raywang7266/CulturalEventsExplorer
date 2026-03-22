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
// server/models/Location.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    venueId: {
        type: String,
        unique: true,
        sparse: true,
    },
  name: { type: String, required: true, trim: true },
  nameEn: { type: String, trim: true },
  address: { type: String, required: true },
  addressEn: { type: String },
  district: { type: String, required: true },
  districtEn: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  description: { type: String },
  descriptionEn: { type: String },
  tel: { type: String },
  website: { type: String },
  eventCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });


locationSchema.index({ district: 1 });
locationSchema.index({
  name: 'text',
  nameEn: 'text',
  address: 'text',
  addressEn: 'text',
});


export default mongoose.model('Location', locationSchema);