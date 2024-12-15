// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";


dotenv.config({
  path:'./env'
})

connectDB()

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