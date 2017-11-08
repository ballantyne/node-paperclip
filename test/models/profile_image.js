const path         = require('path');
const klass        = require('klass');
const mongoose     = require('mongoose');
const Schema       = mongoose.Schema;
const Paperclip    = require(path.join(__dirname, '../..', 'index'));

const ProfileImage = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  username: String
});

ProfileImage.plugin(Paperclip.plugins.mongoose, {
  profile_image: {
    avatar: {
      styles: [
        { original: true },
        { tiny:     { width: 50,  height: 50,  modifier: '#' } },
        { thumb:    { width: 100, height: 100, modifier: '#' } },
        { profile:  { width: 200, height: 200, modifier: '#' } }
      ],
      prefix:      '{{class_name}}/{{plural}}/{{document.username}}',
      name_format: '{{style}}.{{extension}}',
      storage:     'mock-file-system'
    }
  }
})

module.exports = mongoose.model.ProfileImage || mongoose.model('ProfileImage', ProfileImage);
