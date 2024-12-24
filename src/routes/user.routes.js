import {Router}  from "express"
import { loginUser,registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"



const router = Router()

// router.route('/register').post(
//     upload.fields([
//         {
//             name:"avatar",
//             maxCount:1
//         },
//         {
//         name:"coverImage",
//         maxCount:1
//         }
//     ]),
//     registerUser
// )
router.route('/register').post(
    upload.single("avatar"),
    (req, res) => {
        console.log("File uploaded:", req.file);
        console.log("Request body:", req.body);
        res.send("Single file upload successful");
    }
);

router.post('/test-upload', upload.single('avatar'), (req, res) => {
    console.log("Request body:", req.body); // Log form data
    console.log("File uploaded:", req.file); // Log file info

    if (!req.file) {
        console.error("No file uploaded.");
        return res.status(400).send("No file uploaded.");
    }

    res.send("File uploaded successfully");
});


// router.route("/login").post(loginUser)
//secured routes
// router.route("/logout").post(ver)

export default router