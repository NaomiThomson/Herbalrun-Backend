var mongoose = require('mongoose');

var Image = mongoose.model('Image',{
  name: {
    type: String
  },
  file: {
    type: Buffer
  }
});

module.exports = {Image};
