import express from "express";
import {
  createCheckoutSession,
  retrieveSessionStatus,
} from "../application/payment";
import bodyParser from "body-parser";
import { isAuthenticated } from "./middlewares/authentication-middleware";
const paymentsRouter = express.Router();

paymentsRouter
  .route("/create-checkout-session")
  .post(createCheckoutSession);
paymentsRouter
  .route("/session-status")
  .get(retrieveSessionStatus);

export default paymentsRouter;