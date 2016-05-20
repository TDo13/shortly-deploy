var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');

var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};


exports.fetchLinks = function(req, res) {
  Link.find({})
    .then(function(links) {
      res.status(200).send(links);
    });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link
    .findOne({url: uri})
    .then(function(data) {
      if (data) {
        res.status(200).send(data);
      } else {
        util.getUrlTitle(uri)
          .then(function(title) {
            var link = new Link({
              url: uri,
              title: title,
              baseUrl: req.headers.origin,
              visits: 0
            })
            .save()
            .then(function(link) {
              res.status(200).send(link);
            });
          });
      }
    })
    .catch(function(err) {
      console.log('There was an error');
      res.sendStatus(404);
    });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User
    .findOne({username: username})
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        User.comparePassword(password, user.password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    })
    .catch(function(err) {
      console.log('There was an error logging in the user.', err);
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User
    .findOne({username: username})
      .then(function(user) {
        if (!user) {
          var user = new User({
            username: username,
            password: password
          })
          .save()
          .then(function(user) {
            util.createSession(req, res, user);
          });
        } else {
          console.log('Account already exists!');
          res.redirect('/signup');
        }
      })
      .catch(function(err) {
        console.log('There was an error in signing up a user.', err);
      });

};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]})
    .then(function(data) {
      if (data) {
        data.visits++;
        data.save();
        res.redirect(data.url);
      } else {
        res.redirect('/');
      }
    })
    .catch(function(err) {
      console.log('There was an error redirecting to page.', err);
    });
};