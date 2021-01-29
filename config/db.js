const mongoose = require('mongoose');
// const config = require('config');
const mongoUri = require('./keys').MONGO_URI

let db = mongoUri;


const connectDB = async () => {
    try{
        await mongoose.connect(db, { 
            useUnifiedTopology: true, 
            useNewUrlParser: true, 
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('mongdb connected');
    }catch(err){
        console.error(err.message);
        process.exit(1);
    }
}


module.exports = connectDB;