var mongo = require('./mongo')
  , _ = require('lodash')
  , Promise = require('bluebird');

// Remove nasty keys from a payload
exports.preparePayload = function(json) {
  var payload = JSON.parse(json);
  delete payload.config['.result'];
  delete payload.matrix;
  return payload;
};

// Returns the two latest payloads for each repo and branch
exports.latest = function() {
  return mongo.connect().then(function(db) {
    var coll = db.collection('travis_payloads');
    return coll.groupAsync({ branch: 1, 'repository.name': 1 }, {}, {}, _.noop)
      .then(function(res) {
        return Promise.map(res, function(obj) {
          return coll.findAsync(obj, { limit: 2, sort: { _id: -1 } }).then(function(res) {
            return Promise.promisify(res.toArray, res)();
          });
        });
      });
  });
};

exports.putPayload = function(payload) {
  return mongo.connect().then(function(db) {
    var coll = db.collection('travis_payloads');
    return coll.insertAsync(payload);
  });
};
