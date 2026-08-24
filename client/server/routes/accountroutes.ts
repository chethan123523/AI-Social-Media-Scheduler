import express from "express";
import { protect } from "../midleware/authmidlleware.js";
import {
  addAccount,
  disconnectAccount,
  getAccounts,
} from "../controllers/accountcontrollers.js";

const accountRouter = express.Router();

accountRouter.get("/", protect, getAccounts);
accountRouter.post("/", protect, addAccount);
accountRouter.delete("/:id", protect, disconnectAccount);

export default accountRouter;