import { isAuthenticated } from './middlewares/authentication-middleware';
import express from "express";
import {
  createBooking,
  deleteBooking,
  getAllBookings,
} from "../application/booking";

const bookingsRouter = express.Router();

bookingsRouter.route("/").post(createBooking).get(getAllBookings);
bookingsRouter.route("/:id").delete(deleteBooking);

export default bookingsRouter;


/*import { isAuthenticated } from './middlewares/authentication-middleware';
import express from "express";
import {
  createBooking,
  getAllBookingsForHotel,
  getAllBookings,
} from "../application/booking";

const bookingsRouter = express.Router();

bookingsRouter.route("/").post(isAuthenticated,createBooking).get(isAuthenticated,getAllBookings);
bookingsRouter.route("/hotels/:hotelId").get(isAuthenticated,getAllBookingsForHotel);

export default bookingsRouter;*/