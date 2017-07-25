var mongoose = require('mongoose');

var Transaction = mongoose.model('Transaction',{
  // lets add a userInfo object that has id, name, email. or just id and email for now
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  order: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
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
