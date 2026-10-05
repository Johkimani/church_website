

import express from "express"
import { createFile, deleteFile , getAllfiles} from "../../controllers/mediaController.js";
import {uploadMiddleware  } from "../../middlewares/uploadMiddleware.js"
import verifyToken from "../../middlewares/Tokens.js";


const route = express.Router()

route.get("/" , verifyToken, getAllfiles)
route.post("/" , verifyToken, uploadMiddleware , createFile)
route.delete("/", verifyToken, deleteFile);


export default route;