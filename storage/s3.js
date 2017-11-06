const config    = require('config');
const AWS       = require('aws-sdk');
const zlib      = require('zlib');
const s3Stream  = require('s3-upload-stream')(new AWS.S3());
const klass     = require('klass');
const stream    = require('stream');
const Readable  = stream.Readable;
const crypto    = require('crypto');
const fs        = require('fs');

AWS.config.update({
  region: process.env.AWS_REGION, 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3bucket = new AWS.S3( { params: { bucket: process.env.AWS_BUCKET } } )

module.exports.stream = function(stream, key, next) {
  if (typeof stream == 'string') stream = fs.createReadStream(stream);

  stream.on('open', function () {
    var params = {
      ACL:    'public-read', 
      Bucket: process.env.AWS_BUCKET, 
      Key:    key,
      Body:   stream
    };

    s3bucket.putObject(params, function(err, data){
      if (next) {
	console.log('finished streaming file', key);
        next(err, data);
      }
    });
  });
}


module.exports.upload = function(stream, key, next) {
  if (typeof stream == 'string') stream = fs.createReadStream(stream);

  stream.on('open', function () {
    var params = {
      ACL:    'public-read', 
      Bucket: process.env.AWS_BUCKET, 
      Key:    key,
      Body:   stream
    };

    s3bucket.upload(params, function(err, data){
      if (next) {
	next(err, data);
      }
    });
  });
}

module.exports.generateKey = function(fieldname, filename) {
  var now = new Date().getTime().toString();
  var extension = filename.split('.').pop();
  const hash = crypto.createHmac('sha256', fieldname+now)
    .update(filename)
    .digest('hex');

  return 'tmp/' + fieldname + "-" + hash + "." + extension;
}

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

module.exports.move = function(oldkey, key, next) {
  var bucket = process.env.AWS_BUCKET;
  var parameters = {
    Bucket:       bucket, 
    Key:          key, 
    CopySource:   bucket + '/' + oldkey
  };

  s3bucket.waitFor('objectExists', {Bucket: bucket, Key: oldkey}, function(err, data) {
    s3bucket.copyObject(parameters, function(err, data){
      console.log('copied', parameters, err, data);
      var params = {
	Bucket:     process.env.AWS_BUCKET, 
	Key:        oldkey
      };

      var deleteData;
      if (next) {
	next(err, {copy: data, delete: deleteData});
      }   
    });
  });
}


