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

module.exports.stream = function(key, stream, next) {

  console.log(stream)

  var params = {
    ACL:    'public-read', 
    Bucket: process.env.AWS_BUCKET, 
    Key:    key, 
    Body:   stream
  };
  s3bucket.upload(params, function(err, data){
    console.log(err);
    console.log('finished uploading stream', params);
    if (next) {
      next(err, data);
    }
  });
}

module.exports.generateKey = function(fieldname, filename) {
  var now = new Date().getTime().toString();
  var extension = filename.split('.').pop();
  const hash = crypto.createHmac('sha256', fieldname+now)
    .update(filename)
    .digest('hex');

  return 'tmp/' + hash + "." + extension;
}
// I sort of expected to be able to push a buffer piece by piece to the cloud
// and it seems like I am not able do that.  I haven't tried the multipart upload
// but I think that the sdk should just use the stream that node is trying to 
// make common place.  I think it works with a file reading from disk.  It would
// be awesome if the sdk had a way to push buffers to the cloud and then call end.
//
// I have no idea how much work that would take to make that working however, it would 
// be super cool.
// module.exports.stream = function(options) {
//   var StreamingUpload = klass(function(options) {
    
//     this.options = options;
//     // this.stream = new Readable;

//     if (this.options.key) {
//       this.key = this.options.key;
//     } else {
//       this.generateKey();
//     }

//   }).methods({
    
//     generateKey: function() {
//       var extension = this.options.filename.split('.').pop();
//       const hash = crypto.createHmac('sha256', this.options.fieldname)
//         .update(this.options.filename)
//         .digest('hex');

//       this.key = 'tmp/' + hash + "." + extension;
//     },

//     upload: function(next) {
//       var self = this;
//       this.file = s3Stream.upload({
// 	"Bucket": process.env.AWS_BUCKET,
// 	"Key": self.key
//       });

//       this.file.on('uploaded', function (details) {
// 	console.log(details);
//         if (next) {
//           next();
//         }
//       });
//       this.stream.pipe(this.file);
//     },

//     push: function(buffer) {
//       this.stream.push(buffer)
//     },

//     fromFile: function(path, next) {
//       this.stream = fs.createReadStream(path);
//       this.upload(next);
//     },

//     send: function(next) {
//       this.stream.push(null);
//       this.upload(next);
//     }
//   })
//   return new StreamingUpload(options);

// }

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
  //   if (err) console.log(err);
  //   console.log(data);
  s3bucket.copyObject(parameters, function(err, data){
    console.log('copied', parameters, err, data);
    var params = {
      Bucket:     process.env.AWS_BUCKET, 
      Key:        oldkey
    };

    // s3bucket.deleteObject(params, function(err, deleteData) {
      // console.log('deleted', params);
      var deleteData;
      if (next) {
        next(err, {copy: data, delete: deleteData});
      }   
    // });
  });
  });
}


