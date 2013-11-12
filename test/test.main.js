'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');
var child = require('child_process');
var Personality = require('../main');

var crypto = require('crypto');
var shasum = crypto.createHash('sha1');

var p = new Personality({
  meta: {
    age: null,
    city: null
  },
  db:'./test/db'
});

var hash;
var secHash;

var profile = {
  hash: 'ricard.solecasas@gmail.com',
  display: 'rsole'
};

var profileMerged = {
  meta: {
    age: null,
    city: null
  },
  hash: 'ricard.solecasas@gmail.com',
  display: 'rsole'
};

describe('personality', function () {
  after(function() {
    child.exec('rm -rf ./test/db');
  });

  describe('.create', function () {
    it('creates an invalid profile with no values at all', function (done) {
      profile = null;
      p.create(profile, function (err, pro) {
        should.exist(err);
        err.toString().should.equal('Error: Profile non-existent');
        profile = {
          hash: 'ricard.solecasas@gmail.com',
          display: 'rsole'
        };
        done();
      });
    });

    it('creates an invalid profile with no email', function (done) {
      profile.hash = null;
      p.create(profile, function (err, pro) {
        should.exist(err);
        err.toString().should.equal('Error: Invalid - email is missing');;
        profile = {
          hash: 'ricard.solecasas@gmail.com',
          display: 'rsole'
        };
        done();
      });
    });

    it('creates an invalid profile with display name missing', function (done) {
      profile.display = null;
      profile.hash = 'ricard.solecasas@gmail.com';
      p.create(profile, function (err, pro) {
        should.exist(err);
        err.toString().should.equal('Error: Invalid - display name can not be empty');
        done();
      });
    });

    it('creates a valid profile', function (done) {
      profile = {
        hash: 'ricard.solecasas@gmail.com',
        display: 'rsole'
      }
      p.create(profile, function (err, pro) {
        should.exist(pro);
        hash = pro.hash;
        pro.display.should.eql(profile.display);
        pro.hash.should.eql(hash);
        pro.meta.should.eql(profileMerged.meta);
        done();
      });
    });
  });

  describe('.get', function () {
    it('gets a profile which does not exist', function (done) {
      p.get('banana', function (err, pro) {
        should.exist(err);
        done();
      });
    });

    it('gets a profile', function (done) {
      p.get(hash, function (err, pro){
        should.exist(pro);
        done();
      });
    });
  });

  describe('.del', function () {
    it('deletes a profile', function (done) {
      var newProfile = {
        hash: 'ricard.can@gmail.com',
        display: 'rsole_'
      };
      p.create(newProfile, function (err, pro) {
        secHash = pro.hash;
        p.del(secHash, function (err) {
          setTimeout(function () {
            p.get(secHash, function (err, prof) {
              should.not.exist(prof);
            });
            done();
          }, 500);
        });
      });
    });
  });
});
