'use strict';

describe('/vehicles', () => {
  require('./vehicles.mock');
  require('./models/models.test');
  // TODO: require('./search/search.test');
  require('./yards/yards.test');
  require('./years/years.test');
});
