'use strict';

const data = require('../vehicles.data');

// Find vehicles that were placed at or after the given date
async function constructFilter (params) {
  // Add an extra 24 hours to compensate for ingestion and data lag
  const dayMillis = 86400 * 1000;
  const filter = {
    placed: { $gte: params.since - dayMillis }
  };
  return filter;
}

async function getResults (params) {
  const filter = await constructFilter(params);
  const res = {
    count: await data.getVehicleCount(filter),
    since: params.since
  };
  return res;
}

module.exports = {
  getResults
};
