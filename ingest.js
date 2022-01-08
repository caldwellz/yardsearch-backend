#!/usr/bin/env node
'use strict';

require('module-alias/register');
const ingest = require('@lib/ingest');

ingest.run();
