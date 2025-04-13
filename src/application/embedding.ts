import { Request, Response, NextFunction } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import Hotel from "../infrastructure/schemas/Hotel";

export const createEmbeddings = async (
    req: Request,
    res: Response,
    next: NextFunction
  )=> {
    try{
        const embeddingsModel = new OpenAIEmbeddings({
            model: "text-embedding-ada-002",//text ekak dunnama vector ekak denawa
            apiKey: process.env.OPENAI_API_KEY,
          });
          const vectorIndex = new MongoDBAtlasVectorSearch(embeddingsModel, {
            collection: mongoose.connection.collection("hotelVectors"),
            indexName: "vector_index",
          });

          const hotels = await Hotel.find({});

          const docs = hotels.map((hotel) => {
            const { _id, location, price, description } = hotel;//me tika thama wadagath wenne search karanna
            const doc = new Document({
              pageContent: `${description} Located in ${location}. Price per night: ${price}`,//search karala hana ewa
              metadata: {//id eka
                _id,
              },
            });
            return doc;
          });
      
          await vectorIndex.addDocuments(docs);
      
          res.status(200).json({
            message: "Embeddings created successfully",
          });
}
    catch(error){
  }}