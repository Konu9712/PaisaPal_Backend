const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const bcrypt = require("bcrypt");
const moment = require("moment");
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
  if (isEmpty(name) || isEmpty(email) || isEmpty(password)) {
    return res.status(400).json({ error: "Please fill all the fields" });
  } else {
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      return res.status(400).json({ error: "Email already exist" });
    } else {
      const userId = uuidv4();
      const encryptedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        name,
        password: encryptedPassword,
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
      const passswordConfirm = await bcrypt.compare(
        password,
        userExist.password
      );
      if (passswordConfirm) {
        const token = jwt.sign(
          {
            userId: userExist.userId,
            name: userExist.name,
            email: userExist.email,
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

//Get All Users API
app.get("/getUsers", async (req, res) => {
  const token1 = req.headers["authorization"];
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ token: token1 });
    if (userExist) {
      User.find({}, { name: 1, email: 1 }).then(function (users) {
        res.send(200, users);
      });
    } else {
      return res.status(400).json({ error: "Unauthorized access" });
    }
  }
});

//----------------Create Group----------------
app.post("/group/create/:id", async (req, res) => {
  const { groupName, groupArray } = req.body;

  if (!isEmpty(groupName) && groupArray.length > 0) {
    const userExist = await User.findOne({ userId: req.params.id });
    if (userExist) {
      groupArray.push(userExist.email);
      const group = new Group({
        groupId: uuidv4(),
        groupName: groupName,
        groupMembers: groupArray,
      });
      // Add the group ID to every email found in the groupArray array
      for (let i = 0; i < groupArray.length; i++) {
        const memberEmail = groupArray[i];
        const memberUser = await User.findOne({ email: memberEmail });
        if (memberUser) {
          memberUser.group.push(group.groupId);
          await memberUser.save();
          await group.save();
        } else {
          return res.status(400).json({ error: `All users are not found` });
        }
      }
    } else {
      return res.status(400).json({ error: "User not found" });
    }
  } else {
    return res.status(400).json({ error: "Please add atleast 2 members" });
  }
  return res.status(200).json({ message: "Group created successfull" });
});

//----------------Get Groups----------------
app.get("/getgroups", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ userId: user.userId });
    if (userExist) {
      const groups = userExist.group;
      let listGroup = [];
      for (let i = 0; i < groups.length; i++) {
        const group = await Group.findOne({ groupId: groups[i] });
        listGroup.push(group);
      }
      res.status(200).json({ groups: listGroup });
    } else {
      return res.status(400).json({ error: "Unauthorized access" });
    }
  }
});

//----------------Create Catagory----------------
app.post("/createCatagory/:groupId", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ userId: user.userId });
    if (userExist) {
      const catagory = req.body.catagory;
      const groupExist = await Group.findOne({ groupId: req.params.groupId });
      if (groupExist) {
        if (groupExist.catagory.length > 0) {
          return res.status(400).json({ error: "Catagory already exist" });
        } else {
          const result = await Group.findOneAndUpdate(
            { groupId: req.params.groupId },
            { $push: { catagory: { $each: req.body.catagory } } },
            { new: true }
          );
        }
      } else {
        return res.status(400).json({ error: "Group not found" });
      }
      return res.status(200).json({ message: "Catagory created successfull" });
    } else {
      return res.status(400).json({ error: "Unauthorized access" });
    }
  }
});

//----------------Get Catagory----------------
app.get("/getCatagory/:groupId", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ userId: user.userId });
    if (userExist) {
      const groupExist = await Group.findOne({ groupId: req.params.groupId });
      if (groupExist) {
        const catagory = groupExist.catagory;
        if (catagory.length > 0) {
          res.status(200).json({ catagory: groupExist.catagory });
        } else {
          return res.status(400).json({ error: "Catagory not found" });
        }
      } else {
        return res.status(400).json({ error: "Group not found" });
      }
    }
  }
});

