var Promise    = require('bluebird');
var mongo      = require('mongodb');
var client     = mongo.MongoClient;
var collection = mongo.Collection;
var mongoURI   = 'mongodb://localhost:27017/walldisplay';

Promise.promisifyAll(collection.prototype);
Promise.promisifyAll(client);

var db;
var connect = exports.connect = function() {
  if (!db) {
    db = client.connectAsync(mongoURI, { native_parser: true });
  }

  return db;
};
