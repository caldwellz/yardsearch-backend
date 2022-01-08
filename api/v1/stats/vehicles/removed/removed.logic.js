'use strict';

const data = require('../vehicles.data');

// Find vehicles that were last seen at least params.since ago, but disappeared by the last ingest
async function constructFilter (params) {
  // Add an extra 24 hours to compensate for ingestion and data lag
  const dayMillis = 86400 * 1000;
  const lastIngest = await data.getLastIngest('timestamps.started');
  const filter = {
    lastSeen: { $gte: params.since - dayMillis, $lt: lastIngest.timestamps.started }
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
