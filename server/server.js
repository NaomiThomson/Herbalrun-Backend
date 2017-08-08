require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
var jpeg = require('jpeg-js');
const fileUpload = require('express-fileupload');


var {mongoose} = require('./db/mongoose');
var {Item} = require('./models/item');
var {User} = require('./models/user');
var {Transaction} = require('./models/transaction');
var {Image} = require('./models/image');
var {authenticate} = require('./middleware/authenticate');

const {ObjectID} = require('mongodb');

const nodemailer = require('nodemailer');
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'confirmation.herbalrun@gmail.com',
        pass: 'HerbsRunning6'
    }
});

var app = express();
const port = process.env.PORT || 3000;

app.use(function(req,res,next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization, x-auth');
  res.setHeader('Access-Control-Expose-Headers', 'x-auth');
  next();
});

app.use(bodyParser.json());
app.use(fileUpload());

//-----------testing file upload-----------------
app.post('/upload', (req, res) => {
  console.log('---------1------------');
  console.log(req.files);
  console.log('----------2-----------');

  if (!req.files){
    return res.status(400).send('No files were uploaded.');
  } else {
    let sampleFile = req.files.sampleFile;
    console.log(sampleFile);
    
    let image = new Image({
      name: "sampleFile",
      file: req.files.sampleFile.data
    });

    image.save().then(() => {
      res.send('Uploaded')
    }).catch((e) => {
      console.log(e);
      res.status(500).send(e);
    })
  }
});

app.get('/image', (req, res) => {
  Image.find().then((images) => {
    console.log(images[0].file);
    // var image = new Image();
    // image.src = `data:image/png;base64,${images[0].file}`;
    var decodedImage = new Buffer(images[0].file, 'base64');
    fs.writeFile(__dirname + '/image_decoded.jpg', decodedImage, function(err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + '/image_decoded.jpg');
      }
    });
  }).catch((e) => {
    console.log(e);
  })
});


app.get('/image2', (req, res) => {
  res.sendFile(__dirname + '/images/inventory/default.jpg');
});

//----------------------------

app.post('/users', (req, res) => {
  //creates a user
  var body = _.pick(req.body, ['email', 'password', 'address', 'firstName', 'lastName', 'phoneNumber', 'DLNumber']);
  body.termsAccepted = true;
  var user = new User(body);
  user.cart = [];
  user.deliveries = [];

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    console.log(e);
    res.status(400).send(e);
  })
});

//---------------------------------Upload stuff------------------------------

app.post('/users/upload/id/:userId', (req, res) => {
  if (!req.files){
    return res.status(400).send('No files were uploaded.');
  } else {
    let idFile = req.files.file.data;

    User.findOneAndUpdate({_id: req.params.userId}, {$set: {idFile}}, {new: true})
      .then((user) => {
        res.send({user});
      }).catch((e) => {
        res.status(400).send();
      })
  }
});

app.post('/users/upload/rec/:userId', (req, res) => {
  if (!req.files){
    return res.status(400).send('No files were uploaded.');
  } else {
    let recFile = req.files.file.data;

    User.findOneAndUpdate({_id: req.params.userId}, {$set: {recFile}}, {new: true})
      .then((user) => {
        res.send({user});
      }).catch((e) => {
        res.status(400).send();
      })
  }
});

app.get('/users/files/id/:id', (req, res) => {
  User.findOne({_id: req.params.id}).then((user) => {
    var decodedImage = new Buffer(user.idFile, 'base64');
    fs.writeFile(__dirname + `userId_user=${req.params.id}.jpg`, decodedImage, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + `userId_user=${req.params.id}.jpg`)
      }
    })
  }).catch((e) => {
    console.log(e);
  })
});

app.get('/users/files/rec/:id', (req, res) => {
  User.findOne({_id: req.params.id}).then((user) => {
    var decodedImage = new Buffer(user.recFile, 'base64');
    fs.writeFile(__dirname + `userRec_user=${req.params.id}.jpg`, decodedImage, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + `userRec_user=${req.params.id}.jpg`)
      }
    })
  }).catch((e) => {
    console.log(e);
  })
});

