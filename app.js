const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const User = require("./database/Sechma/userSechma.js");
const app = express();
const { isEmpty } = require("./function.js");
var jwt = require("jsonwebtoken");
const Group = require("./database/Sechma/groupSechma");

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
        const token = jwt.sign(
          {
            data: "PaisPal",
          },
          "secret",
          { expiresIn: "1h" }
        );
        userExist.token = token;
        await userExist.save();
        return res.status(200).json({
          message: "Login successfull",
          token: token,
          userId: userExist.userId,
        });
      } else {
        return res.status(400).json({ error: "Invalid Credentials" });
      }
    } else {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
  }
});
//----------------Create Group----------------
app.post("/group/create/:id", async (req, res) => {
  const { groupName, groupArray } = req.body;

  if (!isEmpty(groupName) && groupArray.length > 0) {
    const userExist = await User.findOne({ userId: req.params.id });
    if (userExist) {
      const finalArray = groupArray.push(userExist.email);
      const group = new Group({
        groupId: uuidv4(),
        groupName: groupName,
        groupMembers: finalArray,
      });

      await group.save();
    } else {
      return res.status(400).json({ error: "User not found" });
    }
  } else {
    return res.status(400).json({ error: "Please add atleast 2 members" });
  }
  return res.status(200).json({ message: "Group created successfull" });
});

//Listener
app.listen(port, () => {
  console.log("Server is running on port: ", port);
});

//Get All Users API
app.get("/getUsers",async(req, res)=>{
  const token1 = req.headers['authorization']
  console.log(token1);
  if(isEmpty(token1)){
    return res.status(400).json({ error: "Token is not provided" });
  }else{
    const userExist = await User.findOne({ token: token1 });
    if(userExist){
      User.find({},{name : 1, email:1}).then(function (users) {
        res.send(200,users);
        });
    }else{
      return res.status(400).json({ error: "Unauthorized access" });
    }
  }
  
});