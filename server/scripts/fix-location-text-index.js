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
import mongoose from 'mongoose';
import Location from '../models/Location.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cultural-events';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const collection = mongoose.connection.collection('locations');
  const indexes = await collection.indexes();

  const textIndexes = indexes.filter(i => i.key?._fts === 'text');

  for (const idx of textIndexes) {
    console.log('Dropping text index:', idx.name);
    await collection.dropIndex(idx.name);
  }

  await Location.syncIndexes();
  console.log('Text index rebuilt successfully');

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
