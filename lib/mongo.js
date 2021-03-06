var Promise = require('bluebird')
  , mongo = require('mongodb')
  , client = mongo.MongoClient
  , collection = mongo.Collection
;

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/walldisplay'
console.log('Mongo URI:', mongoURI);

Promise.promisifyAll(collection.prototype);
Promise.promisifyAll(client);

var db;
var connect = exports.connect = function() {
  if (!db) {
    db = client.connectAsync(mongoURI, { native_parser: true });
  }

  return db;
};
