// Utah Pic-A-Part ingestor (utpap.com)
'use strict';

const axios = require('axios').default;
const cheerio = require('cheerio');
const config = require('config');

/* TODO: Do empty scrapes to get the makes available at each location, rather
   than assuming a specific make will be present to start with. */
const startingMake = 'FORD';
const yardPrefix = 'UTPaP ';
let vehicles = [];

function parseVehicles (data) {
  const $ = cheerio.load(data);
  $('#cars-table tr:gt(0)').each(function () {
    const car = {};
    const row = $(this);
    car.stock = row.find('td:eq(3)').html().trim();
    car.year = parseInt(row.find('td:eq(0)').html()) || 0;
    car.make = row.find('td:eq(1)').html().trim();
    car.model = row.find('td:eq(2)').html().trim();
    car.color = '';
    car.row = parseInt(row.find('td:eq(4)').html()) || 0;
    car.yard = yardPrefix + row.find('td:eq(5)').html().trim();
    const dateChunks = row.find('td:eq(6)').html().trim().split('.');
    car.placed = new Date(parseInt(dateChunks[2]) + 2000,
      parseInt(dateChunks[0]) - 1,
      parseInt(dateChunks[1]));
    vehicles.push(car);
  });
}

function parseMakes (data) {
  const makesStart = data.indexOf('modelMap');
  const makesEnd = data.indexOf(';', makesStart);
  const modelsStr = data.slice(makesStart, makesEnd).split('=')[1];
  const modelMap = JSON.parse(modelsStr);
  const makes = [];
  for (const m in modelMap) {
    if (m !== startingMake) {
      makes.push(m);
    }
  }
  parseVehicles(data);
  return makes;
}

async function fetchData (yard, make) {
  const url = `https://utpap.com/wp-content/themes/enterprise/inventory_search_files/search-inventory_${yard}.php?make=${make}`;
  const response = await axios({
    url: url,
    method: 'get',
    headers: {
      'User-Agent': config.get('ingest.userAgent')
    }
  });
  return response.data;
}

async function processYard (yard) {
  const makes = parseMakes(await fetchData(yard, startingMake));
  // TODO: Figure out how to fetch (and parse) make lists concurrently, not just yards.
  for (const m of makes) {
    parseVehicles(await fetchData(yard, m));
  }
}

module.exports = {
  load: async function () {
    vehicles = [];
    await Promise.all([processYard('ogden'), processYard('orem')]);
    return vehicles;
  }
};
