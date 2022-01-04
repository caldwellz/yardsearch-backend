'use strict';

const IngestRecord = require('@models/IngestRecord');

async function getYearCounts () {
  // Get the last ingest record and extract the year counts from it
  const records = await IngestRecord.find().sort({ 'timestamps.completed': 'descending' }).limit(1);
  return records[0].vehicleCounts.years;
}

module.exports = {
  getYearCounts
};
