const mongoose = require("mongoose")

const connectDB = async()=>{
    mongoose.connection.on("connected",()=>{
        console.log("Connected to MongoDb DataBase")
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/drive-auth`)
}

module.exports = connectDB