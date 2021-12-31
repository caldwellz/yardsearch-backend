// Example test
'use strict';

// 'describe', 'it', 'expect', and 'type' should already
// be imported by the main test.js and/or by running Mocha.

describe('/example', () => {
  it('has a pending test');
  it('should do math correctly', () => {
    expect(1 + 1).to.equal(2);
  });
  it('should detect types correctly', () => {
    expect(type(new Date())).to.equal('Date');
  });
});
