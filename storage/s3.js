const config    = require('config');
const AWS       = require('aws-sdk');
const zlib      = require('zlib');
const s3Stream  = require('s3-upload-stream')(new AWS.S3());
const klass     = require('klass');
const stream    = require('stream');
const Readable  = stream.Readable;
const crypto    = require('crypto');

AWS.config.update({
  region: process.env.AWS_REGION, 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3bucket = new AWS.S3( { params: { bucket: process.env.AWS_BUCKET } } )

module.exports.stream = function(options) {
  var StreamingUpload = klass(function(options) {
    this.options = options;
    this.stream = new Readable;

    if (this.options.key) {
      this.key = this.options.key;
    } else {
      this.generateKey();
    }

  }).methods({
    generateKey: function() {
      var extension = this.options.filename.split('.').pop();
      const hash = crypto.createHmac('sha256', this.options.fieldname)
        .update(this.options.filename)
        .digest('hex');

      this.key = 'tmp/' + hash + "." + extension;
    },
 
    upload: function(next) {
      var self = this;
      this.file = s3Stream.upload({
	"Bucket": process.env.AWS_BUCKET,
	"Key": self.key
      });

      this.file.on('error', function (error) {
	console.log(error);
      });

      this.file.on('part', function (details) {
	console.log(details);
      });

      this.file.on('uploaded', function (details) {
	console.log(details);
        if (next) {
          next();
        }
      });
      this.stream.pipe(this.file);
    },

    push: function(buffer) {
      this.stream.push(buffer)
    },

    send: function(next) {
      this.stream.push(null);
      this.upload(function() {
        if (next) {
          next();
        }
      });
    }
  })
  return new StreamingUpload(options);

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
  var params = {
    Bucket: process.env.AWS_BUCKET, 
    Key:    key, 
    CopySource:   oldkey
  };

  s3bucket.copyObject(params, function(err, data){
    var params = {
      Bucket: process.env.AWS_BUCKET, 
      Key: oldkey
    };
    
    s3bucket.deleteObject(params, function(err, deleteData) {
      if (next) {
        next(err, {copy: data, delete: deleteData});
      }   
    });
  });
}


