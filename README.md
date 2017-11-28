node-paperclip
=========

Slight changes have been made in this version.  The configuration has changed and also the form that you would use to upload a document has also changed.

This is a npm module that is meant to work like the Paperclip gem from Ruby on Rails. It currently only works with mongoose, but is set up to be easily extended to work with other databases.  Also, it works with AWS s3 and the file system at the present time, but it should be easy to add other storage methods in the future. 

To install (Shouldn't it be possible for one of the module to include the others as dependencies?)

```bash
npm install node-paperclip --save
npm install node-paperclip-file --save

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

ProfileImage.plugin(Paperclip.plugins.mongoose, {
  profile_image: {
    avatar: { 
      styles: [
        { original: true },
        { tiny:     { width: 50,  height: 50,  modifier: '#' } },
        { thumb:    { width: 100, height: 100, modifier: '#' } },
        { profile:  { width: 200, height: 200, modifier: '#' } }
      ],
      prefix:      '{{plural}}/{{document.username}}',
      name_format: '{{style}}.{{extension}}'
    }
  }
})

module.exports     = mongoose.model('ProfileImage', ProfileImage);
```

Here is an example of an express route that uses that ProfileImage model.
```javascript

var express = require('express');
var router = express.Router();
var ProfileImage = require('profile_image');
var middleware = require('node-paperclip').middleware

router.post('/post_profile_image',

    middleware.parse(),

  function(req, res, next) {
    req.body.profile_image.user_id  = req.user._id;
    req.body.profile_image.username = req.user.username;
    next();
  },

  function(req, res, next) {

    console.log(req.body);


    ProfileImage.findOne({username: req.user.username}, function(err, profile_image) {
      if (req.body.profile_image) {
        if (profile_image) {
          profile_image.remove(function(err) {
            next();
          });
        } else {
          next();
        }
      } else {
        res.redirect('/#profile/images');
      }
    });
  },

  function (req, res) {
    ProfileImage.create(req.body.profile_image, function(err, doc) {
      res.redirect('/#profile/images');
    });
})


module.exports = router;
```

And then use the same name as you put in the as the key in the plugin and the name of the attachment that you configured (profile_image[avatar] using the example above)  and the middleware should correctly prepare the data to be saved and place the file in the correct place in your storage.

```html
<form  class="form-horizontal" enctype="multipart/form-data" action="/post_profile_image" method="post">

<h1>Edit Profile Image</h1>

<div  class="form-group">
  <div>  
    <label>Profile Image:</label>
    <input type="file" name="profile_image[avatar]" id="profile_image">
  </div>
</div>

<div  class="form-group">
  <div class="col-sm-offset-2 col-sm-10">
    <input class='btn btn-default' type="submit" value="Save"/>
  </div>
</div>

</form>

```



This module now uses the file system by default, but can use s3 or whatever cloud api you want, just right a module like the node-paperclip-s3 module.  If you share your code that would be great, but you can just pass an object or function that has the correct api and the paperclip module will use what is in the configuration.  I'll make a few examples to show how that should work soon.  The example above is configured to use the file system.  

To install the s3 module run this command in your project directory.
```bash
npm install node-paperclip-s3 --save
```

If you plan to use s3 you will need the following environment variables set the AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.


Contributing
------------

If you'd like to contribute a feature or bugfix: Thanks! To make sure your fix/feature has a high chance of being included, please read the following guidelines:

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

