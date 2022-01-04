'use strict';

const data = require('./yards.data');

async function getProcessedData () {
  // Convert yard counts to just an array of yard names
  const yardCounts = await data.getYardCounts();
  const yards = [];
  for (const yard in yardCounts) {
    yards.push(yard);
  }

  return yards;
}

module.exports = {
  getProcessedData
};
