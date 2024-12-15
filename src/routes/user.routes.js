import {Router} from 'express';
import { loginuser, logoutuser, registeruser,refreshAccessToken,changeCurrentPassword,getCurrentUser,
         udateDetails,getUserChannelProfile,updateUserCoverImage,updateUserAvatar,getWatchHistory
        } from '../controllers/user.controllers.js';
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router=Router();
router.route('/register').post(
    upload.fields([ //injection of middleware to handle multiple files
        {name:'avatar',maxCount:1},
        {name:'coverImage',maxCount:1}
    ])
    ,registeruser)
router.route('/login').post(loginuser)
router.route("/logout").post(verifyJWT,logoutuser)
router.route("/refreshToken").post(refreshAccessToken)

router.route("/changePassword").post(verifyJWT,changeCurrentPassword)
router.route("/getCurrentUser").post(verifyJWT,getCurrentUser)
router.route("/udateDetails").patch(verifyJWT,udateDetails) // we used patch instead of put because we are updating only some fields otherwise it will replace the whole object

router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar) //upload.single("avatar") is a middleware to handle single file which is implemented in multer.middleware.js
router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage) 
router.route("/u/:username ").get(verifyJWT, getUserChannelProfile) // using get instead of post because we are fetching data not sending data
router.route("/h/:history ").get(verifyJWT, getWatchHistory)

export default router;