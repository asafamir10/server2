/**
 * Created by asafamir Vardi LTD. on 29/05/2017.
 */
var router = require('express').Router();
var controller = require('./UserController');
var auth = require('../../auth/auth');
var checkUser = [auth.decodeToken(), auth.getFreshUser()];

var checkCurrentEditorUser = [auth.decodeToken(), auth.getCurrentEditorUser()];

router.post('/getAll',checkCurrentEditorUser, controller.getAll);
router.post('/update',controller.isUniqEmail,checkCurrentEditorUser,controller.update);
router.post('/delete',checkCurrentEditorUser,controller.delete);
router.post('/add',checkCurrentEditorUser ,controller.add);
router.post('/me',checkCurrentEditorUser,controller.me);
router.post('/register',controller.isUniqEmail,controller.register);//



module.exports = router;