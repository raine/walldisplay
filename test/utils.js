var should = require('should')
  , utils = require('../lib/utils')
  , preparePayload = utils.preparePayload
  , fs = require('fs');

var payloadJSON = fs.readFileSync('test/fixtures/payload.json', 'utf8');

describe('utils', function() {
  describe('preparePayload', function() {
    var payload;
    before(function() {
      payload = preparePayload(payloadJSON);
    });

    it('should remove mongo incompatible key in config from payload', function() {
      payload.config.should.not.have.property('.result');
    });

    it('should remove matrix from payload', function() {
      payload.should.not.have.property('matrix');
    });
  });
});
