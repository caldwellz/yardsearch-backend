'use strict';

module.exports = {
  // Process .js, .cjs, .mjs, .jsx, & .json files
  '*.?(c|m)js?(x|on)': function (filenames) {
    // See eslintrc for what quality & style issues are checked for and/or fixed.
    const commands = [`eslint --cache --no-ignore --fix ${filenames.join(' ')}`];
    return commands;
  }
};
