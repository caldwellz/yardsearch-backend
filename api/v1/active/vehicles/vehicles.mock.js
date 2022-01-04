'use strict';

const IngestRecord = require('@models/IngestRecord');

const mockDate = new Date();
const mockRecord = new IngestRecord({
  timestamps: {
    started: mockDate,
    fetched: mockDate,
    validated: mockDate,
    completed: mockDate
  },
  vehicleCounts: {
    models: {
      FAKEMAKE: {
        'FAKE MODEL 1': 1,
        'FAKE MODEL 2': 2
      }
    },
    yards: [
      'MOCK YARD',
      'MOCK YARD 2'
    ],
    years: [
      '1900',
      '1901'
    ],
    fetched: 3,
    added: 1,
    updated: 2,
    total: 4
  },
  failedLoaders: 0,
  failedValidation: '[]',
  failedValidationCount: 0
});

// Add the record to the testing database
before(async () => {
  await mockRecord.save();
});

// Clean up afterwards
after(async () => {
  await mockRecord.remove();
});
