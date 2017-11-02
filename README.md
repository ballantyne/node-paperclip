node-paperclip
=========

This is a npm module that is meant to work like the Paperclip gem from Ruby on Rails. It currently only works with mongoose,but is set up to be easily extended to work with other databases.  Also, it works with AWS s3 and the file system at the present time, but it should be easy to add other storage methods in the future. 

To install 

```bash
npm install node-paperclip --save
```

Here is an example of a model that uses the mongoose plugin.

```javascript
const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;
const Paperclip    = require('node-paperclip');

const ProfileImage = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  username: String
});

ProfileImage.plugin(Paperclip.plugins.mongoose, {files: [
  { 
    has_attached_file: 'profile_image',
    styles: [
      { original: true },
      { tiny:     { width: 50,  height: 50,  modifier: '#' } },
      { thumb:    { width: 100, height: 100, modifier: '#' } },
      { profile:  { width: 200, height: 200, modifier: '#' } }
    ],
    prefix:      '{{plural}}/{{document.username}}',
    name_format: '{{style}}.{{extension}}',
    storage: 'file'
  }
]})

module.exports     = mongoose.model('ProfileImage', ProfileImage);
```

It uses s3 by default, but can use a file system if you want.  The example above is configured to use the file system.  Is you plan to use s3 you will need the following two files in the config directory.  The plugin uses the config npm module, and so if you already use that module then you can just add the bucket reference to the files you normally would.

config/aws.json
```javascript
{
  "accessKeyId":  "aws key",
  "secretAccessKey": "aws secret",
  "region": "us-west-2"
}
```
config/development.json
```javascript
{
  "bucket": "bucket-development"
}
```


Contributing
------------

If you'd like to contribute a feature or bugfix: Thanks! To make sure your
fix/feature has a high chance of being included, please read the following
guidelines:

1. Post a [pull request](https://github.com/ballantyne/node-paperclip/compare/).
2. Make sure there are tests! We will not accept any patch that is not tested.
   It's a rare time when explicit tests aren't needed. If you have questions
   about writing tests for paperclip, please open a
   [GitHub issue](https://github.com/ballantyne/node-paperclip/issues/new).


And once there are some contributors, then I would like to thank all of [the contributors](https://github.com/ballantyne/node-paperclip/graphs/contributors)!

License
-------

It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.

Copyright 
-------
© 2017 Scott Ballantyne. See LICENSE for details.

