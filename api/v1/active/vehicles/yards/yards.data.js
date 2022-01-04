'use strict';

const IngestRecord = require('@models/IngestRecord');

async function getYardCounts () {
  // Get the last ingest record and extract the yard counts from it
  const records = await IngestRecord.find().sort({ 'timestamps.completed': 'descending' }).limit(1);
  return records[0].vehicleCounts.yards;
}

module.exports = {
  getYardCounts
};
