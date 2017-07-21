var mongoose = require('mongoose');

var Transaction = mongoose.model('Transaction',{
  // lets add a userInfo object that has id, name, email. or just id and email for now
  userId: {
    type: String,
    required: true
  },
  order: [{
    itemId: {
      type: String,
      required: true
    },
    unitType: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
    //we can add a price per order item here
  }],
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  hasDriver: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

module.exports = {Transaction};
