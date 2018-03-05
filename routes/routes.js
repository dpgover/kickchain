const routes = require('next-routes')();

routes
  .add('/campaigns/create', '/campaigns/create')
  .add('/campaigns/:address', '/campaigns/show')
;

module.exports = routes;
