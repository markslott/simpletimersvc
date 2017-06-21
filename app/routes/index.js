const apiV1Routes = require('./api_v1_routes');
module.exports = function(app, conn) {
  apiV1Routes(app, conn);
};