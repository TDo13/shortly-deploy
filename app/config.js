var mongoose = require('mongoose');
var dbUri = 'mongodb://localhost/database';

mongoose.connect(dbUri);

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function () {
  console.log('MongoDB is now open');
});

db.on('connected', function() {
  console.log('Connected to: ', dbUri);
});

module.exports = db;
