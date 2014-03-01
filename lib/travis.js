var mongo = require('./mongo')
  , _ = require('lodash')
  , Promise = require('bluebird')
;

var COLL = 'travis_payloads';

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
    var coll = db.collection(COLL);
    return coll.groupAsync({ branch: 1, 'repository.name': 1 }, {}, {}, _.noop)
      .then(function(res) {
        return Promise.map(res, function(obj) {
          return coll.findAsync(obj, { limit: 2, sort: { _id: -1 } }).then(function(res) {
            return Promise.promisify(res.toArray, res)();
          });
        });
      })
      .map(payloadPair2Job);
  });
};

exports.insert = function(payloadJSON) {
  var payload = travis.preparePayload(payloadJSON);
  return mongo.connect().then(function(db) {
    return db.collection(COLL).insertAsync(payload);
  });
};

// Process payload to walldisplay format
var processPayload = exports.processPayload = function(payload) {
  return {
    started  : payload.started_at,
    finished : payload.finished_at,
    branch   : payload.branch,
    repo     : payload.repository.name,
    status   : parseStatusMessage(payload.status_message)
  };
};

var parseStatusMessage = exports.parseStatusMessage = function(status) {
  return {
    'Pending'       : 'pending',
    'Passed'        : 'success',
    'Fixed'         : 'success',
    'Failed'        : 'fail',
    'Broken'        : 'fail',
    'Still Failing' : 'fail'
  }[status];
};

var payloadPair2Job = exports.payloadPair2Job = function(pair) {
  var processed   = _.map(pair, processPayload);
  var latest      = processed[0];
  latest.previous = processed[1];
  return latest;
};
