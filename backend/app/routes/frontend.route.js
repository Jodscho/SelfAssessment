module.exports = {
    v1
}

function v1(app) {
    const controller = require('../controller/frontend.controller.js');

    app.get('/api/v1/frontend/resources', controller.resources);
}
