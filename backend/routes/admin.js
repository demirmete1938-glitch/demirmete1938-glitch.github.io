// backend/routes/admin.js
import express from "express";
import { adminLogin, deleteUser, setFollowers } from "../controllers/adminController.js";
const router = express.Router();

router.post("/login", adminLogin);
router.post("/delete", deleteUser);
router.post("/setFollowers", setFollowers);

export default router;
