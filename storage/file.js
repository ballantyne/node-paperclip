const config     = require('config');
const fs         = require('fs');
const mkdirp     = require('mkdirp');

const root       = (config.root ? config.root : (process.env.PWD));
const assets     = (config.assets ? config.assets : '/public')
const public_dir = root + '/' + assets;
const crypto     = require('crypto');

var fullPath     = function(key) {
  return public_dir + "/" + key;
}

var containingDirectory = function(key) {
  var dir = fullPath(key).split('/');
  dir.pop();
  return dir.join('/');
}

var ensureDir = function(key, next) {
  fs.exists(containingDirectory(key), function(exists) {
    if (exists) {
      next(null);
    } else {
      mkdirp(containingDirectory(key), function(err) {
        next(err);
      })
    }
  });
}

module.exports.stream = function(key, stream, next) {
  var writeStream = fs.createWriteStream(key); 
  writeStream.on('close', function() {
    if (next) {
      next();
    }
  })
  stream.pipe(writeStream);
}

module.exports.generateKey = function(fieldname, filename, next) {
  var now = new Date().getTime().toString();
  var extension = filename.split('.').pop();
  const hash = crypto.createHmac('sha256', fieldname+now)
    .update(filename)
    .digest('hex');

  return '/tmp/' + fieldname + "-" + hash + "." + extension;
}



module.exports.put = function(key, body, next) {
  ensureDir(key, function(err) {
    fs.writeFile(fullPath(key), body, function(err, data){
      if (next) {
        next(err, data);
      }
    });
  });
}

module.exports.get = function(key, next) {
  fs.readFile(fullPath(key), function(err, data) {
    var data = data.Body.toString('utf-8'); 
    if (next) {
      next(err, data);
    }
  });
}

module.exports.delete = function(key, next) {
  fs.unlink(fullPath(key), function (err, data) {
    fs.readdir(containingDirectory(key), function(err, items) {
      if (items && items.length == 0) {
        fs.rmdir(containingDirectory(key), function(err) {
          if (next) {
            next(err, key);
          }
        }) 
      } else {
        if (next) {
          next(err, key);
        }
      }
    })
  });
}

module.exports.move = function(oldkey, key, next) {
  ensureDir(key, function(err) {
    fs.rename('/'+oldkey, key, function(err) {
      if (next) {
        next(err);
      }
    })
  })
}

