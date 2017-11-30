var path         = require('path');
var expect       = require("chai").expect;
var main         = require(path.join(__dirname, '..', 'index'));
var Paperclip    = main.paperclip;
var _            = require('underscore');
const tools      = require(path.join(__dirname, '..', 'tools'));
const fileType   = require('file-type');
// var photos       = require(path.join(__dirname, 'data', 'flickr'));

var ProfileImage = require(path.join(__dirname, 'models', 'profile_image'));

describe("Node Paperclip", function() {

  before(function(done) {
    ProfileImage.remove({}, function(err, doc) {
      done();
    })
  })
  
  describe("Model", function() {
    it("upload file", function(done) {
      var response = {profile_image: {}}
      
      response.profile_image.avatar = tools.fromFile();

      response.profile_image.username = 'scott';

      var sizes = { 
        original: { width: 2448, height: 3264} ,
        tiny:     { width: 50,   height: 50, } ,
        thumb:    { width: 100,  height: 100 } ,
        profile:  { width: 200,  height: 200 } 
      }
 
      ProfileImage.create(response.profile_image, function(err, doc) {
        var files = global.mock_file_system; 
        var analyzed = [];
        styles = ['original', 'tiny', 'thumb', 'profile'];
        _.each(styles, function(style) {
          tools.identify(files[doc.thumbnail('avatar', style)], function(err, metadata) {
            analyzed.push(metadata);
            expect(metadata.width).to.equal(sizes[style].width);
            expect(metadata.height).to.equal(sizes[style].height);
            expect(doc.thumbnail('avatar', style)).to.equal('profile_image/avatars/scott/'+style+'.jpg')           
       
            if (_.last(styles) == style) {
	      done();
            }

          });
        });
      });
    });
  });
})

