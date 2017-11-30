const path        = require('path');
const Paperclip   = require(path.join(__dirname, '..', 'index')).paperclip;
const Upload      = require(path.join(__dirname, '..', 'upload'));
const _           = require('underscore');

module.exports    = function paperclip (schema, opts) {
  var configuration = {};
  _.extend(configuration, opts);
  var configkeys                 = _.keys(configuration);
  for (i = 0; i < configkeys.length; i++) {
    var class_name           = configkeys[i];
    var files                = configuration[class_name];
    var paperclip            = new Paperclip(configuration);
    var keys                 = _.keys(files);

    schema.methods.thumbnail = function(file, style) {
      paperclip.document = this;
      var c = paperclip.class(class_name, file);
      return c.fileSystem.host() + c.thumbnail(style);
    };

    schema.methods.paperclip = function() {
      return paperclip
    };

    for (i = 0; i < keys.length; i++) {

      var name               = keys[i];

      var options            = files[name];
      var obj                = {};
      obj[name]              = {};

      schema.add(obj);     
    

      schema.pre('save', function preSave(next) {
        var self = this;
        if (this.uploads == undefined) this.uploads = new Upload();

        if (this[name]) {
          this.uploads.store(name, this[name]);
          var save                             = JSON.parse(JSON.stringify(this[name]));
          save.created_at                      = new Date();
          save                                 = paperclip.toSave(save);
          this[name]                           = save;
          paperclip[class_name].document       = this
          paperclip[class_name][name].file     = this.uploads.get(name);
          
          paperclip.beforeSave(class_name, name, function(err, doc) {
            _.extend(self[name], doc);
            next();
          })
        } else {
          next()
        }
      })

      schema.post('save', function postSave(doc, next) {
        var upload                             = this.uploads.get(name);
        
        if (upload) {
          paperclip[class_name].document       = doc;
          paperclip[class_name][name].file     = upload;
          paperclip.afterSave(class_name, name, function(err, result) {
            next()
          })
        } else {
          next();
        }
      }) 

      schema.pre("update", function preUpdate(next) {
        if (this.uploads == undefined) this.uploads = new Upload();
        
        if (this[name]) {
          this.uploads.store(name, this[name]);
          var save                             = paperclip.toSave(JSON.parse(JSON.stringify(this[name])));
          this[name]                           = save;
          paperclip[class_name].document       = this;
          paperclip[class_name][name].file     = this.uploads.get(name);
          paperclip.beforeSave(class_name, name, function(err, doc) {
            _.extend(self[name], doc)
              next()
          })
        } else {
          next()
        }
      });

      schema.post('update', function postUpdate(error, res, next) {
        
        var upload                             = this.uploads.get(name);
        if (upload) {
          paperclip[class_name].document       = res;
          paperclip[class_name][name].file     = upload;
          paperclip.afterSave(class_name, name, function(err, result) {
            next()
          })
        } else {
          next();
        }
      });

      schema.post('remove', function postRemove(doc) {
        paperclip[class_name].document         = doc;
        paperclip.afterRemove(class_name, name, function(err, result) {
          console.log('deleted', doc.constructor.modelName, doc._id);
        })
      }) 
    }

  }
}
