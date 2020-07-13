/**
 * Created by asafamir  LTD. on 30/05/2017.
 */
var User = require('./userModel');
var _ = require('lodash');
var auth = require('./../../auth/auth');
var  fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

exports.getAll = function (req, res, next) {
    User.find({}).sort({firstname:1})
        .then(function (users)
        {
            if(req.user.permission.type == "admin")
            {
                res.json(users);
            }
            else
            {
                res.json({permission:"you are not admin"});
            }

        }, function (err) {
            next(err)
        });
}
exports.getUserById = function(req, res, next){
    var userId = req.body.userId;//user to get 
    User.findOne({_id:userId})
    .then(function(data){

        if(req.user.permission.type == "admin")
        {
            data = data.toJSON();
            delete data["password"];
            res.json(data);
        }
        else {
            res.json({error:"not authorize"});
        }
    });
}

exports.zero = function (req, res, next) {
    User.find({},function(err,users)
    {
        for(var i=0;i<users.length;i++){
            users[i]["counterTryLogin"] = 0;
            users[i]["lastDateLogin"]=new Date();
            users[i].save(function (err) {
            });
            }
    })
    res.json({success:true});
}
exports.update = function (req, res, next) {
    var updateUser = req.body.user;
    if(req.user.permission.type == "admin")
    {
        User.findOne({_id: updateUser._id}, function(err, user)
        {
            var item = req.body.user;
            var keys = Object.keys(req.body.user);
            for (var i=0;i<keys.length;i++ ){
                if (keys[i] in user)
                {
                    user[keys[i]] = item[keys[i]];
                }
            }
            user["modified"] = new Date();
            user.save(function(err, saved){
                if(err){
                    next(err);
                }
                else{
                    saved = saved.toJSON();
                    delete saved["password"];
        
                    res.json(saved);
                }
            });
        });
    }//end of if 
    else
    {
        res.json({user: "failed to delete user"});
    }
};
exports.add = function (req, res, next) {

    var newUser = new User(req.body.user);
    if(req.user.permission.type == "admin")
    {
        newUser.created = new Date();
        newUser.modified = new Date();
        newUser.save(function (err, user) {

            if (err) {
                return next(err);
            }
            res.json({user: user});
        });

    }
    else
    {
        res.json({user: "failed to add user"});
    }
}
exports.delete = function (req, res, next) {
    var deleteUser = new User(req.body.user);
    if(req.user.permission.type == "admin")
    {
        deleteUser.remove(function (err, removed) {
            if(err){
                next(err);
            }
            else{
                res.json(removed);
            }
        });
    }
    else
    {
        res.json({user: "failed to delete user"});
    }
};
exports.me = function (req, res) {
    res.json(req.user.toJson());
};
//_id is the admin , user:_id is the user we req data 
// {_id:...., user:_id}
exports.getUserById2 = function (req, res, next) {
    var user = req.body.user;//user to response data
    if(req.user.permission.type == "admin") {
        res.json(user);
    }
    else
    {

    }
};
exports.isUniqEmail= function (req, res, next) {
    var email = req.body.user.email;
    var _id = req.body.user._id;
    User.find({email:email},function (err,users) {
        if(users.length==1 && users[0]["_id"]==_id)
        {
            next();
        }
        else if(users.length==0)
        {
            next();
        }
        else {
            res.json({"error":"אימייל קיים במערכת נסה שנית"});
        }
    })
}
//func 1 - to change 
exports.register = async function (req, res, next) {
    var tempUser = new User(req.body.user);
    tempUser.counterTryLogin = 0;
    tempUser.lastDateLogin = new Date();
    tempUser.created = new Date();
    tempUser.modified = new Date();
    tempUser.permission = {type :"register",value:10};


    tempUser.save(function (err, user) {
        if (err) {
            //return next(err);
            res.json({"error":"אימייל קיים במערכת נסה שנית"});
        }
        res.json({user:user});
        })
};




