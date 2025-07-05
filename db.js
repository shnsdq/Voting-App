const mongoose = require('mongoose');
require('dotenv').config();

//Define the mongodb connection url
const mongoURL = process.env.MONGODB_URL_LOCAL //Replace 'mydatabase' name with ur db name
// const mongoURL = process.env.MONGODB_URL

//setup mongodb connection
mongoose.connect(mongoURL,{
    useNewUrlParser : true,
    useUnifiedtopology : true
})

//get the default connection
//Mongoose maintains the default connection object representing the mongoDB connection
const db = mongoose.connection;

//define event listeners for database connection

db.on('connected', ( )=>{
    console.log('Connected to mongodb server');
});

db.on('error', (err)=>{
    console.error('Mongodb connection error:', err);
});

db.on('disconnected', ()=>{
    console.log('Mongodb disconnected');
});

//Export the database connection
module.exports = db;

