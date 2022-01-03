'use strict';

require('module-alias/register');
const IngestRecord = require('@models/IngestRecord');
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

// Download vehicle data using the imported yard ingestors / data loaders
async function fetchVehicles (record) {
  let vehicles = [];
  let failedLoaders = 0;

  const results = await Promise.allSettled(loaderGenerator());
  for (const r of results) {
    if (r.status === 'fulfilled') { vehicles = vehicles.concat(r.value); } else { ++failedLoaders; }
  }

  if (failedLoaders) {
    log.error(['ingest'], `Failed to fetch vehicles from ${failedLoaders} source(s).`);
  }

  record.set({
    timeFetched: new Date(),
    vehiclesFetched: vehicles.length,
    failedLoaders
  });

  return vehicles;
}

// Validate vehicles and create bulkWrite / updateOne operations.
async function composeUpdates (record, vehicles) {
  const ingestStarted = record.get('timeStarted');
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
        // setting the latter doesn't trigger updates.
        timestamps: false
      }
    };
    op.updateOne.update.lastSeen = ingestStarted;
    updateOps.push(op);
  }

  // Since their contents could not be properly extracted and/or validated,
  // just save failed items in a dehydrated JSON string for later analysis.
  record.set({
    failedValidation: JSON.stringify(failedValidation),
    failedValidationCount: failedValidation.length,
    timeValidated: new Date()
  });

  return updateOps;
}

async function run () {
  const record = new IngestRecord();
  record.set('timeStarted', new Date());

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

  log.info(['ingest'], 'Connected. Fetching vehicles...');
  const vehicles = await fetchVehicles(record);

  log.info(['ingest'], 'Vehicles downloaded. Beginning validation...');
  const updateOps = await composeUpdates(record, vehicles);

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

  // Record / log results and clean up
  const vehiclesTotal = await Vehicle.estimatedDocumentCount();
  record.set({
    timeCompleted: new Date(),
    vehiclesTotal,
    vehiclesAdded: results.nUpserted,
    vehiclesUpdated: results.nModified
  });
  await record.save();
  mongoose.disconnect();

  const failedValidation = record.get('failedValidation');
  const failedValidationCount = record.get('failedValidationCount');
  log.info(['ingest'], `Ingest complete. Vehicles: ${vehicles.length} loaded, ${failedValidationCount} failed validation, ${results.nUpserted} added, ${results.nModified} updated, ${vehiclesTotal} in database.`);
  if (failedValidationCount) {
    log.debug(['ingest'], 'Vehicles that failed validation:');
    log.debug(['ingest'], failedValidation);
  }
}

module.exports = {
  run
};
