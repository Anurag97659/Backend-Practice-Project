// 1
const asyncHandler=(fn){
     (req,res,next)=>{
        (req,res,next)=>{
            Promise.resolve(fn(req,res,next)).catch((error)=>next(error));
        }
    }
}
export { asyncHandler };
// 2 
// const asyncHandler = (fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code || 500).json({
//            success:false,
//             message:error.message
//         });
//     }
// }