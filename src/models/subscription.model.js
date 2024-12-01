import mongoose,{Schema} from "mongoose";4

const subscriptionSchema = new Schema({
    subscriber :{
        type:Schema.Types.ObjectId,// one who is subscriber
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId, // one whose channel got the suscriber
        ref:"User"
    }
    
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",subscriptionSchema)