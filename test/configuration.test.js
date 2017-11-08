var path      = require('path');
var expect    = require("chai").expect;
var main      = require(path.join(__dirname, '..', 'index'));
var Paperclip = main.paperclip;


var ProfileImage = require(path.join(__dirname, 'config', 'profile_image'));


describe("Node Paperclip", function() {
  describe("Configuration", function() {
    
    it("before_save", function(done) {
      var paperclip = new Paperclip(ProfileImage);
      expect(paperclip.profile_image.avatar.before_save.length).to.equal([].length);
      done()
    });
    
    it("styles", function(done) {
      var paperclip = new Paperclip(ProfileImage);
      expect(JSON.stringify(paperclip.profile_image.avatar.styles)).to.equal(JSON.stringify([{original: true}]));
      done()
    });
    
    it("prefix", function(done) {
      var paperclip = new Paperclip(ProfileImage);
      expect(paperclip.profile_image.avatar.prefix).to.equal('{{class_name}}/{{plural}}/{{document.username}}');
      done()
    });
    
    it("storage", function(done) {
      var paperclip = new Paperclip(ProfileImage);
      expect(paperclip.profile_image.avatar.storage).to.equal('mock-file-system');
      done()
    });
    
    it("name format", function(done) {
      var paperclip = new Paperclip(ProfileImage);
      expect(paperclip.profile_image.avatar.name_format).to.equal('{{style}}.{{extension}}');
      done()
    });

  });
})
