const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const DB =
  "mongodb+srv://PaisaPal:PaisaPal@cluster0.y8cbpdj.mongodb.net/?retryWrites=true&w=majority";

try {
  mongoose.connect(
    DB,
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    },
    (err) => {
      if (err) {
        console.log("error in connection", err);
      } else {
        console.log("Mongodb is connected");
      }
    }
  );
} catch (e) {
  console.log("Could not connect");
}
