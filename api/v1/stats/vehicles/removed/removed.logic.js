'use strict';

const data = require('../vehicles.data');

// Find vehicles that were last seen at least params.since ago, but disappeared by the last ingest
async function constructFilter (params) {
  const lastIngest = await data.getLastIngest('timestamps.started');
  const filter = {
    lastSeen: { $gte: params.since, $lt: lastIngest.timestamps.started }
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
