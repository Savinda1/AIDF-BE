import { Request, Response,NextFunction } from "express";
import User from "../infrastructure/schemas/User";
import ValidationError from "../domin/errors/validation-error";
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try{
  const user = req.body;

  // Validate the request data
  if (!user.name || !user.email) {
    throw new ValidationError("Invalid user data");
   // res.status(400).send();
    //return;
  }

  // Add the user
  await User.create({
    name: user.name,
    email: user.email,
  });

  // Return the response
  res.status(201).send();
  return;}
  catch(error){
    next(error);
  } 
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
 
) => {
  try{
  const users = await User.find();
  res.status(200).json(users);
  return;}
  catch(error){
    next(error);
  } 
};