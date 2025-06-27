import mongoose from "mongoose";
import 'dotenv/config';

const connectDB = async ()=>{
    try {
        mongoose.connection.on('connected',()=>console.log("Database connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/grosserystore`);
    } catch (error) {
        console.error(error.message);
    }
}


export default connectDB;
