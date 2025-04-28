const express = require("express");
const supabaseClient = require("@supabase/supabase-js");
const bodyParser = require("body-parser");
const { isValidStateAbbreviation } = require("usa-state-validator"); //The reason the const is in brackets is because we're not setting it to the value of require, but rather the output of the require (One of the available methods)
const dotenv = require("dotenv");
dotenv.config();

const app = express(); //Fast and simple framework for Node.js aka backend
const port = 3000;

app.use(bodyParser.json()); //Use the body parser library so you can understand POST requests
app.use(express.static(__dirname + "/public"));
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get("/customers", async (req, res) => {
  //This creates a GET API endpoint for getting every customer
  console.log("Attempting to GET all customers!");
  const { data, error } = await supabase.from("customer").select(); //make a const that captures the data if supabase responds with data, and an error if it responds with an error. Select all fom the customer table and try to put that into the data const

  if (error) {
    //if the error exists, log it and send it in the response
    console.log(`Error: ${error}`);
    res.statusCode = 400;
    res.send(error);
  }

  res.send(data); //respond with the data that was asked for, aka all the DB customers
});

app.post("/customer", async (req, res) => {
  // This creates a POST API endpoint for adding a customer to the database
  console.log("Adding customer");
  console.log(req.body); //logs the body of the req (Request)
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const state = req.body.state;

  if (!isValidStateAbbreviation(state)) {
    console.error(`State: ${state} is invalid`);
    res.statusCode = 400;
    res.header("Content-type", "application/json");
    const errorJson = {
      message: `${state} is not a valid state`,
    };
    res.send(JSON.stringify(errorJson));
    return;
  }

  const { data, error } = await supabase //Create a supabase "query" or some shit, but you insert the API request variables into it since it's a post
    .from("customer")
    .insert({
      customer_first_name: firstName,
      customer_last_name: lastName,
      customer_state: state,
    })
    .select(); //returns that object we made, which fills the data const

  if (error) {
    //if the error exists, log it and send it in the response
    console.log(`Error: ${error}`);
    res.statusCode = 500;
    res.send(error);
  }

  res.send(data); //Respond with the database object that was created (data)
});

app.listen(port, () => {
  console.log("APP IS ALIVEEEE on port", port); //When the app starts, log that it starts
});
