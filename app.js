
const express = require('express');
const app = express();
const session = require('express-session');
const connectDB = require('./config/db');
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
require("dotenv").config();
app.use(express.static('public'));


connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
secret: process.env.SESSION_SECRET, 
resave: false,
saveUninitialized: true,
cookie: { secure: false } 
}));


const authRoutes = require('./routes/authRoutes');

app.use('/', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});  