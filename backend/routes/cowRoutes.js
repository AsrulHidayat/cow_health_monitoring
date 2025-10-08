import express from "express";
import { getCows, addCow, getCow } from "../controllers/cowController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getCows);
router.post("/", verifyToken, addCow);
router.get("/:user_id", verifyToken, getCow);

export default router;
