var path         = require('path');
var expect       = require("chai").expect;
var main         = require(path.join(__dirname, '..', 'index'));
var Paperclip    = main.paperclip;
var mongoose     = require('mongoose');
mongoose.Promise = require('bluebird'); 

const fileType   = require('file-type');
const fs         = require('fs');
const bodyParser = require('body-parser');
const request    = require('supertest');
const express    = require('express');
const app        = express();
const tools  = require(path.join(__dirname, 'tools'));

var promise      = mongoose.createConnection('mongodb://localhost/test_paperclip', {
  useMongoClient: true,
});

var ProfileImage = mongoose.models.ProfileImage || require(path.join(__dirname, 'models', 'profile_image'));

describe("Node Paperclip", function() {
  describe("Model", function() {
    it("upload file", function(done) {
      var response = {profile_image: {}}
      response.profile_image.avatar = tools.upload();
      ProfileImage.create(response, function(err, doc) {
        console.log(err);
        console.log(doc);
        done();
      });
    });
  });
})

