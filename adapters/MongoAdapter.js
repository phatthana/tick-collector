'use strict';
var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var Db;

var _curDB = null;
var DataBase = function () {};

DataBase.GetDB = function () {
  return Db;
};

// Callback:
// - error
// - Db object
DataBase.InitDB = function (options, callback) {


  if (_curDB === null || _curDB === undefined ||_curDB === '') {
    _curDB = options.mongoDatabaseName;
  }

  var urlString = getUrlServers(options);

  MongoClient.connect(urlString, function(err, db) {
    if (err) return callback(err);
    Db = db;
    callback(null, db);
  });
};

DataBase.Disconnect = function () {
  if (DataBase.db) {
    DataBase.db.close();
  }
};

DataBase.ObjectIdFromString = function (id) {
   var ObjectID = require('mongodb').ObjectID;
   return new ObjectID(id);
};

function getUrlServers(options){
  var servers = options.mongoServers.join(',');
  var authenString = '';
  var poolSize = process.env.POOL_SIZE || 15;
  if (options.mongoUser) {
    authenString = options.mongoUser+':'+options.mongoPassword+'@';
  }
  var uriString = 'mongodb://'+authenString+servers+'/';
  uriString = uriString + options.mongoDatabaseName;
  uriString = uriString + '?maxPoolSize='+poolSize;
  uriString = uriString + '&readPreference='+'secondaryPreferred';

  return uriString;
}

function getUrlFromAddress(address) {
  var addressAndPort = address.split(':');
  return addressAndPort[0];
}

function getPortFromAddress(address) {
  var addressAndPort = address.split(':');
  var port = addressAndPort.length > 1 ? addressAndPort[1] : 27017;
  return port;
}

module.exports = DataBase;
