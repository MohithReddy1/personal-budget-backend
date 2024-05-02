const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SignupSchema = new Schema({
    username: { type: String, required: true },
    Password: { type: String, required: true }
}, { collection: 'Signup' });

const Signup = new mongoose.model('Signup', SignupSchema);
module.exports = Signup;