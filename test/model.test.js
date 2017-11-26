var path         = require('path');
var expect       = require("chai").expect;
var main         = require(path.join(__dirname, '..', 'index'));
var Paperclip    = main.paperclip;
var mongoose     = require('mongoose-memories');
var _            = require('underscore');
const tools      = require(path.join(__dirname, '..', 'tools'));

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
        styles = ['original', 'tiny', 'thumb', 'profile'];
        _.each(styles, function(style) {
          var key = 'profile_image/avatars/'+response.profile_image.username+"/"+style+".jpg"
          tools.identify(global.mock_file_system[key], function(err, metadata) {
        
            expect(metadata.width).to.equal(sizes[style].width);
            expect(metadata.height).to.equal(sizes[style].height);
            
            if (_.last(styles) == style) {
	      done();
            }

          });
        })
      });
    });
  });
})

