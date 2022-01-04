'use strict';

const data = require('./models.data');

async function getProcessedData () {
  // Convert model counts to just arrays of model names
  const modelCounts = await data.getModelCounts();
  const makes = {};
  for (const make in modelCounts) {
    const models = [];
    for (const model in modelCounts[make]) {
      models.push(model);
    }
    makes[make] = models;
  }

  return makes;
}

module.exports = {
  getProcessedData
};
