import {Router}  from "express"
import { loginUser,registerUser,
    logoutUser,refreshAccessToken,
    changeCurrentPassword,getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,updateUserCoverImage,getUserChannelProfile} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/susbciption.controller.js";
import { publishAVideo ,updateVideo,deleteVideo,togglePublishStatus} from "../controllers/video.controller.js"

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
        name:"coverImage",
        maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)
// secured routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").patch(verifyJWT,changeCurrentPassword)

router.route("/user-details").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

// Route to toggle subscription
router.route("/subscribe/:channelId").get(verifyJWT, toggleSubscription);

// Route to get subscriber list of a channel
router.route("/subscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);

// Route to get the list of channels to which a user has subscribed
router.route("/subscribed-channels/:subscriberId").get(verifyJWT, getSubscribedChannels);

router.route('/video-publish').post(
    upload.fields([
        {
            name:"video",
            maxCount:1
        },
       {
        name:"thumbnail",
        maxCount:1
       }
    ]),verifyJWT, publishAVideo)

    router.route('/video-update/:videoId').patch(
        upload.single([
           {
            name:"thumbnail",
            maxCount:1
           }
        ]),verifyJWT,updateVideo)

    router.route('/video-deleted/:videoId').get(verifyJWT,deleteVideo)
    router.route('/video-togglepublish/:videoId').get(verifyJWT,togglePublishStatus)  
        export default router