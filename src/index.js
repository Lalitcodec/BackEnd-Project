// require('dotenv').config()

import dotenv from "dotenv"
import mongoose from "mongoose";
import connectDB from "./db/db.js";
import { app } from "./app.js";





dotenv.config({
    path: "./config/config.env"
})


connectDB()

.then(()=> {
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at PORT : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Connecton FAILED !!! ",error);
})



/*
import express from "express";

const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_name}`)
        app.on("error",(error) => {
            console.log("ERR",error);
            throw error
            
        })

        app.listen(process.env.PORT,() => {
            console.log(`App is listening at port  ${process.env.PORT}`);

        })
        
    } catch (error) {
        console.log(error)
        throw error
        
    }
})()

*/