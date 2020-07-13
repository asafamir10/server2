var router = require('express').Router();
// Add headers
router.use('/auth', require('../auth/routes'));
router.use('/users', require('./user/UserRoutes'));
module.exports = router;