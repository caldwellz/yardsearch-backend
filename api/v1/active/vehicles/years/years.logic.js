'use strict';

const data = require('./years.data');

async function getProcessedData () {
  // Convert year counts to just an array of year names
  const yearCounts = await data.getYearCounts();
  const years = [];
  for (const year in yearCounts) {
    years.push(year);
  }

  return years;
}

module.exports = {
  getProcessedData
};
