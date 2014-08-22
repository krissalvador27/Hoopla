// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var domainSchema = new mongoose.Schema({
  parent_id : Number,
  domain_name : String
});

// methods ======================
//get all the las for the domain
domainSchema.methods.getHoops = function(id) {
  return Hoop.findOne({parent_id : id});
};

// create the model for domains and expose it to our app
module.exports = mongoose.model('Domain', domainSchema);
