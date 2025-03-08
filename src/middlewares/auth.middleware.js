import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


export const verifyJWT = asyncHandler(async (req,res,next) => {

    console.log("🔹 Cookies:", req.cookies);
    console.log("🔹 Authorization Header:", req.headers.authorization);

    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")


        // If token is still undefined, throw an error
        if (!token) {
            throw new apiError(401, "Unauthorized - No token provided");
        }

    

        console.log("token : ",token);
        
        if(!token){
            console.log(" Token missing or invalid:", token);
            throw new apiError(401,"Unauthorized request ")
        }
    
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            // TODO: discuss about frontend handling of this error
            throw new apiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Access Token")
    }
})