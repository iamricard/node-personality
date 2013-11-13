'use strict';

var level    = require('level');
var Sublevel = require('level-sublevel');
var crypto   = require('crypto');

var KEY = 'personality!';
var WHITELIST = ['hash', 'display', 'meta'];

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
    systemData: {}
  };

  this.get = function (email, callback) {
    self.db.get(KEY + email, function (err, profile) {
      if (err || !profile) {
        callback(new Error('Not found'));
      } else {
        if (typeof profile === 'object') {
          callback(null, profile);
        } else {
          callback(new Error('Invalid JSON'));
        }
      }
    });
  };

  var validateProperties = function (userProfile, callback) {

    if (!userProfile) {
      callback(new Error('Profile non-existent'));
    } else if (!userProfile.hash) {
      callback(new Error('Invalid - email is missing'));
    } else if (!userProfile.display) {
      callback(new Error('Invalid - display name can not be empty'));
    } else {
      userProfile.hash = require('crypto').createHash('sha1').update(userProfile.hash).digest('hex');
      self.get(userProfile.hash, function (err, profile) {
        if (!err) {
          if (userProfile.hash === profile.hash) {
            callback(new Error('Invalid - user already registered'));
          } else if (userProfile.display === profile.display) {
            callback(new Error('Invalid - display name in use'));
          }
        } else {
          callback(null, userProfile);
        }
      });
    }
  };

  var setAll = function (profile, callback, isNew) {

    if (!profile.meta) {
      profile.meta = {};
    }

    for (var attr in self.profile.meta) {
      if (!profile.meta[attr]) {
        profile.meta[attr] = null;
      }
    }

    for (var attr in profile) {
      if (WHITELIST.indexOf(attr) === -1) {
        delete profile[attr];
      }
    }

    profile.systemData = self.profile.systemData;
    if (isNew) {
      profile.systemData.joined = Math.round(new Date() / 1000);
    }
    profile.systemData.updated = Math.round(new Date() / 1000);

    self.db.put(KEY + profile.hash, profile, function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null, profile);
      }
    })
  };

  this.create = function (newProfile, callback) {
    validateProperties(newProfile, function (err, profile) {
      if (err) {
        callback(err);
      } else {
        setAll(profile, callback, true);
      }
    });
  };

  var validateUpdate = function (profile, hash, callback) {
    if (!profile) {
      callback(new Error('Invalid - no profile'));
    } else if (!profile.hash) {
      callback(new Error('Invalid - no email'));
    } else if (!profile.display) {
      callback(new Error('Invalid - no display'));
    } else {
      self.get(hash, function (err, exProfile) {
        if (err) {
          callback(err);
        } else {
          for (var attr in exProfile.meta) {
             profile.meta[attr] = exProfile.meta[attr];
          }
          callback(null, profile);
        }
      });
    }
  };

  this.update = function (profile, hash, callback) {
    validateUpdate(profile, hash, function (error, vProfile) {
      if (error) {
        callback(error);
      } else {
        setAll(vProfile, callback, false);
      }
    });
  };

  this.del = function (email, callback) {
    self.db.del(KEY + email);
    callback(null);
  };
};

module.exports = Personality;
