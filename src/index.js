// require('dotenv').config({path: './env'});// sometimes it may give error so use the following way to import
import dotenv from "dotenv";
dotenv.config({
    path: "../env"
});

// there are two ways to connect to the database
/*
1. ======================or do it here directly=======================
import express from "express";
const app=express();
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
(async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{
           console.error(error);
           throw error;
       })

       app.listen(process.env.PORT,()=>{
              console.log(`Server is running on port ${process.env.PORT}`);
         })
    }
    catch(error){
        console.error(error);
        throw error;
    }
})()
*/
// 2. write the connection code in ./db/index.js and import it here
import connectDB from "./db/index.js";
import app from "./app.js";
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("Mongo DB not connected !!!!!!!")
})