import mongoose from "mongoose";
import { DB_name } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        console.log(`\n MONGODB Connected`);
        
    } catch (error) {
        console.log("MONGODB Connection eror",error);
        process.exit(1)
    }
}

export default connectDB()