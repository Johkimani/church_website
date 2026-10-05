import { Router } from "express";
import {
  getVersions,
  getBooks,
  getChapter,
  searchVerses,
} from "../../controllers/bibleController.js";

const router = Router();

router.get("/bible/versions", getVersions);
router.get("/bible/books", getBooks);
router.get("/bible/chapter", getChapter);
router.get("/bible/search", searchVerses);

export default router;
