const config = require('config');
const AWS    = require('aws-sdk');


AWS.config.update({
  region: process.env.AWS_REGION, 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3bucket = new AWS.S3( { params: { bucket: process.env.AWS_BUCKET } } )

module.exports.put = function(key, body, next) {
  var params = {
    ACL:    'public-read', 
    Bucket: process.env.AWS_BUCKET, 
    Key:    key, 
    Body:   body
  };

  s3bucket.putObject(params, function(err, data){
    if (next) {
      next(err, data);
    }
  });
}

module.exports.get = function(key, next) {
  var params = {
    Bucket: process.env.AWS_BUCKET, 
    Key:    key 
  }

  s3bucket.getObject(params, function(err, data) {
    var data = data.Body.toString('utf-8'); 
    if (next) {
      next(err, data);
    }
  });
}

module.exports.delete = function(key, next) {
  var params = {
    Bucket: process.env.AWS_BUCKET, 
    Key:    key 
  }

  s3bucket.deleteObject(params, function (err, data) {
    if (next) {
      next(err, key);
    }
  });
}
