'use strict';

require('module-alias/register');
const Vehicle = require('@models/Vehicle');
const dataSources = require('@ingest/');
const db = require('@lib/db');
const log = require('@lib/log');
const mongoose = require('mongoose');

function * loaderGenerator () {
  for (const d of dataSources) {
    yield d.load();
  }
}

async function fetchVehicles () {
  let vehicles = [];
  let failedLoaders = 0;

  const results = await Promise.allSettled(loaderGenerator());
  for (const r of results) {
    if (r.status === 'fulfilled') { vehicles = vehicles.concat(r.value); } else { ++failedLoaders; }
  }

  if (failedLoaders) {
    log.error(['ingest'], `Failed to fetch vehicles from ${failedLoaders} source(s).`);
  }

  return vehicles;
}

async function run () {
  /* Ensure we can connect to the database first. Currently it's less of a
     concern to leave the connection open while we fetch data than it would be
     to download it all for naught. */
  log.info(['ingest', 'start'], 'Ingest running. Connecting to the database...');
  try {
    await db.init();
  } catch (err) {
    log.crit(['ingest', 'start'], 'Failed to connect to MongoDB:');
    log.crit(['ingest', 'start'], err);
    return;
  }

  // Get the ingestion time and vehicle data
  log.info(['ingest'], 'Connected. Fetching vehicles...');
  const ingestTimestamp = new Date();
  const vehicles = await fetchVehicles();

  // Validate vehicles and create bulkWrite / updateOne operations.
  log.info(['ingest'], 'Vehicles downloaded. Beginning validation...');
  const failedValidation = [];
  const updateOps = [];
  for (const v of vehicles) {
    const vehicle = new Vehicle(v);
    const err = vehicle.validateSync();
    if (err) {
      failedValidation.push(v);
      continue;
    }

    const op = {
      updateOne: {
        filter: {
          stock: v.stock,
          yard: v.yard
        },
        update: v,
        upsert: true,
        // We use lastSeen instead of the updatedAt timestamp because manually
        // changing the latter doesn't trigger updates.
        timestamps: false
      }
    };
    op.updateOne.update.lastSeen = ingestTimestamp;
    updateOps.push(op);
  }

  // Upsert vehicles into the database
  log.info(['ingest'], 'Vehicles validated. Upserting into database...');
  let results;
  try {
    results = await Vehicle.bulkWrite(updateOps);
  } catch (err) {
    log.error(['ingest'], 'Error occured during bulkWrite:');
    log.error(['ingest'], err);
    mongoose.disconnect();
    return;
  }

  // Clean up and log results
  const totalVehicles = await Vehicle.estimatedDocumentCount();
  mongoose.disconnect();
  log.info(['ingest'], `Ingest complete. Vehicles: ${vehicles.length} loaded, ${failedValidation.length} failed validation, ${results.nUpserted} added, ${results.nModified} updated, ${totalVehicles} estimated to be in database.`);
  if (failedValidation.length) {
    log.debug(['ingest'], 'Vehicles that failed validation:');
    log.debug(['ingest'], failedValidation);
  }
}

module.exports = {
  fetchVehicles,
  run
};
