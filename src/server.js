const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const { connectToDB } = require("../connectToDB/connectToDb");
const authRoute = require("../routes/authRoute");
const userRoute = require("../routes/userRoute");
const connectionRoute = require("../routes/connectionRoute");
const cors = require("cors");

app.use(cors());
app.use(express.json());

connectToDB();

const PORT = process.env.PORT || 3003;

app.use("/", authRoute);
app.use("/", userRoute);
app.use("/", connectionRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
