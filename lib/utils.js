exports.preparePayload = function(json) {
  var payload = JSON.parse(json);
  delete payload.config['.result'];
  delete payload.matrix;
  return payload;
};
