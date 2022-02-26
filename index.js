// Importing packages
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const auth = require('./routes/auth');
const notes = require('./routes/notes');
var cors = require('cors');

app.use(cors());
app.use(express.json());
const dotenv = require('dotenv');
dotenv.config();

// Connecting Database
mongoose.connect('mongodb://localhost:27017/mynotes');

// Routes
app.use('/auth', auth);
app.use('/notes', notes);


const port = 1000;
app.listen(port, () => {
    console.log(`MyNotes api running on port ${port}`)
})