//---------------------------------Upload stuff (for imagesvv) (for users ^^)------------------------------

app.post('/upload/item/:itemId', (req, res) => {
  if (!req.files){
    return res.status(400).send('No files were uploaded.');
  } else {
    let file = req.files.file.data;

    Item.findOneAndUpdate({_id: req.params.itemId}, {$set: {file}}, {new: true})
      .then((item) => {
        res.send({item});
      }).catch((e) => {
        res.status(400).send();
      })
  }
});

app.get('/upload/item/:itemId', (req, res) => {
  Item.findOne({_id: req.params.itemId}).then((user) => {
    var decodedImage = new Buffer(user.imageFile, 'base64');
    fs.writeFile(__dirname + `itemId=${req.params.itemId}.jpg`, decodedImage, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        res.sendFile(__dirname + `itemId=${req.params.itemId}.jpg`)
      }
    })
  }).catch((e) => {
    console.log(e);
  })
});

//---------------------------------Upload stuff------------------------------

app.patch('/users/:id', authenticate, (req, res) => {
  //edit user info
  //needs testing. Not used in project so far.
  var id = req.user._id;
  var body = _.pick(req.body, ['email', 'password', 'address', 'firstName', 'lastName', 'phoneNumber', 'DLNumber']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  };

  User.findOneAndUpdate({_id: id}, {$set: body}, {new: true})
    .then((user) => {
      if(!user){
        return res.status(404).send();
      }
      res.send({user});
    }).catch((e) => {
      res.status(400).send();
    });
});

app.patch('/users/verify/:id', authenticate, (req, res) => {
  //used ot verify/unverify a user

  if (req.user.admin == false){
    return res.send(401);
  }

  var verification = _.pick(req.body, ['verified']);

  User.findOneAndUpdate({_id: req.params.id}, {$set: verification}, {new:true})
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({user})
      let mailOptions = {
          from: '"HerbalRun" <confirmation.herbalrun@gmail.com>', // sender address
          to: user.email, // list of receivers
          subject: "You've been verified! ✔", // Subject line
          text: 'Hello world ?', // plain text body
          html: "<b>Your patient information has been verified. Happy shopping!</b><br>" // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
          res.send();
      });
    }).catch((e) => {
      res.status(400).send();
    })
})

app.patch('/users/deliver/:tranId', authenticate, (req, res) => {
  //appends the tranId to the users delivery Array. to keep track of deliveries the driver has made.

  if (req.user.admin == false){
    return res.send(401);
  }

  var newDelivery = {
    tranId: req.params.tranId
  }

  User.findOneAndUpdate({_id: req.user._id}, {$push: {deliveries: newDelivery}}, {new: true})
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({user})
    }).catch((e) => {
      res.status(400).send();
    })
    .then(() => {
      //not if i try to add dummy tranID for testing, this where the unhandled promise error comes, it cant update, maybe should seperate these
      Transaction.findOneAndUpdate({_id: req.params.tranId}, {$set: {hasDriver: true}}, {new:true}).then((transaction) => {
        User.findOne({_id: transaction.userId}).then((user) => {
          let mailOptions = {
              from: '"HerbalRun" <confirmation.herbalrun@gmail.com>', // sender address
              to: user.email, // list of receivers
              subject: 'On the way! ✔', // Subject line
              text: 'Hello world ?', // plain text body
              html: '<b>Your driver is on their way!</b><br>' // html body
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error);
              }
              console.log('Message %s sent: %s', info.messageId, info.response);
              res.send();
          });
        })
      })
    })
    .catch((e) => {
      console.log(e);
      res.status(400).send();
    })
});

app.patch('/users/undoDeliver/:tranId', authenticate, (req, res) => {
//undos to delivery commitment

  if (req.user.admin == false){
    return res.send(401);
  }

  User.findOneAndUpdate({_id: req.user._id}, {$pull: {deliveries: {tranId: req.params.tranId}}}, {new: true}).then((user) => {
    console.log(user);
  }).then(() => {
    Transaction.findOneAndUpdate({_id: req.params.tranId}, {$set: {hasDriver: false}}, {new:true}).then((transaction) => {
      console.log(transaction);
      res.send({transaction})
    })
  })
  .catch((e) => {
    console.log(e);
    res.status(400).send();
  })
});

