import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the folder exists
const uploadFolder = path.resolve('./public/temp');

// if (!fs.existsSync(uploadFolder)) {
//   fs.mkdirSync(uploadFolder, { recursive: true });
// }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder); // Store the file in the `./public/temp` folder
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null,file.originalname); // Generate a unique file name
  }
});

export const upload = multer({
  storage: storage,
});
