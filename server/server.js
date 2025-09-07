const dotenv = require("dotenv")
dotenv.config({path:"./.env"})
const express = require("express");
const connectDB = require("./config/mongodb");
const cors = require("cors")
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const app = express()
connectDB()
const port = process.env.PORT
const allowedOrigins = ['http://localhost:5173']
app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins,credentials : true}))

//API Endpoint
app.get("/",(req,res)=>{
    res.send("API Working")
})
app.use("/auth",authRouter)
app.use("/user",userRouter)
app.listen(port,()=>{
    console.log("Server is running")
})