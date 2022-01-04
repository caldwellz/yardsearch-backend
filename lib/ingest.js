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

  record.set('failedLoaders', failedLoaders);
  record.vehicleCounts.set('fetched', vehicles.length);
  record.timestamps.set('fetched', new Date());

  return vehicles;
}

// Create bulkWrite / updateOne operations from pre-validated vehicles
async function composeUpdates (record, vehicles) {
  const ingestStarted = record.get('timeStarted');
  const updateOps = [];
  for (const v of vehicles) {
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

  return updateOps;
}

async function validateVehicles (record, vehicles) {
  const counts = {
    models: {},
    yards: {},
    years: {}
  };
  const validated = {
    passed: [],
    failed: []
  };

  for (const v of vehicles) {
    const vehicle = new Vehicle(v);
    const err = vehicle.validateSync();
    if (err) {
      validated.failed.push(v);
      continue;
    }

    // Force most of the strings uppercase
    v.stock = v.stock.toUpperCase();
    v.make = v.make.toUpperCase();
    v.model = v.model.toUpperCase();
    v.color = v.color.toUpperCase();

    // Track yard, year, make, and model counts for the ingest record
    counts.yards[v.yard] = counts.yards[v.yard] + 1 || 1;
    counts.years[v.year] = counts.years[v.year] + 1 || 1;
    counts.models[v.make] = counts.models[v.make] || {};
    counts.models[v.make][v.model] = counts.models[v.make][v.model] + 1 || 1;

    validated.passed.push(v);
  }

  // Since their contents could not be properly extracted and/or validated,
  // just save failed items in a dehydrated JSON string for later analysis.
  record.set({
    failedValidation: JSON.stringify(validated.failed),
    failedValidationCount: validated.failed.length
  });

  record.vehicleCounts.set(counts);
  record.timestamps.set('validated', new Date());

  return validated;
}

async function run () {
  const record = new IngestRecord({
    timestamps: {
      started: new Date()
    },
    vehicleCounts: {}
  });

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
  const validatedVehicles = await validateVehicles(record, vehicles);

  log.info(['ingest'], 'Vehicles validated. Composing updates...');
  const updateOps = await composeUpdates(record, validatedVehicles.passed);

  log.info(['ingest'], 'Updates composed. Upserting into database...');
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
  record.vehicleCounts.set({
    added: results.nUpserted,
    updated: results.nModified,
    total: vehiclesTotal
  });
  record.timestamps.set('completed', new Date());
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
