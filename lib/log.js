'use strict';

const config = require('config');
const type = require('type-detect');

// Convert the array of configured log tags into a truthy object
const consoleTags = config.get('logger.consoleLogTags');
const consoleFilter = {};
for (const tag of consoleTags) {
  consoleFilter[tag] = true;
}

// Filter logs based on configured log tags, and then forward
// to the console (and possibly other targets in the future).
const hrTime = config.get('logger.highResolutionTime');
function log (tags, data) {
  for (const tag of tags) {
    if (consoleFilter[tag]) {
      const time = process.hrtime();
      const ns = String(time[1]).padStart(9, '0');
      const subSeconds = hrTime ? ns : ns.slice(0, 3);
      const ts = `${time[0]}.${subSeconds}`;
      if (type(data) === 'string' || type(data) === 'number') {
        console.log(
                `[${ts}][${tags.join(',')}] ${data}`
        );
      } else {
        console.log(`[${ts}][${tags.join(',')}] ${JSON.stringify(data)}`);
      }
      return;
    }
  }
}

module.exports = {
  log,
  crit: (tags, data) => log(['crit'].concat(tags), data),
  error: (tags, data) => log(['error'].concat(tags), data),
  warn: (tags, data) => log(['warn'].concat(tags), data),
  info: (tags, data) => log(['info'].concat(tags), data),
  debug: (tags, data) => log(['debug'].concat(tags), data)
};
