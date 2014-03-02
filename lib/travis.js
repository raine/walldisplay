var mongo = require('./mongo')
  , _ = require('lodash')
  , Promise = require('bluebird')
;

var COLL = 'travis_payloads';

// Remove nasty keys from a payload
var preparePayload = exports.preparePayload = function(json) {
  var payload = JSON.parse(json);
  delete payload.config['.result'];
  delete payload.matrix;
  return payload;
};

// Pull the two latest builds for each repo and branch
exports.recent = function() {
  return mongo.connect().then(function(db) {
    var coll = db.collection(COLL);
    return coll.groupAsync({ branch: 1, 'repository.name': 1 }, {}, {}, _.noop)
      .then(function(res) {
        return Promise.map(res, function(obj) {
          return coll.findAsync(obj, { limit: 5, sort: { _id: -1 } }).then(function(res) {
            return Promise.promisify(res.toArray, res)();
          });
        });
      })
      .map(recent2job);
  });
};

// TODO: document
var recent2job = exports.recent2job = function(recent) {
  var processed = _.map(recent, processPayload);
  var job = processed[0];
  job.previous = _.find(_.tail(processed), function(payload) {
    return payload.status !== 'pending';
  });

  // Use the latest config from the repo/branch combination
  configure(job, recent[0].config);
  return job;

  function configure(job, config) {
    config = _.defaults(config.walldisplay || {}, {
      display_name: job.repo + '/' + job.branch
    });

    job.name = config.display_name
      .replace('%branch%', job.branch)
      .replace('%repo%'  , job.repo);
  }
};

exports.insert = function(payloadJSON) {
  var payload = preparePayload(payloadJSON);
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