app.post('/item', authenticate, (req, res) => {
  //creates new item

  if (req.user.admin == false){
    return res.send(401);
  }

  var item = new Item({
    name: req.body.name,
    category: req.body.category,
    thc: req.body.thc,
    cbd: req.body.cbd,
    cbn: req.body.cbn,
    ppe: req.body.ppe,
    ppq: req.body.ppq,
    pph: req.body.pph,
    ppo: req.body.ppo,
    pphg_extract: req.body.pphg_extract,
    ppg_extract: req.body.ppg_extract,
    ppi: req.body.ppi,
    stock: req.body.stock,
    licenseNumber: req.body.licenseNumber,
    flowerOriginal: req.body.flowerOriginal,
    harvestData: req.body.harvestData,
    harvestLot: req.body.harvestLot,
    testedBy: req.body.testedBy,
    testId: req.body.testId,
    dateTested: req.body.dateTested,
    icann: req.body.ican,
    mmps: req.body.mmps,
    imageFileName: req.body.imageFileName,
    _creator: req.user._id
  });

  item.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/item', (req, res) => {
// returns inventoryItems

  Item.find().then((item) => {
      res.send({item});
  }, (e) => {
      res.status(400).send(e);
  })
});

app.get('/item/:id', (req, res) => {
  //returns item by id

  Item.findOne({_id: req.params.id}).then((item) => {
    if (!item) {
      return res.status(404).send();
    }
    res.send({item})
  });
});

