// Tear-A-Part ingestor (tearapart.com)
'use strict';

const axios = require('axios').default;

function transformVehicles (data) {
  const vehicles = [];
  for (const v of data.products) {
    if (v.yard_date) {
      const dateChunks = v.yard_date.trim().split('-');
      const car = {
        stock: v.stocknumber,
        year: parseInt(v.iyear) || 0,
        make: v.make,
        model: v.model,
        color: v.color,
        row: parseInt(v.vehicle_row) || 0,
        yard: v.yard_name,
        placed: new Date(parseInt(dateChunks[2]),
          parseInt(dateChunks[0]) - 1,
          parseInt(dateChunks[1]))
      };
      if (String(car.row) !== v.vehicle_row) {
        throw new Error(`Tear-A-Part: Vehicle row parsing issue: '${car.row}' vs '${v.vehicle_row}'`);
      }
      vehicles.push(car);
    }
  }
  return vehicles;
}

async function fetchVehicles (nonce) {
  if (nonce && nonce.length) {
    const query = `sif_verify_request=${nonce}&sif_form_field_make=Any&action=sif_search_products`;
    const response = await axios({
      url: 'https://tearapart.com/wp-admin/admin-ajax.php',
      method: 'post',
      data: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': query.length,
        'User-Agent': 'YardStats.tk data ingestor'
      }
    });

    // Axios decodes the JSON automatically
    return response.data;
  } else {
    throw new Error('Tear-A-Part: Received empty nonce');
  }
}

async function fetchNonce () {
  // The request_verify nonce changes every day, so we have to find it
  const response = await axios({
    url: 'https://tearapart.com/used-auto-parts/inventory/',
    method: 'get',
    headers: {
      'User-Agent': 'YardStats.tk data ingestor'
    }
  });
  const page = response.data;
  const nonceTagIndex = page.indexOf('sif_ajax_nonce');
  const nonceStart = page.indexOf(':', nonceTagIndex) + 2;
  const nonceEnd = page.indexOf(',', nonceTagIndex) - 1;
  return page.slice(nonceStart, nonceEnd);
}

async function load () {
  const nonce = await fetchNonce();
  const vehicles = transformVehicles(await fetchVehicles(nonce));
  return vehicles;
}

module.exports = {
  load
};
