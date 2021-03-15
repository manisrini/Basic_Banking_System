const mongoose = require("mongoose");

const txhistory_schema = new mongoose.Schema({
	sender_name : String,
	rec_name    : String,
	amount      : Number ,
	date_of_tx	: Date 
})

const Transaction = mongoose.model("Transaction",txhistory_schema)

module.exports = Transaction