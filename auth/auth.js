/**
 * Created by asafamir Vardi LTD. on 02/06/2017.
 */
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var config = require('../config/config');
var checkToken = expressJwt({secret : config.secrets.jwt, algorithms: ['RS256'] });
var User = require('../api/user/userModel');
exports.decodeToken = function () {
    return function (req, res, next) {
        // make it optional to place token on query string
        //if it is , place it on the headers where it should be
        //so checkToken can see it.see follow the 'Bearer ' format
        // so checkToken can see it and decode it
        if(req.query && req.query.hasOwnProperty('access_token')){
            req.headers.authorization = 'Bearer ' + req.query.access_token;
        }
        //this will next if token is valid
        //send error if its not.it will attached
        //the decode token to req user
        checkToken(req, res, next);
    }
};
exports.getCurrentEditorUser = function () {

    return function (req, res, next) {
        User.findById(req.body._id).populate("coupons.coupon")
            .then(function (user) {
                if(!user){
                    //if no user is found.it was
                    //a valid jwt but didnt decode
                    //to a real user in our db.ether the user was deleted
                    //since the client got the jwt from some other source
                    res.status(401).send('You dont have admin permission');
                }
                else {
                        req.user = user;
                        next();
                }
            },function (err) {
                next(err);
            });
    }
};
exports.verifyUser = function () {
    return function (req, res, next) {
        var email = req.body.email;
        var password = req.body.password;
        var lastToken = req.body.lastToekn;
        //if no username pr password then stop
        if(!email || !password){
            //res.status(400).send('you need a username and password');
            res.json({statusCode:400,error:'אתה צריך שם משתמש וסיסמא'});
            return;
        }
        //look user up in the db so we cab check
        //if the passwords match for the username
        var  locked = false;
        User.findOne({email:email})
            .then(function (user) {

                if(!user){
                    //res.status(401).send('No user with the given username');
                    res.json({statusCode:401,error:'אין משתמש עם הפרטים הנל'});
                }
                else {

                    //user exist - check for limitation
                    var DELTA = 4;
                    var COUNTER = 4;
                    var now = new Date();
                    var diffMs = (now - user["lastDateLogin"]); // milliseconds between now & Christmas
                    //var diffDays = Math.floor(diffMs / 86400000); // days
                    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
                    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
                    user["counterTryLogin"]=user["counterTryLogin"]+1;
                    var counterTryLogin = user["counterTryLogin"];
                    user["lastDateLogin"]=new Date();
                    console.log("A" + diffMins + " : " + DELTA);

                    if(diffMins >= DELTA ){//pass minutes from last try
                        user["counterTryLogin"]=0;

                        console.log("*********9" + password);

                        user.save(function (err) {
                            console.log("*********10" + password);

                            if(!user.authenticate(password) ){
                                console.log("*********4" + password);

                                var stay =  COUNTER - user["counterTryLogin"] -1 ;
                                var error = "יוסר וסיסמא לא מתאימים  " + " נשארו לך "  + " " + stay + " ניסיונות";
                            res.json({statusCode:401,
                                    error:error,
                                    diffMins:diffMins,
                                    counterTryLogin:user["counterTryLogin"],
                                    delta:DELTA,
                                    counter:COUNTER
                                });
                                return;
                            }
                            else {
                                //if everything is good
                                //then atatch to req.user
                                //and call next so the controller
                                // can sign a token from the req.user._id

                                req.user = user;
                                next();
                            }
                        });
                    }
                    else if(diffMins < DELTA ) {
                        console.log("*********11" + password);

                        user.save(function (err) {
                            console.log("*********12" + password);

                            if(diffMins < DELTA && counterTryLogin >= COUNTER){
                                console.log("*********6" + password);

                                var error = "נסה שנית עוד "  + (DELTA+1)  + " דקות";
                                res.json({statusCode:429,error:error,
                                diffMins:diffMins,
                                counterTryLogin:user["counterTryLogin"],
                                delta:DELTA,
                                counter:COUNTER
                            });
                                return;
                            }
                            else {
                                console.log("*********90" + password);

                                if(!user.authenticate(password) ){
                                    var stay =  COUNTER - user["counterTryLogin"] -1 ;
                                    console.log("*********7" + password);

                                    var error = "יוסר וסיסמא לא מתאימים  " + " נשארו לך "  + " " + stay + " ניסיונות";
                                    res.json({statusCode:401,error:error,
                                    diffMins:diffMins,
                                    counterTryLogin:user["counterTryLogin"],
                                    delta:DELTA,
                                    counter:COUNTER
                                    });
                                    return;
                                }
                                else {
                                    //if everything is good
                                    //then atatch to req.user
                                    //and call next so the controller
                                    // can sign a token from the req.user._id
                                    console.log("*********8" + password);

                                    req.user = user;
                                    next();
                                }
                            }
                        });
                    }
                    console.log("B");
                    //checking the password here
                }
            },function (err) {
                    next(err);
            });
        // use the authenticate() method on a user doc.Passin
        //in the posted password, it will hash the
        //password the same way as the current passwords got hashed
    };
};
//util method to sign tokens on sign up
exports.signToken = function (id) {
    return jwt.sign(
        {_id:id},
        config.secrets.jwt,
        {expiresIn:config.expireTime}
    );
};
//to delete
exports.getFreshUser = function () {
    return function (req, res, next) {
        User.findById(req.user._id)
               .then(function (user) {
                if(!user){
                    //if no user is found.it was
                    //a valid jwt but didnt decode
                    //to a real user in our db.ether the user was deleted
                    //since the client got the jwt from some other source
                    res.status(401).send('Unauthorized***');
                }
                else {
                    //update req.user with fresh user from the
                    //stale token data
                    req.user = user;
                    next();
                }
            },function (err) {
                next(err);
            });
    }
};
exports.isAdmin = function () {
    return function (req, res, next) {
        if(req.user.type.permission == "admin")
            next();
        else
        {
            res.json({"admin":false});
        }
    }
};



