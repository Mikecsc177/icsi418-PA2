
const express = require("express");
const cors = require("cors");
require('dotenv').config(); 

const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

//databases mongo
const db = client.db("pa2");
const users = db.collection("users");

const app = express();

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

//SIGN UP 
app.post("/signup", async (req, res) => {
 
    //catch for database errors 
  try {
    const { f_name, l_name, username, password } = req.body;

    //ensures required values are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Required information is missing" });
    }

    //checks if the provided username is available
    const existingUser = await users.findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    //user creation
    await users.insertOne({ 
      f_name: f_name,
      l_name: l_name,
      username: username, 
      password: password 
    });

    //sucessful account creation
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
});

//LOGIN
app.post("/login", async (req, res) => {
  try {
    //user and pass
    const { username, password } = req.body;

    //check for required info 
    if (!username || !password) {
      return res.status(400).json({ message: "Required information is missing" });
    }

    //ensure username is available
    const user = await users.findOne({ username: username });

    //checks for valid credentials
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid login credentials" });
    }
    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});