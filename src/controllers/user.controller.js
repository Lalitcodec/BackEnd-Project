import {asyncHandler} from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken"
 
const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken =  await user.accessTokenGenerator();
        const refreshToken = await user.refreshTokenGenerator();

        console.log("🟢 Generated accessToken:", accessToken);
        console.log("🟢 Generated refreshToken:", refreshToken);


        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}

    } catch (error) {
        throw new apiError(500,"Error generating tokens")
        
    }
}

const registerUser = asyncHandler(async (req,res) => {
    
    //get user details front end
    //validate user details - not empty
    //check if user exists already : username ,email
    //check for images , check for avatar
    //upload them to cloudinary, avatar check
    //create user object in db
    //remove password and refresh token field  from response
    //check for user creation
    //return response

    //get user details from front end


    const {username,email,password,fullname} = req.body;
    console.log("email :",email);

    //validate user details - not empty


    // if(
    //     [username,email,password,fullname].some((field) => field?.trim() === "")
    // )

    if(fullname === ""){
        throw new apiError(400,"Fullname is required")
    }
    if(username === ""){
        throw new apiError(400,"Username is required")
    }
    if(email === ""){
        throw new apiError(400,"Email is required")
    }
    if(password === ""){
        throw new apiError(400,"Password is required")
    }


    //check if user exists already : username ,email

    const existedUser = await User.findOne({
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

    const createdUser = await User.findById(user._id).select("-password -refreshToken")


    //check for user creation

    if(!createdUser){
        throw new apiError(500,"Error creating user")
    }



    //return response
    
    return res.status(201).json(
        new ApiResponse(201,"User created successfully",createdUser)
    )
    
})

const loginUser = asyncHandler(async (req,res) => {

    // req body -> data
    //username or email based login
    //find the user
    //check for password
    //access and refresh token
    //send cookies


    // req body -> data

    const {email,username,password} = req.body

    //username or email based login

    if(!email && !username){
        throw new apiError(400,"Email or Username is required")
    }

    //find the user

    const user = await User.findOne({
        $or : [{username},{email}]
    })
     
    if (!user){
        throw new apiError(404,"User not found")
    }

    //check for password

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid){
        throw new apiError(401," Invalid Password")
    }


    //access and refresh token

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //send cookies

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    console.log("🟢 Sending accessToken:", accessToken);
    console.log("🟢 Sending refreshToken:", refreshToken);


    const options = {
        httpOnly : true,
        secure : true,
        sameSite: "Strict"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logOutUser = asyncHandler(async (req,res) => {
    //clear cookies
    //send response

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,"User logged out successfully")
    )
})

const refreshAccessToken = asyncHandler (async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
        
        if(!user){
            throw new apiError(401, " Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401 , "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken: newrefreshToken
                },
                "Access Token Refreshed Successfully"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message || "Invalid Refresh Token")
    }
    
})


export {registerUser
    ,loginUser,
    logOutUser,
    refreshAccessToken
}