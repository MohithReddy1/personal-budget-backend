const express = require("express");
const app = express();
const cors = require("cors");
const compression = require('compression');

const jwt = require('jsonwebtoken');
const { expressjwt: exjwt } = require('express-jwt');
const bodyParser = require("body-parser");

const SignupSchema = require("./models/SignupModel");
const BudgetSchema = require("./models/BudgetModel");
const ExpenseSchema = require("./models/ExpenseModel");

require("./connectDb");

const bcrypt = require("bcrypt");
const port = 4000;
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

const secretkey = 'My super secretkey';
const jwtMW = exjwt({
  secret: secretkey,
  algorithms: ["HS256"],
});

async function encryptPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  // console.log('Password hashed:', hashedPassword);
  return hashedPassword;
}

app.use("/", express.static("public"));

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    secretkey,
    { expiresIn: "1m" }
  );
};

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});