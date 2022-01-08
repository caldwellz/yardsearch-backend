'use strict';

const data = require('../vehicles.data');

async function constructFilter (params) {
  const filter = {
    placed: { $gte: params.since }
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
