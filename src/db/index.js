import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
    path: "../env"
});
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionDone = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n Connected to database !! DB HOST:${connectionDone.connection.host}`);
    }
    catch(error){
        console.error("mongodb connection failed(Hell naa...)",error);
        throw error;
    }
}

export default connectDB;  