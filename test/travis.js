var should = require('should')
  , travis = require('../lib/travis')
  , preparePayload = travis.preparePayload
  , processPayload = travis.processPayload
  , recent2job = travis.recent2job
  , parseStatusMessage = travis.parseStatusMessage
  , fs = require('fs')
  , _ = require('lodash')
;

var payloadJSON = fs.readFileSync('test/fixtures/payload.json', 'utf8');

describe('travis', function() {
  describe('preparePayload', function() {
    var payload;
    before(function() {
      payload = preparePayload(payloadJSON);
    });

    it('should remove mongo incompatible key in config from payload', function() {
      payload['config'].should.not.have.property('.result');
    });

    it('should remove matrix from payload', function() {
      payload.should.not.have.property('matrix');
    });

    it('should have no keys with a dot', function() {
      _.any(keys(payload), hasDot).should.be.false;
    });
  });

  describe('processPayload', function() {
    var processed, unprocessedPayload;
    before(function() {
      unprocessedPayload = preparePayload(payloadJSON);
      processed = processPayload(unprocessedPayload);
    });

    it('should grab params to walldisplay format', function() {
      processed.started.should.equal(unprocessedPayload.started_at);
      should(processed.finished).equal(unprocessedPayload.finished_at);
      processed.branch.should.equal(unprocessedPayload.branch);
      processed.repo.should.equal(unprocessedPayload.repository.name);
      processed.status.should.equal(parseStatusMessage(unprocessedPayload.status_message));
    });
  });

  describe('parseStatusMessage', function() {
    it('should know "Pending"', function() {
      parseStatusMessage('Pending').should.equal('pending');
    });

    it('should know "Passed"', function() {
      parseStatusMessage('Passed').should.equal('success');
    });

    it('should know "Fixed"', function() {
      parseStatusMessage('Fixed').should.equal('success');
    });

    it('should know "Failed"', function() {
      parseStatusMessage('Failed').should.equal('fail');
    });

    it('should know "Broken"', function() {
      parseStatusMessage('Broken').should.equal('fail');
    });

    it('should know "Still Failing"', function() {
      parseStatusMessage('Still Failing').should.equal('fail');
    });
  });

  describe('recent2job', function() {
    var payload;
    before(function() {
      payload = preparePayload(payloadJSON);
    });

    it('should get the last non-pending build to previous', function() {
    });

    describe('config', function() {
      it('should set the display name', function() {
        payload = _.cloneDeep(payload);
        payload.config.walldisplay.display_name = 'hello world';
        recent2job([ payload ]).name.should.equal('hello world');
      });

      it('should replace %branch% with branch', function() {
        payload = _.cloneDeep(payload);
        payload.config.walldisplay.display_name = 'hello world %branch%';
        recent2job([ payload ]).name.should.equal('hello world ' + payload.branch);
      });
    });
  });
});

function keys(obj) {
  return _.reduce(obj, function(mem, val, key) {
    if (_.isPlainObject(val)) {
      return mem.concat(keys(val));
    } else {
      return mem.concat(key);
    }
  }, []);
};

function hasDot(obj) {
  return _.contains(obj, '.');
}
