'use strict';

const IngestRecord = require('@models/IngestRecord');
const Vehicle = require('@models/Vehicle');

const vehicleFields = '-_id stock year make model color row yard placed';

async function getLastIngest (fields) {
  const records = await IngestRecord.find({}, fields).sort({ 'timestamps.completed': 'descending' }).limit(1).lean().exec();
  return records[0];
}

async function getVehicleCount (filter) {
  const count = await Vehicle.find(filter, vehicleFields).countDocuments();
  return count;
}

async function getVehicles (filter, offset, limit) {
  const records = await Vehicle.find(filter, vehicleFields).skip(offset).limit(limit).lean().exec();
  return records;
}

module.exports = {
  getLastIngest,
  getVehicleCount,
  getVehicles
};
