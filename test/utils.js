var should = require('should')
  , utils = require('../lib/utils')
  , preparePayload = utils.preparePayload
  , fs = require('fs')
  , _ = require('lodash');

var payloadJSON = fs.readFileSync('test/fixtures/payload.json', 'utf8');

describe('utils', function() {
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
