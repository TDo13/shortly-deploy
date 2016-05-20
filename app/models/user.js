var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true},
  password: { type: String, required: true },
  created_at: Date
});

userSchema.statics.comparePassword = function(attemptedPassword, realPassword, callback) {
  var comparePass = Promise.promisify(bcrypt.compare);

  return comparePass(attemptedPassword, realPassword)
    .then(function(isMatch) {
      callback(isMatch);
    })
    .catch(function(err) {
      console.log('There was problem comparing the hashed passwords.', err);
    });
};

userSchema.pre('save', function(next, done) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });

});

var User = mongoose.model('User', userSchema);


module.exports = User;