app.delete('/item/:id', authenticate, (req,res) => {
  //deletes item by id

  var id = req.params.id;

  if (req.user.admin == false){
    return res.status(401).send();
  }

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  };

  Item.findOneAndRemove({
    _id: id,
    // _creator: req.user._id //this makes sure its right person
  }).then((item) => {
    if(!item){
        return res.status(404).send();
    };
    res.send({item});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/item/:id', authenticate, (req, res) => {
  //make edits to an item

  if (req.user.admin == false){
    return res.send(401);
  }

  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'category', 'thc', 'cbd', 'cbn', 'ppe', 'ppq', 'pph', 'ppo', 'pphg_extract', 'ppg_extract', 'ppi', 'stock', 'licenseNumber', 'flowerOriginal', 'harvestData', 'harvestLot', 'testedBy', 'testId', 'dateTested', 'icann', 'mmps', 'imageFileName']);

  if(req.user.admin == false){
    return res.status(401).send();
  }

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  };

  Item.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((item) => {
    if (!item) {
      return res.status(404).send();
    }
    res.send({item});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.get('/users/me', authenticate, (req, res) => {
  //returns the user
  res.send(req.user);
});

app.get('/users', authenticate, (req, res) => {
  //returns all the users

  //make this admin only, but we can pass headers to middleware where this is used
  //maybe we can authenticate somewhere else? before page load
  //wrote this weeks ago^, i think i fixed it using cookies. needs double check.
  if(req.user.admin == false){
    return res.send(401);
  }

  User.find().then((user) => {
    res.send({user});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/users/:id', authenticate, (req, res) => {

  if (req.user.admin == false) {
    return res.send(401);
  }

  User.findOne({_id: req.params.id}).then((user) => {
    if (!user) {
      return res.status(404).send();
    };
    res.send({user});
  })
})


app.get('/users/cart/:id', (req, res) => {
  //returns a the cart by user id

  // return res.status(404).send('testing');
  // console.warn('getting cart');
  console.log('hello')

  User.findOne({_id: req.params.id}).then((user) => {
    if (!user) {
      return res.status(404).send();
    };
    var cart = user.cart;
    res.send({cart});
  }).catch((e) => {
    res.status(400).send();
  })
})

app.post('/users/login', (req, res) => {
  //login

  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    console.log(e);
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  //logout

  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.patch('/cart', authenticate, (req, res) => {
  var body = _.pick(req.body, ['itemId','units', 'quantity', 'name', 'ppe', 'ppq', 'pph', 'ppo', 'pphg_extract', 'ppg_extract', 'ppi']);

  User.findOneAndUpdate({_id: req.user._id}, {$push: {cart: body}}, {new: true})
    .then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send({user});
    }).catch((e) => {
      console.log(e);
      res.status(400).send();
    });
});;

app.delete('/users/cart/:id', authenticate, (req, res) => {
  // removes item from cart

  User.findOneAndUpdate({_id: req.user._id}, {$pull : {cart: {_id: req.params.id}}}, {new: true})
    .then((user) => {
      if(!user) {
        return res.status(404).send();
      }
      res.send({user});
    }).catch((e) => {
      res.status(400).send();
    })
});

app.post('/transactions', authenticate, (req, res) => {
  //checkout. dumps the cart and moves into transaction table

  if (req.user.verified == false) {
    return res.status(401).send("unverified");
  }
  var transaction = new Transaction({
    userId: req.user._id,
    total: req.body.total,
    deliveryAddress: req.body.deliveryAddress,
    order: []
  });

  transaction.save().then((doc) => {
    var email;
    res.send(doc);
    var transactionId = doc._id;
    User.findOne({_id: req.user._id}).then((user) => {
      email = user.email;
      if (!user) {
        return res.status(404).send();
      }
      var cart = user.cart;
      for (i=0; i<cart.length; i++) {
        var cartItem = {
          itemId: cart[i].itemId,
          unit: cart[i].units,
          quantity: cart[i].quantity,
          name: cart[i].name
        }
        Transaction.findOneAndUpdate({_id: transactionId}, {$push: {order: cartItem}}, {new: true}).then((transaction) => {
          tranId_user = transaction._id;
          if (!transaction) {
            return res.status(404).send();
          }
          res.send({transaction});
        }).catch((e) => {
          console.log(e);
          res.status(400).send();
        })
      }
    })
    .then((user) => {
      //delete user cart since everything checked out
      User.findOneAndUpdate({_id: req.user._id}, {$set: {cart: []}}, {new: true}).then((user) => {
        console.log(user);
      })
    })
    .then(() => {
      let mailOptions = {
          from: '"HerbalRun" <confirmation.herbalrun@gmail.com>', // sender address
          to: email, // list of receivers
          subject: 'Order Recieved ✔', // Subject line
          text: 'Hello world ?', // plain text body
          html: '<b>You order has been recieved, You will recieve another email when your driver is on their way.</b><br>' + `<p>You transaction number is: ${transactionId} </p>` // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);
          res.send();
      });
    })
    .catch((e) => {
      console.log(e);
    })
  }, (e) => {
    res.status(400).send(e);
  });
});

app.patch('/inventory/:id', (req, res) => {
  var body = _.pick(req.body, ['invType', 'quantity']);
  var inventoryType = body.invType;
  console.log(inventoryType);

  Item.findOne({_id: req.params.id}).then((item) => {
    console.log(item);
    var inventoryCurrent = item[inventoryType];
    var inventoryNew = inventoryCurrent - body.quantity;
    console.log(inventoryNew);
    var query = {};
    var criteria = inventoryType;
    query[inventoryType] = inventoryNew;
    Item.findOneAndUpdate({_id: req.params.id}, {$set: query}, {new: true}).then((item) => {
      console.log(item);
      console.log('1');
      res.send({item});
    })
  })
  .catch((e) => {
    console.log('2');
    res.status(400).send();
    console.log(e);
  })

})

app.get('/transactions', authenticate, (req, res) => {
  //returns all transactions

  if (req.user.admin == false){
    return res.status(401).send();
  }

  Transaction.find().then((transaction) => {
    res.send({transaction});
  }, (e) => {
    res.status(400).send();
  });
});

app.patch('/transactions/:id', authenticate, (req, res) => {
  //this is for admins to complete orders

  if (req.user.admin == false){
    return res.send(401);
  }

  var id = req.params.id;
  var body = _.pick(req.body, ['completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  };

  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Transaction.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((transaction) => {
    if (!transaction) {
      return res.status(404).send();
    }
    res.send({transaction});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
