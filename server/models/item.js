var mongoose = require('mongoose');

var Item = mongoose.model('Item',{
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  consumptionForm: {
    //i.e. flower, concentrate, edible
    type: String,
    required: true
  },
  flowerType: {
    //i.e. indica, sativa, hybrid
    type: String,
    required: false
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
  pricePerEigth: {
    type: Number,
    requied: false,
    default: 0
  },
  pricePerGram: {
    type: Number,
    requied: false,
    default: 0
  },
  pricePerItem: {
    type: Number,
    requied: false,
    default: 0
  },
  inventoryGrams: {
    type: Number,
    required: false
  },
  inventoryItems: {
    type: Number,
    required: false
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
