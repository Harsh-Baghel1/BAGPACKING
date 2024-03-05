if(process.env.NODE_ENV !="production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("../Bagpack/models/listing.js");
const path = require("path");
const methodOverRide = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const mongoStore = require("connect-moongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = ("passport-local");
const user = require("./models/user.js");
const listingRouter =require("./models/review.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const MongoStore = require("connect-mongo");


// const MONGO_URL = "mongodb://127.0.0.1:27017/Bagpack";
 const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,("/public"))));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error", ()=> {
  console.log("ERROR in mongo session store",err);
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie: {
    expires:Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser", async(req, res) => {
//   let fakeUser = new user({
//     email:"user@gmail.com",
//     username: "customer-user",
//   });

//   let registerUser = await user.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.use("*",(err, req,res, next)=> {
  next(new ExpressError(404, "page Not Found!"));
});

app.use ((err,req,res,next) => {
  let {statusCode=500, message="something went wrong!"} = err;
  res.status(statusCode).render("error.ejs",{message});

//  // res.status(statusCode).send(message);
 });

// app.get("/", (req,res) => {
//   res.send("Welcome to Bagpack!");
// }); 

// app.get("/testListing", async (req,res) => {
//   let sampleListing = new Listing({
//     title: "My new villa",
//     description: "By the beach",
//     price: 1500,
//     location: "calangutte, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");

// }); 

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});