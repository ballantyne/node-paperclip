const config = require('config');
const AWS    = require('aws-sdk');

AWS.config.loadFromPath('config/aws.json');

const s3bucket = new AWS.S3( { params: { bucket: config.bucket } } )

module.exports.put = function(key, body, next) {
  var params = {
    ACL:    'public-read', 
    Bucket: config.bucket, 
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
    Bucket: config.bucket, 
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
    Bucket: config.bucket, 
    Key:    key 
  }

  s3bucket.deleteObject(params, function (err, data) {
    if (next) {
      next(err, key);
    }
  });
}
