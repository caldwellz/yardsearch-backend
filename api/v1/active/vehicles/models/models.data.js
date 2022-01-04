'use strict';

const IngestRecord = require('@models/IngestRecord');

async function getModelCounts () {
  // Get the last ingest record and extract the vehicleModelCounts field from it
  const records = await IngestRecord.find().sort({ timeCompleted: 'descending' }).limit(1);
  return records[0].vehicleCounts.models;
}

module.exports = {
  getModelCounts
};
