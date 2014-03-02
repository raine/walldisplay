exports.head = function(res) {
  res.writeHead(200, {
    'Content-Type'  : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection'    : 'keep-alive'
  });

  res.write("retry: 10000\n");
}

sse.send = function(res, obj, type) {
  if (type) res.write(format('event: %s\n', type));
  res.write('data: ' + JSON.stringify(obj) + '\n\n');
};
