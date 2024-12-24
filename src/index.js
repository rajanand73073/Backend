// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path:'./.env'
})

connectDB()
.then(()=>{
  app.on("error",(error)=>{
    console.log("ERROR",error);
    throw error
  })  
  
  app.listen(process.env.PORT||8000,()=>{
    console.log(`server is running at port : ${process.env.PORT}`);
  })
})
.catch((err)=>{
  console.log("DB Connection Failed !!!",err); 
})
/*
import express from "express";
const app = express()
//IIFE(immediately invoked function):executed as soon as it is defined
(async ()=>{
    try {
      await mongoose.connect(`${process.env.MONGOD_URI}/${DB_NAME}`) 
      app.on("error",(error)=>{
        console.log("ERROR",error);
        throw error
      }) 

      app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
        
      })
    } catch (error) {
    console.log("ERROR",error);
    throw error
    }
})()
*/