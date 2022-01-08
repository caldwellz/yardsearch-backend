'use strict';

const data = require('../vehicles.data');

async function getIngestOn (date, fields) {
  const filter = {
    'timestamp.started': { $lte: date }
  };
  const record = await data.getIngest(filter, fields);
  return record;
}

// Get the closest prior ingest record from the given date and add up its active vehicles
async function getResults (params) {
  const record = await getIngestOn(params.on, 'vehicleCounts.added vehicleCounts.updated');
  const res = {
    count: record.vehicleCounts.added + record.vehicleCounts.updated,
    on: params.on
  };
  return res;
}

module.exports = {
  getResults
};
