'use strict';

require('module-alias/register');
const config = require('config');
const log = require('@lib/log');
const mongoose = require('mongoose');

function errorLogger (err) {
  log.error(['app', 'mongodb'], err.message);
}

module.exports = {
  init: async function () {
    // Connect to MongoDB and redirect error logs
    const dbConfig = config.get('mongodb');
    const connectString = `mongodb://${dbConfig.connectTo.join(',')}/${dbConfig.database}`;
    await mongoose.connect(connectString, dbConfig.options);
    log.info(['db', 'start'], `Successfully connected to '${connectString}'`);
    mongoose.connection.on('error', errorLogger);
  }
};
