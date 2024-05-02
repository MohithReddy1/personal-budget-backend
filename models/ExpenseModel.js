const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
    month: { type: String, required: true },
    category: { type: String, required: true },
    expense: { type: Number, required: true },
    userData: { type: String, required: true }
}, { collection: 'Expense' });

const Expense = new mongoose.model('Expense', ExpenseSchema);
module.exports = Expense;