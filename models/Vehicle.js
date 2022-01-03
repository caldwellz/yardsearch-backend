'use strict';

const mongoose = require('mongoose');
const modelName = 'Vehicle';
const collectionName = 'vehicles';

const schema = new mongoose.Schema({
  // Stock identifier length is usually 7 for UTPaP, 8-9 for TaP
  stock: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 12
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  // Make & model length requirements are just best guesses of reasonable extremes
  make: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30
  },
  model: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30
  },
  // Sadly, not all vehicles have color information provided
  color: {
    type: String,
    required: false,
    maxLength: 10
  },
  /* May have to change this if they ever start having rows with letters,
     but current data indicates 1-3 digit rows. */
  row: {
    type: Number,
    required: true,
    min: 1,
    max: 9999
  },
  // The length requirements are, again, just best guesses of reasonable extremes
  yard: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30
  },
  placed: {
    type: Date,
    required: true,
    min: new Date(0)
  },
  /* lastSeen is internally set by the ingestor, so it needs to be part of the
     schema, but doesn't need range validation. It's used because manually
     changing updatedAt doesn't trigger an update when using bulkWrite(). */
  lastSeen: {
    type: Date
  }
});

module.exports = mongoose.model(modelName, schema, collectionName);
