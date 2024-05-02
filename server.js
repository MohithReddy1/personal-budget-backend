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

app.post("/Signup", async (req, res) => {
  const { username, password } = req.body;
  const Password = await encryptPassword(password);

  try {
    const existingUser = await SignupSchema.findOne({ $or: [{ username }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists, please use another one" });
    }

    const newUser = new SignupSchema({ username, Password });
    await newUser.save();
    res.status(200).json({ success: true, message: "User successfully registered" });
    
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: 'Error while adding new user.' });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await SignupSchema.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);

    if (passwordMatch) {
      let token = generateToken(user);
      res.status(200).json({ success: true, message: "Login successful", user: user, token: token });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: 'Failed. Please try again.' });
  }
});

app.post("/refresh-token/:userData", async (req, res) => {
  const { userData } = req.params;
  // console.log(userData);
  const user = await SignupSchema.findById(userData);

  if (user) {
    const newToken = generateToken(user);
    res.json({ token: newToken });
  } else {
    res.status(404).json({ error: 'User not found. Failed to refresh token.' });
  }
});

app.post("/configure-budgets", jwtMW, async (req, res) => {
  const { userData, monthlyBudget, budgetList } = req.body;
  try {
    if (!budgetList || !Array.isArray(budgetList) || budgetList.length === 0) {
      return res.status(400).json({ error: "Invalid budget list" });
    }

    const budgets = budgetList.map(({ category, budget }) => ({ userData, category, budget, monthlyBudget }));
    await BudgetSchema.insertMany(budgets);

    res.status(200).json({ success: true, message: "New Budgets saved " });
  } catch (error) {
    console.error("Error saving budgets:", error);
    res.status(500).json({ error: 'Failed to save the newly budgets.' });
  }
});

app.post("/add-expense", jwtMW, async (req, res) => {
  const { userData, month, category, expense } = req.body;
  try {
    const addNewExpense = new ExpenseSchema({ userData, month, category, expense });
    await addNewExpense.save();

    res.status(200).json({ success: true, message: "New Expense added " });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ error: 'Failed to add the new expense.' });
  }
});

app.get("/get-categories/:userData", async (req, res) => {
  const { userData } = req.params;
  const { month } = req.query;

  try {
    let query = { userData };
    if (month) {
      query.monthlyBudget = month;
    }

    const categories = await BudgetSchema.distinct('category', query);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

app.get('/get-budgets/:userData', jwtMW, async (req, res) => {
  const { userData } = req.params;
  const { month } = req.query;

  try {
    let query = { userData };
    if (month) {
      query.monthlyBudget = month;
    }

    const budgets = await BudgetSchema.find(query);
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets.' });
  }
});

app.get('/get-expenses/:userData', jwtMW, async (req, res) => {
  const { userData } = req.params;
  const { month } = req.query;

  try {
    let query = { userData };
    if (month) {
      query.month = month;
    }

    const expenses = await ExpenseSchema.find(query);
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

app.get("/check-existing-budget/:userData/:month/:category", jwtMW, async (req, res) => {
  const { userData, month, category } = req.params;

  try {
    const existingBudget = await BudgetSchema.findOne({ userData, monthlyBudget: month, category });

    if (existingBudget) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking existing budget:", error);
    res.status(500).json({ error: 'Failed to verify the existing budget.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});