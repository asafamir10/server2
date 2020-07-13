/**
 * Created by asafamir Vardi LTD. on 30/05/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
var UserSchema = new Schema({

    email : {
        type:String,
        unique:true,
        required :true
    },
    password:{
        type:String,
        required:true 
    },
    firstname:String,
    lastname:String,
    created:{
        type:Date,
        default: Date.now
    },
    modified:{
        type:Date,
        default: Date.now
    },
    permission:{
    },
    description:String, 
});


UserSchema.pre('save', function (next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = this.encryptPassword(this.password);
    next();
});

UserSchema.methods = {

    authenticate : function (plainTextPword) {
        console.log("this password is " + this.password);
        return bcrypt.compareSync(plainTextPword, this.password);
    },
    // hash the password
    encryptPassword:function (plainTextPword) {
        if(!plainTextPword){
            return '';
        }
        else {
            var salt = bcrypt.genSaltSync(10);
            return bcrypt.hashSync(plainTextPword, salt);
        }
    },
    toJson:function () {
        var obj = this.toObject();
        delete obj.password;
        return obj;
    }
};

module.exports = mongoose.model('users',UserSchema);