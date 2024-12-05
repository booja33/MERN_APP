const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

//mongodb connection
console.log(process.env.MONGODB_URL);
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("connect to database"))
  .catch((err) => console.log(err));

//schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

//model
const userModel = mongoose.model("user", userSchema);


//api
app.get("/", (req, res) => {
    res.send("Server is running");
  });

  app.post("/signup", async (req, res) => {
    console.log(req.body);
    const { email } = req.body;
  
    try {
      // Check if a user with the provided email already exists
      const existingUser = await userModel.findOne({ email });
  
      // If user exists, send a response indicating the email is already registered
      if (existingUser) {
        return res.status(400).send({ message: "Email id is already registered", alert: false });
      }
  
      // If the email is not registered, create a new user
      const newUser = new userModel(req.body);
      
      // Save the new user to the database
      await newUser.save();
      
      // Respond with a success message
      res.status(201).send({ message: "Successfully signed up", alert: true });
  
    } catch (err) {
      // If there is any error, catch it and send an error response
      console.error(err);
      res.status(500).send({ message: "Internal server error", alert: false });
    }
  });

  // api login
  app.post("/login", async (req, res) => {
    try {
      const { email } = req.body;
  
      // Use await to handle the promise returned by findOne
      const result = await userModel.findOne({ email: email });
  
      if (result) {
        const dataSend = {
          _id: result._id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          image: result.image,
        };
  
        console.log(dataSend);
        res.send({
          message: "Login is successful",
          alert: true,
          data: dataSend,
        });
      } else {
        res.send({
          message: "Email is not available, please sign up",
          alert: false,
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        message: "Internal server error",
        alert: false,
      });
    }
  });
  
  
  
//server running
app.listen(PORT, () => console.log("server is running at port : " + PORT));
