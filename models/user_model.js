var mongoose = require("mongoose");


//creating a schema
const userSchema = new mongoose.Schema({
	name  : String,
	email : String,
	phoneNum : String,
	balance : Number
});

const User = mongoose.model("User",userSchema);

module.exports = User;