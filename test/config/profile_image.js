var fileSystem = require('node-paperclip-mock-file-system');

module.exports = {
  profile_image: {
    avatar: {
      before_save: [

      ],
      styles: [
      {original: true }        
      ],
      prefix: '{{class_name}}/{{plural}}/{{document.username}}',
      name_format: '{{style}}.{{extension}}',
      storage: 'mock-file-system'
    }
  }
}

