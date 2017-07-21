# HerbalRun-API
REST API for HerbalRun Delivery system built with Node.js, Express.js, and MongoDB

This project consists of three components: the API, the store site, and the admin site.

You can view the the Web Store [Here](https://stormy-basin-68279.herokuapp.com/) and it's repo [here](https://github.com/ShawnFarsai/HerbalRun-Webserver-Store).

And you can try out the [Admin Site](https://github.com/ShawnFarsai/HerbalRun-Webserver) using the following login. Email: antoineleftfoot@gmail.com , password: testing. And it's repo [Here](https://arcane-shelf-59513.herokuapp.com/)

### Features

- three models: User, Item, and Transaction
- POST, GET, PATCH routes for signing up, logging in, editing user info
  - API uses JSON Web Tokens for middleware authentication throughout the app. For example, POST '/users/login' generates an auth token which gets set in the header
  - the User model has three important methods: generateAuthToken, removeToken, and findByToken.
  -these methods make it easy to check whether a user making an API request is a user, an admin, or an employee

#### Data Flow

- User model has a cart array property. When they add something to their cart, we push onto that array. Then when the user decided to checkout, we fire the the POST '/transactions' route. This route:
  - first checks if the user is a verified paitent (making use of the user schema methods mentioned previously)
  - then creates a new Transaction object so that we can push to it later
  - We save the Transaction which returns a promise. Within the .then() we then make the call to locate the User who made the call with User.findOne({_id: req.user._id})
  - Now that we have the user, we have their cart. From here we iterate through the cart and push the Items to the transaction object we just created.
  - Next, we go back to User and dump its cart
  - And finally, we use Nodemailer to send the user an automated email notifying them that their order has been recieved.
