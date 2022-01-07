'use strict';

const data = require('./search.data');

async function constructFilter (params) {
  const lastIngest = await data.getLastIngest('-_id timestamps.started');
  const filter = {
    lastSeen: { $gte: lastIngest.timestamps.started },
    year: { $gte: params.minYear, $lte: params.maxYear },
    // The following regexps are to account for potentially empty param strings
    make: { $regex: `^${params.make}.*$` },
    model: { $regex: `^${params.model}.*$` },
    yard: { $regex: `^${params.yard}.*$` }
  };
  return filter;
}

async function getResults (params) {
  const filter = await constructFilter(params);
  const res = {
    count: await data.getVehicleCount(filter),
    results: await data.getVehicles(filter, params.offset, params.limit)
  };
  return res;
}

module.exports = {
  getResults
};
