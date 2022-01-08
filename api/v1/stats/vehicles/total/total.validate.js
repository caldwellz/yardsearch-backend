'use strict';

const dayMillis = 86400 * 1000; // 1 day
const yearMillis = dayMillis * 366; // 1 year with leap buffer
const minAcceptedDate = Date.now() - yearMillis; // 1 year ago

module.exports = function (query) {
  const data = {
    // Parameter is optional, so default to today if not given a valid value
    on: new Date(Date.parse(query.on) || parseInt(query.on) || Date.now())
  };

  // ValidatorJS date rules don't seem to accept any form (ISOString, number,
  // Date, etc.), so validate the date manually.
  if (isNaN(data.on) || data.on < minAcceptedDate || data.on > Date.now()) { return null; }

  return data;
};
