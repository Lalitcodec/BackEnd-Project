import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {userId} = req.user._id
    //TODO: toggle like on video

    //check if video is present
    if(!videoId){
        throw new ApiError(404,"Video not found")
    }

    //check if video is already liked
    const existingLike = await Like.findOne({
        video: videoId,
         likedBy: userId
    })

    //if the user has already liked the video, remove the like
    if(existingLike){
        await existingLike.remove()
        return res.status(200).json(
            new ApiResponse(200,"Like removed successfully")
        )
    }
    //if user has not liked the video, add the like
    else{
        const newLike = new Like({
            likedBy : userId,
            video : videoId
        })

        await newLike.save();

        return res.status(201).json(
            new ApiResponse(201,"Like added successfully")
        )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {userId} = req.user._id
    //TODO: toggle like on comment

    //check if comment is present
    if(!commentId){
        throw new ApiError(404,"Comment not found")
    }

    //check if comment is already liked
    const existingLike = await Like.findOne({
        comment: commentId,
         likedBy: userId
    })

    //if the user has already liked the comment, remove the like
    if(existingLike){
        await existingLike.remove()
        return res.status(200).json(
            new ApiResponse(200,"Like removed successfully")
        )
    }
    
    //if user has not liked the comment, add the like
    else{
        const newLike = new Like({
            likedBy : userId,
            comment : commentId
        })
        await newLike.save();
        return res.status(201).json(
            new ApiResponse(201,"Like added successfully")
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {userId} = req.user._id
    //TODO: toggle like on tweet

    //check if tweet is present
    if(!tweetId){
        throw new apiError(404,"Tweet not found")
    }

    //check if tweet is liked already
    const existingLike = new Like.findOne({
        tweet : tweetId,
        likedBy : userId
    })

    //if already liked, unlike the video
    if(existingLike){
        await existingLike.remove()
        return res.status(200).json(
            new ApiResponse(200,"Tweet unliked Successfully")
        )
    }

    //if not , add a like
    else{
        const newLike = new Like({
            tweet : tweetId,
            likedBy : userId
        })
        await newLike.save()
        return res.status(201).json(
            new ApiResponse(201,"Like added Successfully")
        )
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const {userId} = req.user._id
    //TODO: get all liked videos
    try {
        //get all the likes by the current user
        const likedVideos = await Like.find({
            likedBy : userId,
            video : { $exists : true}
        })
        .populate('video')
        .select('video')
        
        //check if video exists
        if(!likedVideos || likedVideos.length === 0 ){
            return res.status(401).json({
                message : "No Liked Videos found"
            })
        }

        // send the populated data as response
        res.status(201).json(likedVideos.map(like => like.video))
        
    } 
    catch (error) {
        res.status(500).json({
            message : "Error retrieving liked videos",
            error : error.message
        })
        
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}