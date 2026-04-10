const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { connectToDB } = require("../connectToDB/connectToDb");
const authRoute = require("../routes/authRoute");
const userRoute = require("../routes/userRoute");
const connectionRoute = require("../routes/connectionRoute");
const cors = require("cors");

dotenv.config();

app.use(
  cors({
    origin: ["http://3.27.94.237/api", "http://localhost:3000"],
  }),
);

app.use(express.json());

connectToDB();

const PORT = process.env.PORT || 3003;

app.use("/", authRoute);
app.use("/", userRoute);
app.use("/", connectionRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
