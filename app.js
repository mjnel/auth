var express = require ("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy  = require("passport-local"),
    User = require("./models/user"),
    passportLocalMongoose = require("passport-local-mongoose")



//app config
mongoose.connect ("mongodb://localhost/AuthDemoApp");
var app = express();
app.set('view engine', 'ejs');
//Setting up passport to work in the applicaiton 
app.use(require("express-session")({
    secret: "Life is not fair",
    // encode and decode sessions 
    resave: false,
    saveUninitialized: false
}))
app.use(bodyParser.urlencoded({extended: true}));


app.use(passport.initialize());
app.use(passport.session());



//Seralize - taking the data from the session encoding and deenconding it 
// inside user.js - passport-local-mongoose we have added these methods in automatically to the User Model. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//creatng a new passport-local (local strategy) using the user.authenticate method coming from the passport local mongoose (comes from passportlocalmongoose)
passport.use(new LocalStrategy(User.authenticate()));



//=======================================
// ROUTES
//=======================================




app.get("/", function(req, res){
    
    res.render("home");
})


// get request comes in- run is Logged in - is the request authenticated? If so, return next - next = next function - keep going. If not - res.render("secret").

app.get("/secret",isLoggedIn ,function(req, res){
    
    res.render("secret");
})


//Auth  Routes

// show the sign up form 
app.get("/register", function(req, res){
    
    res.render("register");
    
})


//handling the user sign up
app.post("/register", function(req, res){
    
// Creating a new username which is the only thing which is passed to the db. Not saving passowrd to the DB. Pass the password as a second argument to "User.register". User.register will hash that password into big string of letter and numbers and persist into mongo. Return a new username with the hashed password.  
    User.register(new User({username: req.body.username}), req.body.password, function( err, user){ 
        if(err){
            console.log(err);
            return res.render("register");
        }
        //Passport authenticate - logs the user in, runs the seralize method. change strategy to twitter/facebook.  
            passport.authenticate("local")(req, res, function(){
                //raw password not saved in DB, what we/re storing is hashed version and salt to unshash. All taken careof with the passport local mongoose pacakge we installed and is a plugin on the user.js model. 
            res.redirect("/secret");
             
        });
        
    });
    
    
})






//LOGIN ROUTE

app.get("/login", function (req, res){
    res.render("login");
    
})


//middeleware - code which runs before the final call back function. 
// app gets request to /POST - runs that code immidentaly. Sit between route start and the end of route handler.  

// passport.authenticate - takes username and password which is the request.body. Don't even need to specify that in the form. Compare the password the user typed in and compare to the one in the db. 
app.post("/login", passport.authenticate("local",{
    successRedirect: "/secret",
    failureRedirect: "/login" 
}))



//Logout


app.get("/logout", function(req, res){
    //passport is destroying data in the session 
      req.logout();
    res.redirect("/");
})


//req - request 
//res - response
// next - next thing which needs to be called. Expres takes care and knows what to add in. 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
       return next();
       }
    res.redirect("/login");
    
}


app.listen(3000, function () {
  console.log('up on localhost:3000')
})