const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/truestate';
async function connect() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
}
module.exports = { connect, mongoose };
