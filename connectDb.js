const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const url = 'mongodb+srv://mohithreddy17:q$zpYwsfkLiejQ2@nbad.kaulzvj.mongodb.net/personalbudget';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB at ${url}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
  }
};

module.exports = connectDB;

// Call the function to connect to the database
connectDB();

// mongoose.connect("mongodb+srv://mohithreddy2002:ejjpDBmz15JrdnWo@nbad.tlhoese.mongodb.net/?retryWrites=true&w=majority&appName=NBAD", {
//     useNewUrlParser:true,
//     useUnifiedTopology:true,
// }).then(() =>{
//     console.log(`Database connection successful`);
// }).catch((e) => {
//     console.log(`No Database connection`);
// });