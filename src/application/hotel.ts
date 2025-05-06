import { NextFunction,Request, Response } from "express";

import Hotel from "../infrastructure/schemas/Hotel";
import NotFoundError from "../domin/errors/not-found-error";
import ValidationError from "../domin/errors/validation-error";
import { CreateHotelDTO,UpdateHotelDTO } from "../domin/dtos/hotel";


import OpenAI from "openai";
import stripe from "../infrastructure/stripe";

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

  export const getAllHotels = async(
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try{
    const hotels = await Hotel.find();
   await sleep(1000);
    res.status(200).json(hotels);
    return;
  }catch(error){
  next(error);
}
};


   export const getHotelById = async(
    req: Request,
    res: Response,
    next: NextFunction
   ) => {
    try{
    const  hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel)
      {  throw new NotFoundError("Hotel not found");
      }
    res.status(200).json(hotel);
    return;
  } catch (error) {
      next(error);
    }
  };



  /*1.Normal part
  export const generateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {prompt} = req.body;
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    store: true,
    });
  
    res.status(200).json({
      messages: [
        { role: "user", content: prompt },
        {role: "assistant",content: completion.choices[0].message.content}, 
      ]
    });
    return;
  };
*/


/*2.chat bot part
 export const generateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {prompt,message} = req.body;
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [...message,{ role: "user", content: prompt }],
    store: true,
    });
  
    res.status(200).json({
      messages: [...message,
        { role: "user", content: prompt },
        {role: "assistant",content: completion.choices[0].message.content}, 
      ]
    });
    return;
  };*/

 /*chat bot essy part
 export const generateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {messages} = req.body;
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    store: true,
    });
  
    res.status(200).json({
      messages: [...messages,
       {role: "assistant",content: completion.choices[0].message.content}, 
      ]
    });
    return;
  };*/

  /*me vidihata hasiriyan kiyala kiyanawa chat ekata
  export const generateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const {messages} = req.body;
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages:
      messages.length ===1 ?[
        {role: "system",
        content:"",
          },
          ...messages,
        ]
      :messages,
    store: true,
    });
  
    res.status(200).json({
      messages: [messages,
       {role: "assistant",content: completion.choices[0].message.content}, 
      ]
    });
    return;
  };*/

  /*one shot formatting
  export const generateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { prompt } = req.body;
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
         {
          role: "system",
          content:
            "You are assistant that will categorize the words that a user gives and give them labels and show an output. Return this response as in the following examples: user: Lake, Cat, Dog, Tree; response: [{label:Nature, words:['Lake', 'Tree']}, {label:Animals, words:['Cat', 'Dog']}] ",
       },
        { role: "user", content: prompt },
      ],
      store: true,
    });
  
    res.status(200).json({
      message: {
        role: "assistant",
        content: completion.choices[0].message.content,
      },
    });
    return;
  };*/

  export const generateResponse = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { prompt } = req.body;
  
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
         {
          role: "system",
          content:
            "You are assistant that will categorize the words that a user gives and give them labels and show an output. Return this response as in the following examples: user: Lake, Cat, Dog, Tree; response: [{label:Nature, words:['Lake', 'Tree']}, {label:Animals, words:['Cat', 'Dog']}] ",
       },
        { role: "user", content: prompt },
      ],
      store: true,
    });
  
    res.status(200).json({
      message: {
        role: "assistant",
        content: completion.choices[0].message.content,
      },
    });
    return;
  };

  export const deleteHotel = async (
    req: Request,
    res: Response,
    next: NextFunction
   
  ) => {
    try {
    const hotelId = req.params.id;
    await Hotel.findByIdAndDelete(hotelId);
  
    // Return the response
    res.status(200).send();
    return;}
    catch(error){
      next(error);
    }
  };

  export const createHotel = async (req: Request, res: Response) => {
    try {
      // Validate input using Zod schema
      const validationResult = CreateHotelDTO.safeParse(req.body);
  
      if (!validationResult.success) {
        res.status(400).json({
          message: "Invalid hotel data",
          errors: validationResult.error.format(),
        });
        return;
      }
  
      const hotelData = validationResult.data;
  
      // Create a product in Stripe
      const stripeProduct = await stripe.products.create({
        name: hotelData.name,
        description: hotelData.description,
        default_price_data: {
          unit_amount: Math.round(hotelData.price* 100), // Convert to cents
          currency: "usd",
        },
      });
  
      // Create the hotel with the Stripe price ID
      const hotel = new Hotel({
        name: hotelData.name,
        location: hotelData.location,
        image: hotelData.image,
        price: hotelData.price,
        description: hotelData.description,
        stripePriceId: stripeProduct.default_price,
      });
  
      await hotel.save();
      res.status(201).json(hotel);
    } catch (error) {
      console.error("Error creating hotel:", error);
      res.status(500).json({
        message: "Failed to create hotel",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  export const updateHotel = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const hotelId = req.params.id;
      const updatedHotel = req.body;

  const hotel= UpdateHotelDTO.safeParse(req.body);

      if (!hotel.success) {
        throw new ValidationError(hotel.error.message);
      }
  
      await Hotel.findByIdAndUpdate(hotelId, updatedHotel);
     
      // Return the response
      res.status(200).send();
      return;
    } catch (error) {
      next(error);
    }
  };

  