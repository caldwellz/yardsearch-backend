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
