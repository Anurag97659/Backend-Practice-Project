import {Router} from 'express';
import { loginuser, logoutuser, registeruser,refreshAccessToken } from '../controllers/user.controllers.js';
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
export default router;