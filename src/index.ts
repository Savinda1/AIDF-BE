//const express = require("express");
import "dotenv/config"; 
import express from "express";

import conectDB from "./infrastructure/db";
import hotelsRouter from "./api/hotel";
import bookingsRouter from "./api/booking";
import user from "./api/user";
import cors from "cors";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";
import { clerkMiddleware } from "@clerk/express";

const app= express();
app.use(clerkMiddleware());

conectDB();

// Middleware
app.use(express.json());

app.use(cors());

app.use("/api/hotels",hotelsRouter);
app.use("/api/bookings",bookingsRouter);
app.use("/api/users",user);
app.use(globalErrorHandlingMiddleware);


/*
app.delete('/:hotelId',(req,res)=>{
    const hotelId = req.params.hotelId;
    hotels.splice(
        hotels.findIndex((hotel) => hotel._id === hotelId),
        1
      );
      res.status(200).json({
        message: `Hotel ${hotelId} deleted successfully!`,
      });
});

app.put('/:hotelId',(req,res)=>{
    const hotelId = req.params.hotelId;
    const hotel = req.body;
    const index = hotels.findIndex((hotel) => hotel._id === hotelId);
    hotels[index] = hotel;
    res.status(200).json({
        message: `Hotel ${hotelId} updated successfully!`,
      });   });*/

//difine the port on the server
const port = 8000;
app.listen(port,()=>console.log(`Server is running on port ${port}`));