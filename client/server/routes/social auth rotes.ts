import express from "express";
import {
  generateAuthUrl,
  syncAccounts,
} from "../controllers/socialauthcontroller.js";
import { protect } from "../midleware/authmidlleware.js";

const socialAuthRouter = express.Router();

socialAuthRouter.get("/sync", protect, syncAccounts);
socialAuthRouter.get("/:platform/url", protect, generateAuthUrl);

export default socialAuthRouter;