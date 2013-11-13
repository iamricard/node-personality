## Personality

[![Build Status](https://travis-ci.org/codinglion/node-personality.png)](https://travis-ci.org/codinglion/node-personality)

Layer on top of node.js to deal with user profiles in persona. Inspired in great deal by node-prohibition (code looks rather similar).

Stores emails in SHA1 so you never actually store the email.

The purpose of this is to avoid Privacy Terms/Policy. If you need the email you can just ask the user for it. This is intended for apps that do NOT require emails to work.

MIT License

### Personality format (JSON)

```json
{
    hash: '6cceece8d166ad4e99ee0fe8a56cf06f2896a00c',
    display: 'rsole',
    systemData: {
        joined: 1384302755,
        updated: 1384302755
    }
}
```

### Install modules

```
$ npm install
```

### Personality methods

#### Setup

```javascript
var Personality = require('personality');

var personality = new Personality({
  meta: {
    age: null,
    city: null
  },
  db: './db'
});
```
`meta` is a list of extra fields you'd like to use in your api (optional).

`db` is the path where your leveldb database is located (mandatory).

#### Create new profile

```javascript
var profile = {
  hash: 'ricard@sole.ca',
  display: 'rsole'
};

personality.create(profile, function (err, p) {
  if (!err) {
    console.log(p);
  }
});
```javascript

#### Get an existing profile

```javascript
personality.get('6cceece8d166ad4e99ee0fe8a56cf06f2896a00c', function (err, p) {
  if (!err) {
    console.log(p);
  }
});
```

#### Update an existing profile

```javascript
var profile = {
  display: 'rsole_',
  meta: {
    city: 'Barcelona'
  }
}
personality.update(profile, '6cceece8d166ad4e99ee0fe8a56cf06f2896a00c', function (err, p) {
  if (!err) {
    console.log(p);
  }
});
```

#### Delete an existing record

```javascript
personality.del('6cceece8d166ad4e99ee0fe8a56cf06f2896a00c', function (err) {
  if (!err) {
    console.log('deleted!');
  }
});
