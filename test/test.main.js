'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');
var child = require('child_process');
var Personality = require('../main');

var p = new Personality({
  meta: {
    age: null,
    city: null
  },
  db:'./test/db'
});

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
    it('created an invalid user with no email', function (done) {
      profile = null;
      p.create(profile, function (err, p) {
        should.exist(err);
        err.toString().should.equal('Invalid - email is missing');
        profile = {
          hash: 'ricard.solecasas@gmail.com',
          display: 'rsole'
        };
        done();
      });
    });
  });
});
