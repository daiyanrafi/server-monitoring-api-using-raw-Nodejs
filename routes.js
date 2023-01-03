// application routes
// dependendies

const { aboutHandler } = require('./handlers/routeHandlers/aboutHandler');
const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');

const routes = {
    sample: sampleHandler,
    about: aboutHandler,
    user: userHandler
};

module.exports = routes;
