import express from "express";

import {
  getAllHotels,
  getHotelById,
  createHotel,
  deleteHotel,
  updateHotel,
 // generateResponse
  } from "./../application/hotel";
  import { createEmbeddings } from "../application/embedding";
  import { retrieve } from "../application/retrieve";
  import { isAuthenticated } from './middlewares/authentication-middleware';
  import { isAdmin } from './middlewares/authorization-middleware';

const hotelsRouter = express.Router();

hotelsRouter.route("/").get(getAllHotels).post(isAuthenticated,isAdmin,createHotel);

hotelsRouter
  .route("/:id")
  .put(updateHotel)
  .get(getHotelById)
  .delete(deleteHotel);
 // hotelsRouter.route("/llm").post(generateResponse);
  hotelsRouter.route("/embeddings/create").post(createEmbeddings);
  hotelsRouter.route("/search/retrieve").get(retrieve);


export default hotelsRouter;