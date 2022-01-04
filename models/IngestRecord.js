'use strict';

const mongoose = require('mongoose');
const modelName = 'IngestRecord';
const collectionName = 'ingests';

const schema = new mongoose.Schema({
  timestamps: {
    type: new mongoose.Schema({
      started: Date,
      fetched: Date,
      validated: Date,
      completed: Date
    })
  },
  vehicleCounts: {
    type: new mongoose.Schema({
      fetched: Number,
      added: Number,
      updated: Number,
      total: Number,
      models: Object
    })
  },
  failedLoaders: {
    type: Number
  },
  failedValidation: {
    type: String
  },
  failedValidationCount: {
    type: Number
  }
});

module.exports = mongoose.model(modelName, schema, collectionName);
