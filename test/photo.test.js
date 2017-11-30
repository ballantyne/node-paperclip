var path         = require('path');
var expect       = require("chai").expect;
var main         = require(path.join(__dirname, '..', 'index'));
var Paperclip    = main.paperclip;
var _            = require('underscore');
const tools      = require(path.join(__dirname, '..', 'tools'));

var photos       = require(path.join(__dirname, 'data', 'flickr'));
var photoKeys    = _.keys(photos);

var Photo = require(path.join(__dirname, 'models', 'photo'));

_.each(photoKeys, function(p) {
  describe("Node Paperclip", function() {

    before(function(done) {
      var downloads = [];
      var url = photos[p].url;
      tools.fromFile(url, function(err, file) {
        done();
      })
    });


    describe("Upload Flickr photo "+p, function() {
      it("upload photo ", function(done) {
        var response = {photo: {}}
        var photo = photos[p];
        tools.fromFile(photo.url, function(err, file) {
          response.photo.file = file;
          var sizes = { 
            original: { width: photo.width, height: photo.height } ,
            tiny:     { width: 50,   height: 50, } ,
            thumb:    { width: 100,  height: 100 } ,
            profile:  { width: 200,  height: 200 } 
          }

          Photo.create(response.photo, function(err, doc) {
            styles = ['original', 'tiny', 'thumb', 'profile'];
            _.each(styles, function(style) {
              var key = 'photo/files/' + doc._id + "/" + style + ".jpg";
              tools.identify(global.mock_file_system[key], function(err, metadata) {
                expect(metadata.width).to.equal(sizes[style].width);
                expect(metadata.height).to.equal(sizes[style].height);
                if(_.last(styles) == style) {
                  done();
                }

              });
            })
          });
        });
      });
    });
  });
})
