const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { connectToDB } = require("../connectToDB/connectToDb");
const authRoute = require("../routes/authRoute");
const userRoute = require("../routes/userRoute");

dotenv.config();

app.use(express.json());

connectToDB();

const PORT = process.env.PORT;

app.use("/", authRoute);
app.use("/", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