// -----------------Create Expense----------------
app.post("/createExpense/:groupId", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ userId: user?.userId });
    if (userExist) {
      const groupExist = userExist?.group?.find(
        (id) => id === req.params.groupId
      );
      if (groupExist) {
        const { expenseName, expenseAmount, expenseCatagory, dividedPeople } =
          req.body;
        if (expenseName && expenseAmount && expenseCatagory) {
          const expense = {
            expenseId: uuidv4(),
            expenseName: expenseName,
            expenseAmount: expenseAmount,
            expenseCatagory: expenseCatagory,
            expenseBy: userExist.email,
            expenseDate: require("moment")(Date.now()).format(
              "DD MMM YYYY hh:mm a"
            ),
            dividedPeople: dividedPeople,
          };
          const result = await Group.findOneAndUpdate(
            { groupId: req.params.groupId },
            { $push: { expense: expense } },
            { new: true }
          );
          if (result) {
            return res.status(200).json({
              message: "Expense created successfull",
              expemse: result.expense,
            });
          } else {
            return res.status(400).json({ error: "Expense not created" });
          }
        } else {
          return res.status(400).json({ error: "Please fill all fields" });
        }
      } else {
        return res.status(400).json({ error: "Wrong Group ID" });
      }
    } else {
      return res.status(400).json({ error: "Unauthorized access" });
    }
  }
});

//----------------Get Expense----------------

app.get("/getExpense/:groupId", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ userId: user.userId });
    if (userExist) {
      const groupExist = await Group.findOne({ groupId: req.params.groupId });
      if (groupExist) {
        const expense = groupExist.expense;
        if (expense.length > 0) {
          return res.status(200).json({ expense: groupExist.expense });
        } else {
          return res.status(400).json({ error: "Expense not found" });
        }
      } else {
        return res.status(400).json({ error: "Group not found" });
      }
    }
  }
});
//----------------Delete Expense----------------
app.delete("/deleteExpense/:groupId/:expenseId", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const userExist = await User.findOne({ userId: user.userId });
    if (userExist) {
      const groupExist = await Group.findOne({ groupId: req.params.groupId });
      if (groupExist) {
        const expense = groupExist.expense;
        if (expense.length > 0) {
          const expenseExist = await Group.findOne({
            groupId: req.params.groupId,
            "expense.expenseId": req.params.expenseId,
          });
          if (expenseExist) {
            const result = await Group.findOneAndUpdate(
              { groupId: req.params.groupId },
              { $pull: { expense: { expenseId: req.params.expenseId } } },
              { new: true }
            );
            if (result) {
              return res
                .status(200)
                .json({ message: "Expense deleted successfully" });
            } else {
              return res.status(400).json({ error: "Expense not deleted" });
            }
          } else {
            return res.status(400).json({ error: "Expense not found" });
          }
        } else {
          return res.status(400).json({ error: "Expense not found" });
        }
      } else {
        return res.status(400).json({ error: "Group not found" });
      }
    }
  }
});

//----------------Updat[e Expense----------------
app.put("/updateExpense/:groupId/:expenseId", async (req, res) => {
  const token1 = req.headers["authorization"];
  const user = jwt.decode(token1);
  if (isEmpty(token1)) {
    return res.status(400).json({ error: "Token is not provided" });
  } else {
    const groupExist = await Group.findOne({ groupId: req.params.groupId });
    if (groupExist) {
      const Allexpense = groupExist.expense;
      if (Allexpense.length > 0) {
        for (var i = 0; i < Allexpense.length; i++) {
          if (Allexpense[i].expenseId === req.params.expenseId) {
            const {
              expenseName,
              expenseAmount,
              expenseCatagory,
              dividedPeople,
            } = req.body;
            if (expenseName && expenseAmount && expenseCatagory) {
              const expense = {
                expenseId: req.params.expenseId,
                expenseName: expenseName,
                expenseAmount: expenseAmount,
                expenseCatagory: expenseCatagory,
                expenseBy: user.email,
                expenseDate: require("moment")(Date.now()).format(
                  "DD MMM YYYY hh:mm a"
                ),
                dividedPeople: dividedPeople,
              };
              const result = await Group.findOneAndUpdate(
                { groupId: req.params.groupId },
                { $set: { "expense.$[i]": expense } },
                { arrayFilters: [{ "i.expenseId": req.params.expenseId }] }
              );
              if (result) {
                return res.status(200).json({
                  message: "Expense updated successfull",
                  expense: result.expense,
                });
              } else {
                return res.status(400).json({ error: "Expense not updated" });
              }
            } else {
              return res.status(400).json({ error: "Please fill all fields" });
            }
          }
        }
        return res.status(400).json({ error: "Expense not found" });
      } else {
        return res.status(400).json({ error: "Expense not found" });
      }
    } else {
      return res.status(400).json({ error: "Group not found" });
    }
  }
});

//Listener
app.listen(port, () => {
  console.log("Server is running on port: ", port);
});
