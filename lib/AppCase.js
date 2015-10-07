var devmode = require('devmode');
var sfss    = devmode.require('sfss.service');
var serveStatic = require('serve-static');

var pathLib = require('path');
var options = {
    port: 8080,
    "sfss.api.endpoint": {
      dataRoot: pathLib.normalize(__dirname + pathLib.sep + '..' + pathLib.sep + 'sfss.data'),
      disableFileDeletion: true,
      disableDirectoryDeletion: true
    }
  };
var api = sfss(options);


api.use(serveStatic('static'));
