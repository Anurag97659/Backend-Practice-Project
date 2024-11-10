// require('dotenv').config({path: './env'});// sometimes it may give error so use the following way to import
import dotenv from "dotenv";
dotenv.config({
    path: "../env"
});

// there are two ways to connect to the database
// 1. write the connection code in ./db/index.js and import it here
import connectDB from "./db/index.js";
connectDB();
// 2. ======================or do it here directly=======================
// import express from "express";
// const app=express();
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
// (async ()=>{
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error",(error)=>{
//            console.error(error);
//            throw error;
//        })

//        app.listen(process.env.PORT,()=>{
//               console.log(`Server is running on port ${process.env.PORT}`);
//          })
//     }
//     catch(error){
//         console.error(error);
//         throw error;
//     }
// })()