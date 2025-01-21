const mongoose = require('mongoose');
const {connect} = require("mongoose");

// Define the MongoDB connection URL
const mongoURI = 'mongodb+srv://niv:24ztZekehRLl8mwH@cluster0.lmjfp.mongodb.net/ServerSideProject?retryWrites=true&w=majority&appName=Cluster0'; // Replace 'yourDatabaseName' with the actual database name

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

// Define the user schema
const userSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Ensure the id is unique
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    total_cost: { type: Number, required: true },
}, {
    timestamps: true, // Optional: Adds createdAt and updatedAt fields automatically
});

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

// Export the User model and mongoose for reuse in other parts of the app
module.exports = User;