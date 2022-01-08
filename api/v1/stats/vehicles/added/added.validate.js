'use strict';

const dayMillis = 86400 * 1000; // 1 day
const yearMillis = dayMillis * 366; // 1 year with leap buffer
const minAcceptedDate = Date.now() - yearMillis; // 1 year ago

module.exports = function (query) {
  const data = {
    since: new Date(Date.parse(query.since) || parseInt(query.since))
  };

  // ValidatorJS date rules don't seem to accept any form (ISOString, number,
  // Date, etc.), so validate the date manually.
  if (isNaN(data.since) || data.since < minAcceptedDate || data.since > Date.now()) { return null; }

  return data;
};
