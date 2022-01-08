'use strict';

const IngestRecord = require('@models/IngestRecord');
const Vehicle = require('@models/Vehicle');

async function getLastIngest (fields) {
  const fieldSelect = fields ? '-_id ' + fields : '-_id';
  const records = await IngestRecord.find({}, fieldSelect).sort({ 'timestamps.completed': 'descending' }).limit(1).lean().exec();
  return records[0];
}

async function getVehicleCount (filter) {
  const count = await Vehicle.find(filter).countDocuments();
  return count;
}

module.exports = {
  getLastIngest,
  getVehicleCount
};
