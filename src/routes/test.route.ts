import { Router } from "express";
import { test } from "../controllers/test.contoller.js";

const router = Router();

router.route("/").get(test);

export default router;
