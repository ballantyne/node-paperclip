node-paperclip
=========

This is a npm module that is meant to work like the Paperclip gem from Ruby on Rails. It currently only works with mongoose, but is set up to be easily extended to work with other databases.  Also, it works with AWS s3 and the file system at the present time, but it should be easy to add other storage methods in the future. 

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

Here is an example of an express route that uses that ProfileImage model.
```javascript

var express = require('express');
var router = express.Router();
var ProfileImage = require('profile_image');
var middleware = require('node-paperclip').middleware

router.post('/post_profile_image', 

  middleware.parser().single('profile_image'), 
  middleware.transpose, 

  function(req, res, next) {
    req.body.user_id  = req.user._id;
    req.body.username = req.user.username;
    next();
  },  

  function(req, res, next) {
    ProfileImage.findOne({username: req.user.username}, function(err, profile_image) {
      if (profile_image) {  
        profile_image.remove(function(err) {
          next();
        });
      } else {
        next();
      }
    });
  }, 

  function (req, res) {  
    
    ProfileImage.create(req.body, function(err, doc) {
      res.redirect('/#profile/images');
    });
})

module.exports = router;
```

And then use the same name as you put in the has_attached_file field for the fieldname and it the middleware should correctly prepare the data to be saved and place the file in the correct place in your storage.

```html
<form  class="form-horizontal" enctype="multipart/form-data" action="/post_profile_image" method="post">

<h1>Edit Profile Image</h1>

<div  class="form-group">
  <div>  
    <label>Profile Image:</label>
    <input type="file" name="profile_image" id="profile_image">
  </div>
</div>

<div  class="form-group">
  <div class="col-sm-offset-2 col-sm-10">
    <input class='btn btn-default' type="submit" value="Save"/>
  </div>
</div>

</form>

```



It uses s3 by default, but can use a file system if you want.  The example above is configured to use the file system.  If you plan to use s3 you will need the following environment variables set the AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and the sdk will supposedly automatically use them without adding them to the configuration.


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

