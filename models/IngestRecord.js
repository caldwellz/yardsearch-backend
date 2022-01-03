'use strict';

const mongoose = require('mongoose');
const modelName = 'IngestRecord';
const collectionName = 'ingests';

const schema = new mongoose.Schema({
  timeStarted: {
    type: Date
  },
  timeFetched: {
    type: Date
  },
  timeValidated: {
    type: Date
  },
  timeCompleted: {
    type: Date
  },
  vehiclesFetched: {
    type: Number
  },
  vehiclesAdded: {
    type: Number
  },
  vehiclesUpdated: {
    type: Number
  },
  vehiclesTotal: {
    type: Number
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
