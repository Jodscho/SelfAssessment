// this is just a proxy that loads the real routes from this directory

module.exports = function(app) {
    require('./course/course.route').v1(app);
    require('./frontend/frontend.route').v1(app);
    require('./logger/logger.route').v1(app);
    require('./user/journal.route').v1(app);
    require('./user/pincode.route').v1(app);
    require('./user/result.route').v1(app);
}