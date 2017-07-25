var mongoose = require('mongoose');

var Item = mongoose.model('Item',{
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  category: {
    //indica, sativa, hybrid, extract, tank, edibles, misc
    type: String,
    required: true
  },
  thc: {
    type: Number,
    required: false
  },
  cbd: {
    type: Number,
    required: false
  },
  cbn: {
    type: Number,
    required: false
  },
  ppe: {
    type: Number,
    default: 0
  },
  ppq: {
    type: Number,
    default: 0
  },
  pph: {
    type: Number,
    default: 0
  },
  ppo: {
    type: Number,
    default: 0
  },
  pphg_extract: {
    type: Number,
    default: 0
  },
  ppg_extract: {
    type: Number,
    default: 0
  },
  ppi: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  licenseNumber: {
    type: String,
    required: false
  },
  flowerOriginal: {
    type: String,
    required: false
  },
  harvestData: {
    type: String,
    required: false
  },
  harvestLot: {
    type: String,
    required: false
  },
  testedBy: {
    type: String,
    required: false
  },
  testId: {
    type: String,
    required: false
  },
  dateTested: {
    type: String,
    required: false
  },
  icann: {
    type: String,
    required: false
  },
  mmps: {
    type: String,
    required: false
  },
  imageFileName: {
    type: String,
    required: false
  },
  _creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
  }
});

module.exports = {Item};
