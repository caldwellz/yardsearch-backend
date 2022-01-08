'use strict';

const data = require('../vehicles.data');

// Select vehicles that were placed before, but active on or after the given date
async function constructFilter (params) {
  const filter = {
    lastSeen: { $gte: params.on },
    placed: { $lte: params.on }
  };
  return filter;
}

async function getResults (params) {
  const filter = await constructFilter(params);
  const res = {
    count: await data.getVehicleCount(filter),
    on: params.on
  };
  return res;
}

module.exports = {
  getResults
};
