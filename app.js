var express    = require("express");
var app 	   = express();
var flash      = require("connect-flash");
var mongoose   = require("mongoose");
var User       = require("./models/user_model.js")
var Transaction= require("./models/transaction_history_model.js") 
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({extended:false}))

//mongodb+srv://Manikandan:<password>@cluster0.2j7rp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
mongoose.connect(process.env.DBURL,{
	useNewUrlParser: true,
  	useUnifiedTopology: true
})
.then(() =>{
	console.log("Connected to bank db");
})
.catch(error => {
	console.log("Error in connecting db");
})

app.use(flash())

app.use(require("express-session")({
	secret : "123",
	saveUninitialized : false,
	resave : false
}))


app.get("/",function(req,res){
	res.render("landing")
})

//List all users
app.get("/users",function(req,res){
	
	User.find({},function(err,user){
		if(err){
			console.log("Error in finding users")
			res.redirect("back");		
		}else{
			res.render("users",{users : user});
		}
	})
	
})



//transaction 
app.post("/users/:id/transactions",function(req,res){
	
	User.find({},function(err,foundAllUsers){
		if(err){
			console.log("Error in finding users")
			res.redirect("back");		
		}else{
			
	User.findById(req.params.id,function(err,foundUser){
		if(err){
			console.log('error in post findbyId')
			res.redirect("back")
		}
		else{
			res.render("new_transaction",{currentUser : foundUser,users : foundAllUsers})
		}
	})
		}
	})
	
})

app.get("/transactions",function(req,res){
	
	Transaction.find({},function(err,allTx){
		if(err){
			console.log("err in get transactions")
			res.redirect("back")
		}else{
			res.render("transaction_history",{allTx : allTx})
		}
	})	
	
})	

//transaction history
app.post("/transactions",function(req,res){
	
	
	req.flash("success","Payment Sucessfull!!!!")
	var sender_bal = parseInt(req.body.sender_balance) - parseInt(req.body.transfer_amt)
	User.find({name : req.body.rec_name},function(err,foundReceiver){
		if(err){
			console.log("Err in receiver");
			res.redirect("back")
		}else{
			
			var receiver_balance = parseInt(foundReceiver[0].balance) + parseInt(req.body.transfer_amt);
			console.log(sender_bal)
			console.log(receiver_balance)
			
			//update receiver balance
			var update_recv_balance = {balance : receiver_balance};
			User.findOneAndUpdate({name : req.body.rec_name},update_recv_balance,{
				new : true
			},function(err,updatedUser){
				if(err){
					console.log(err)
					res.redirect("back")
				}else{
					console.log("updated receiver")
				}
			})
			
		}
	})

	
	var update_sender_balance = {balance : sender_bal};
	
	User.findOneAndUpdate({name : req.body.sender_name},update_sender_balance,{
		new : true
	},function(err,updatedUser){
		if(err){
			console.log(err)
			res.redirect("back")
		}else{
			console.log("updated sender")
		}
	})
	
	

	
	
	const Tx_history = {
		sender_name : req.body.sender_name,
		rec_name    : req.body.rec_name,
		amount      : req.body.transfer_amt,
		date_of_tx  : new Date()
	}
	
	
	

	
	
	
	
	
	Transaction.create(Tx_history,function(err,newTx){
		if(err){
			console.log("err in tx history pos");
			res.redirect("back");
		}
		else{
			Transaction.find({},function(err,foundTx){
				if(err){
					console.log("Error in finding tx")
					res.redirect("back")
				}else{
					res.render("transaction_history",{newTx : newTx,allTx : foundTx,message : req.flash("success")})

				}
			})
		}
	})
	
})
app.listen(process.env.PORT||3001,process.env.IP,function(){
	console.log("Server started");
});