import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({
    path: "/.env"
});

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        index: true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        minlength:3,
        lowercase:true,
        trim:true
    },
    password:{
        type: String,
        required:true,
        minlength:8
    },
    fullname:{
        type : String,
        required:true,
        minlength:3,
        index:true,
        trim:true
    },
    avatar:{
        type:String,
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    refreshToken: {
        type:String
    }
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=await bcrypt.hashSync(this.password,10);
        return next();
    
    }
    else{return next();}
    
})

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
        _id:this._id, // id is generated by mongodb
        username:this.username,
        email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET ,
        {
            // expiresIn:ACCESS_TOKEN_EXPIRY
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
        {
        _id:this._id, // id is generated by mongodb
        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);