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
// server/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    titleEn: { type: String },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    eventId: {
      type: String,
      required: true,
      unique: true
    },
    venueId: { type: String }, 
    date: { type: [String], required: true },
    time: { type: String }, // e.g. "19:30 - 21:30"
    description: { type: String },
    descriptionEn: { type: String },
    presenter: { type: String },
    price: { type: String },
    detailUrl: { type: String }, 
    ticketUrl: { type: String },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

eventSchema.index({ locationId: 1 });
eventSchema.index({ date: 1 });

export default mongoose.model("Event", eventSchema);
