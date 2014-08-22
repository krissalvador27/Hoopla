// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var hoopSchema = new mongoose.Schema({
  parent_id : String,
  title : String,
  commenter : String,
  body : String,
  image_link : String,
  score : Number,
  timestamp : String,
  replies : Array
});

// methods ======================
//get all the las for the hoop
hoopSchema.methods.getLas = function(id) {
  return Hoop.findOne({_id : id}).replies;
};

hoopSchema.methods.getScore = function(id) {
  return Hoop.findOne({_id : id}).score;
}

module.exports = mongoose.model('Hoop', hoopSchema);
