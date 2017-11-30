const path         = require('path');
const klass        = require('klass');
const mongoose     = require('mongoose-memories');
const Schema       = mongoose.Schema;
const Paperclip    = require(path.join(__dirname, '..', '..', 'index'));


const Photo = new Schema({});

Photo.plugin(Paperclip.plugins.mongoose, {
  photo: {
    file: {
      styles: [
        { original: true },
        { tiny:     { width: 50,  height: 50,  modifier: '#' } },
        { thumb:    { width: 100, height: 100, modifier: '#' } },
        { profile:  { width: 200, height: 200, modifier: '#' } }
      ],
      storage:     'mock-file-system'
    }
  }
})


module.exports = mongoose.model('Photo', Photo);
