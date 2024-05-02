const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
    category: { type: String, required: true },
    budget: { type: Number, required: true },
    userData: { type: String, required: true },
    monthlyBudget: { type: String, required: true }
}, { collection: 'Budget' });

const Budget = new mongoose.model('Budget', BudgetSchema);
module.exports = Budget;