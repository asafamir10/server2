/**
 * Created by asafamir Vardi LTD. on 02/06/2017.
 */
var User = require('../api/user/userModel');
var signToken = require('./auth').signToken;
var config = require('../config/config');

exports.login = function (req, res, next) {
    //req.user will be there from the middleware
    //verify user.then we can just create a token
    //and send it back for the client to consume

    // Create a token generator with the default settings:
    var randtoken = require('rand-token');

    // Generate a 16 character alpha-numeric token:
    var lastToken = randtoken.generate(16);
    //update user token
    User.findOne({_id: req.user._id}).populate("coupons.coupon")
    .then(function (user) {
        user.lastToken = lastToken;
        user.modified = new Date();
        user.counterTryLogin=0;
        user.lastDateLogin=new Date();

        user.save(function (err) {
            if(err) {
                res.json({"error":"שם משתמש וסיסמא לא מתאימים"});
            }
            var token = signToken(req.user._id);
            var expireTime = Date.now() + config.expireTime;
            res.json({user:user, token:token,expireTime:expireTime});
        });
    });
};