/**
 * Created by asafamir Vardi LTD. on 02/06/2017.
 */
var router = require('express').Router();
var auth = require('./auth');
var controller = require('./controller');

//before we send back a jwt , lets check
//the password and username match what is in the db
router.post('/login', auth.verifyUser(),controller.login);
module.exports = router;////