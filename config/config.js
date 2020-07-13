var _ = require('lodash');//
var configValues = {"uname":"asaf","pwd":"asaf"};
var config = {
    dev : 'development',
    test:'testing',
    prod:'production',
    port :process.env.PORT || 3000,
    //ten days in minutes
    expireTime : 60*60*1000*24*365,
    getDbConnectionString : function () {
        return 'mongodb://' + configValues.uname + ":" +
            configValues.pwd + '@ds161630.mlab.com:61630/test2';
    },
    secrets:{
        jwt : process.env.JWT || 'gumball'
    },
    bucket:{
        "accessKeyId": "AKIAJ54ANXJRLTONM5SA",
        "secretAccessKey": "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"
    }
};
process.env.NODE_ENV = process.env.NODE_ENV || config.dev;
config.env = process.env.NODE_ENV;

var envConfig;

try {
    envConfig = require('./' + config.env);
    envConfig = envConfig || {};
}catch (e){//

    envConfig = {}
}

module.exports = _.merge(config, envConfig);