'use strict';

const Validator = require('validatorjs');

const minAcceptedYear = 1900;
const maxAcceptedYear = new Date().getFullYear() + 2;
const maxLimit = 1000;
const maxOffset = 99999;
const stringRegex = 'regex:/^[\\w\\-\\. ]*$/'; // Zero or more alphanumerics, underscores, dashes, spaces, and periods
const rules = {
  limit: `integer|min:1|max:${maxLimit}`,
  offset: `integer|min:0|max:${maxOffset}`,
  minYear: `integer|min:${minAcceptedYear}|max:${maxAcceptedYear}`,
  maxYear: `integer|min:${minAcceptedYear}|max:${maxAcceptedYear}`,
  make: stringRegex,
  model: stringRegex,
  yard: stringRegex
};

module.exports = function (query) {
  // To the user, all parameters are optional, so "fill in the blanks" as needed
  const data = {
    limit: parseInt(query.limit) || maxLimit,
    offset: parseInt(query.offset) || 0,
    minYear: parseInt(query.minYear) || minAcceptedYear,
    maxYear: parseInt(query.maxYear) || maxAcceptedYear,
    make: query.make || '',
    model: query.model || '',
    yard: query.yard || ''
  };

  // Confirm the years are in the right order
  if (data.minYear > data.maxYear) {
    return null;
  }

  const validation = new Validator(data, rules);
  return validation.passes() ? data : null;
};
