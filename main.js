'use strict';

var level    = require('level');
var Sublevel = require('level-sublevel');
var crypto   = require('crypto');

var KEY = 'personality!';
var WHITELIST = ['display'];

var sha1sum = crypto.createHash('sha1');

Number.prototype.toRad = function () {
  return this * Math.PI / 180;
};

var Personality = function (options) {
  var self = this;

  if (!options) {
    options = {};
  }

  this.dbPath = options.db;
  this.db = Sublevel(level(this.dbPath, {
    createIfMissing: true,
    valueEncoding: 'json'
  }));

  this.profile = {
    meta: options.meta || {},
  };

  this.get = function (email, callback) {
    self.db.get(KEY + email, function (err, profile) {
      if (err || !profile) {
        callback(new Error('Not found ', err));
      } else {
        if (typeof profile === 'object') {
          callback(null, profile);
        } else {
          callback(new Error('Invalid JSON'));
        }
      }
    });
  };

  var validateNewUser = function (newUser, callback) {

    newUser.hash = self.sha1sum.update(newUser.hash).digest('hex');
    self.get(newUser.hash, function (err, profile) {
      if (!newUser) {
        callback(new Error('Profile object empty'));
      } else if (!newUser.hash) {
        callback(new Error('Invalid - email is missing'));
      } else if (newUser.hash === profile.hash) {
        callback(new Error('Invalid - user already registered'));
      } else {
        if (self.get(newUser.hash))
        callback(null, newUser);
      }
    });
  };

  var setAll = function (profile, callback) {

    profile.hash = self.sha1sum.update(profile.hash).digest('hex');

    if (!profile.meta) {
      profile.meta = {};
    }

    for (var attr in self.profile.meta) {
      if (!profile.meta[attr]) {
        profile.meta[attr] = false;
      }
    }

    for (var attr in profile) {
      if (WHITELIST.indexOf(attr) === -1) {
        delete profile[attr];
      }
    }

    profile.content = self.profile.content;
    profile.content.joined = Math.round(new Date() / 1000);

    self.db.put(KEY + profile.hash, profile, function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, profile);
      }
    })
  };

  this.create = function (newProfile, callback) {
    validateUser(newProfile, function (err, profile) {
      if (err) {
        callback(err);
      } else {
        setAll(profile, callback);
      }
    });
  };

  this.del = function (email, callback) {
    self.db.del(KEY + email);
    callback(null);
  };
};

module.exports = Personality;
