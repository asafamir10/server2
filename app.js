var express = require('express');
var app= express();
var mongoose= require('mongoose');
//var CurrentProduct = require('./ProductModel');
var bodyParser = require('body-parser');
var api = require('./api/api');

var cors = require('cors');
var corsOptions ={
    origin: '*' 
}
app.use(cors(corsOptions))
    

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/api',api);
var strConnect = "mongodb://asaf:asaf@cluster0-shard-00-00-ubzj2.mongodb.net:27017,cluster0-shard-00-01-ubzj2.mongodb.net:27017,cluster0-shard-00-02-ubzj2.mongodb.net:27017/<dbname>?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
const OPT = {useNewUrlParser:true};
mongoose.connect(strConnect, OPT);
var port = process.env.PORT || 3000;
app.listen(port, function(){
console.log("Running om port " + port);

})





