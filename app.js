const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const User = require("./database/Sechma/userSechma.js");
const app = express();
const { isEmpty } = require("./function.js");

const port = process.env.PORT || 8000;
//Database Connection
require("./database/connecion.js");

//MiddelWare
app.use(cors());
app.use(express.json());

//Router
app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  if (isEmpty(name) || isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({ error: "Please fill all the fields" });
  } else {
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      return res.status(400).json({ error: "Email already exist" });
    } else {
      const userId = uuidv4();
      const user = new User({
        email,
        name,
        password,
        userId,
      });
      await user.save();
      return res.status(200).json({ message: "Signup successfull" });
    }
  }
});

//------------------Login------------------
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({ error: "Please fill all the fields" });
  } else {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      if (userExist.password == password) {
        return res.status(200).json({ message: "Login successfull" });
      } else {
        return res.status(400).json({ error: "Invalid Credentials" });
      }
    } else {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
  }
});

//Listener
app.listen(port, () => {
  console.log("Server is running on port: ", port);
});
