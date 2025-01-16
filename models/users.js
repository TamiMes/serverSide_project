const mongoose = require('mongoose');
const {connect} = require("mongoose");

// Define the MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017/yourDatabaseName'; // Replace 'yourDatabaseName' with the actual database name

// Mongoose connection function
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit process with failure
    }
};

connectDB()

// Export the connection function
module.exports = mongoose;