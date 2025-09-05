const mongoose = require('mongoose');
const User = require('../models/user');

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;  
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in .env");
        }

        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
        console.log("User model is ready");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
