import { Request, Response, NextFunction } from "express";
import Booking from "../infrastructure/schemas/Booking";
//import NotFoundError from "../domin/errors/not-found-error";
import ValidationError from "../domin/errors/validation-error";
import { clerkClient } from "@clerk/express";
import { CreateBookingDTO } from "../domin/dtos/booking";

export const createBooking = async (
  req:Request,
   res:Response,
  next:NextFunction) => {
    try{
      const booking = CreateBookingDTO.safeParse(req.body);
      console.log(booking);
      // Validate the request data
      if (!booking.success) {
        throw new ValidationError(booking.error.message)
      }
      const user = req.auth;
  // Add the booking
 await Booking.create({
  //hotelId: booking.data.hotelId,
      //userId: user.userId,
      checkIn: booking.data.checkIn,
      checkOut: booking.data.checkOut,
      //roomNumber: booking.data.roomNumber,
  });

  // Return the response
  res.status(201).send();
  return;}
  catch(error){
    next(error);
  } };

  export const deleteBooking = async (
    req: Request,
    res: Response,
    next: NextFunction
   
  ) => {
    try {
    const hotelId = req.params.id;
    await Booking.findByIdAndDelete(hotelId);
  
    // Return the response
    res.status(200).send();
    return;}
    catch(error){
      next(error);
    }
  };

export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
  const bookings = await Booking.find();
  res.status(200).json(bookings);
  return;}
  catch(error){
    next(error);
  } 
};