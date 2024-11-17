import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "./user.model";

const VideoSchema = new Schema({
    videoFile:{
        type:String,
        require:true 
    },
    thumbnail:{
        type:String
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:User
    },
    title:{
        type:String,
        require:true,
        minlength:3,
    },
    description:{
        type:String,
        minlength:3,
    },
    duration:{
        type:Number,
        require:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        require:true
    }

},{timestamps:true});

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model('Video',VideoSchema);