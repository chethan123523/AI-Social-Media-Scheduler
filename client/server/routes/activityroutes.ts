import express from "express";
import { protect } from "../midleware/authmidlleware.js";
import { getActivity } from "../controllers/activitycontroller.js";

const activityRouter = express.Router();

activityRouter.get("/", protect, getActivity);

export default activityRouter;