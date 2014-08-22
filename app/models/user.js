// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = new mongoose.Schema({

    local            : {
        domain       : String,
        password     : String,
        username	 : String,
        email        : String,
        hasAccess    : Boolean
    },
    plusOnes	 : Array

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.generateDomain = function(email) {
	var emailSplit = email.split('@');
	var afterAt = emailSplit[1];
	var domain = afterAt.split('.');
	return domain[0];
}

userSchema.methods.generateUsername = function(email) {
	var emailSplit = email.split('@');
	return emailSplit[0];
}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
