var should = require('should')
  , travis = require('../lib/travis')
  , preparePayload = travis.preparePayload
  , processPayload = travis.processPayload
  , recent2job = travis.recent2job
  , parseStatusMessage = travis.parseStatusMessage
  , fs = require('fs')
  , _ = require('lodash')
  , format = require('util').format
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

    it('should grab the commit message', function() {
      processed.commit_message = unprocessedPayload.message;
    });

    it('should grab the commit author email', function() {
      processed.author_email = unprocessedPayload.author_email;
    })
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

    it('should know "Errored"', function() {
      parseStatusMessage('Errored').should.equal('fail');
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
    var payload, recent;
    beforeEach(function() {
      payload = preparePayload(payloadJSON);
      recent  = [ payload ];
    });

    it('should get the last non-pending build to previous', function() {

    });

    describe('config', function() {
      it('should use display_name', function() {
        payload.config.walldisplay.display_name = 'hello world';
        recent2job(recent).name.should.equal('hello world');
      });

      it('should replace %branch% with `branch`', function() {
        payload.config.walldisplay.display_name = 'hello world %branch%';
        recent2job(recent).name.should.equal('hello world ' + payload.branch);
      });

      it('should replace %repo% with `repo`', function() {
        payload.config.walldisplay.display_name = 'hello world %repo%';
        recent2job(recent).name.should.equal('hello world ' + payload.repository.name);
      });

      describe('defaults', function() {
        it('should set the default display name', function() {
          delete payload.config.walldisplay.display_name;
          var defaultName = format('%s/%s', payload.repository.name, payload.branch);
          recent2job(recent).name.should.equal(defaultName);
        });
      });
    });
  });
});

// Returns all keys of an object. recursively
function keys(obj) {
  return _.reduce(obj, function(mem, val, key) {
    return mem.concat(_.isPlainObject(val) ? keys(val) : key);
  }, []);
};

function hasDot(obj) {
  return _.contains(obj, '.');
}
