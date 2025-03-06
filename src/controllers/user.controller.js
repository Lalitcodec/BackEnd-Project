import {asyncHandler} from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
 
const registerUser = asyncHandler(async (req,res) => {
    
    //get user details from frone end
    //validate user details - not empty
    //check if user exists already : username ,email
    //check for images , check for avatar
    //upload them to cloudinary, avatar check
    //create user object in db
    //remove password and refresh token field  from response
    //check for user creation
    //return response

    const {username,email,password,fullname} = req.body;
    console.log("email :",email);



    //validate user details - not empty


    // if(
    //     [username,email,password,fullname].some((field) => field?.trim() === "")
    // )
    if(fullname = ""){
        throw new apiError(400,"Fullname is required")
    }
    if(username = ""){
        throw new apiError(400,"Username is required")
    }
    if(email = ""){
        throw new apiError(400,"Email is required")
    }
    if(password = ""){
        throw new apiError(400,"Password is required")
    }


    //check if user exists already : username ,email

    const existedUser = User.findOne({
        $or : [{username},{email}]
    })

    if(existedUser){
        throw new apiError(400,"User already exists")
    }

    //check for images , check for avatar

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400,"Avatar is required")
    }

    //upload them to cloudinary, avatar check
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(500,"Error uploading avatar")
    }


    //create user object in db
    const user = await User.create({
        username : username.toLowerCase(),
        email,
        password,
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })

    //remove password and refresh token field  from response

    const createdUser = await User.findbyID(user._id).select("-password -refreshToken")


    //check for user creation

    if(!createdUser){
        throw new apiError(500,"Error creating user")
    }



    //return response
    
    return res.status(201).json(
        new ApiResponse(201,"User created successfully",createdUser)
    )
    
})


export {registerUser}