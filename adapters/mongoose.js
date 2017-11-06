const Paperclip   = require('../paperclip');
const _           = require('underscore');

module.exports    = function paperclip (schema, opts) {
  for (i = 0; i < opts.files.length; i++) {
    var options            = opts.files[i];
    var name               = options.has_attached_file;
    var paperclip          = new Paperclip(options);

    var obj                = {};
    obj[name]              = {};

    schema.add(obj);

    // This is the best way that I could find to save only the information that I 
    // wanted saved in the database but be able to use all of the information available
    // during the upload process without having to recreate the information during the
    // processing.  comments and suggestions are welcome.  Also, if other people want to 
    // make middleware that works with other orms that would be great.
    schema.pre('save', function (next) {
      var self = this;
      if (this.uploads == undefined) this.uploads = {};
      var upload           = _.clone(this[name]);
      
      if (upload) {
	this.uploads[name] = upload;
        this.uploads[name].fieldname = name;
	var save           = this[name];
        save.created_at    = new Date();
	this[name]         = paperclip.toSave(save);
	next()
      } else {
	next()
      }
    })

    schema.pre("update", function(next) {
      if (this.uploads == undefined) this.uploads = {};
      var upload           = _.clone(this[name]);
      if (upload) {
	this.uploads[name] = upload;
        this.uploads[name].fieldname = name;
        this[name]         = paperclip.toSave(this[name]);
	next()
      } else {
	next()
      }
    });
    
    schema.post('update', function(error, res, next) {
      var upload           = this.uploads[name];
      if (upload) {
	paperclip.document = doc;
	paperclip.file     = upload;
	paperclip.processUpload(function(err, result) {
	  next()
	})
      } else {
        next();
      }
    });


    schema.post('save', function (doc, next) {
      var upload           = this.uploads[name];
      if (upload) {
	paperclip.document = doc;
	paperclip.file     = upload;
	paperclip.processUpload(function(err, result) {
	  next()
	})
      } else {
        next();
      }
    }) 

    schema.post('remove', function (doc) {
      paperclip.document   = doc;
      paperclip.processDelete(function(err, result) {
        console.log('deleted', doc.constructor.modelName, doc._id);
      })
    }) 
  }
}
