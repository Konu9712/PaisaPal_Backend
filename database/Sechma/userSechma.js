const mongoose = require("mongoose");

const userSechma = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  group: {
    type: Array,
  },
  token: {
    type: String,
  },
});

const User = mongoose.model("User", userSechma);
module.exports = User;
