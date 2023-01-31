const express = require("express");
const { v4: uuidv4 } = require("uuid");
const User = require("./database/Sechma/userSechma.js");
const app = express();
const { isEmpty } = require("./function.js");

const port = process.env.PORT || 8000;
//Database Connection
require("./database/connecion.js");

//MiddelWare
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
      errors.error = "Email alreday existed";
    } else {
      const userId = uuidv4();
      res.send("Hello World");
      const user = new User({
        email,
        name,
        password,
        userId,
      });
      await user.save();
    }
  }
});

//Listener
app.listen(port, () => {
  console.log("Server is running on port: ", port);
});
