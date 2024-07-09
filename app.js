if(process.env.NODE_ENV != "production")
{ 
    require('dotenv').config();
}
// console.log(process.env.secret); // it print hte secrate value


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError=require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");




const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter  = require("./routes/user");

const dbUrl = process.env.ATLASDB_URL;
main().then(()=>{
    console.log("connection success");
})
.catch(err=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname ,"/public")))

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600,
    
});

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
});

const sessionOptions= {
    store,
    secret : process.env.SECRET,
    resave:false,
    saveUninitialized:true,

    cookie:{
        expires : Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



// access all listing routes
app.use("/listings",listingRouter);

// access all review route

app.use("/listings/:id/reviews",reviewRouter);

// access all userrouter

app.use("/",userRouter);






// handling on the route

app.all("*",(req,res,next)=>{
    throw next(new ExpressError(404,"Page Not Found!"));
});

//middlewares to handle the error

app.use((err,req,res,next)=>{
    let {statuscode=500,message="something went wrong!"}=err;

    res.status(statuscode).render("error.ejs",{message});
    // res.status(statuscode).send(message);
})


app.listen(8080,()=>{
    console.log("app is listining on the port 8080");
});