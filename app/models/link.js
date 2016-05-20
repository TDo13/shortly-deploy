var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var linkSchema = mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  created_at: Date,
  updated_at: Date
});

linkSchema.pre('save', function(next, done) {

  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);

  next();
});

var Link = mongoose.model('Link', linkSchema);

module.exports = Link;
