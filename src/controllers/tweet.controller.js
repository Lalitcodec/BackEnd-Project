import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    //TODO: create tweet
    const {userId} = req.user._id

    //check if content is provided
    if(!content){
        throw new apiError(404,"content is required")
    }

    //create the tweet 
    const tweet = new Tweet({
        content,
        owner : req.user._id
    })

    //save the tweet
    await tweet.save()

    //return the response
    return res.status(200)
    .json(
        new ApiResponse(200,"Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    //validate user id
    if(!userId){
        throw new apiError(404,"User Id is required")
    }

    //get the tweets
    const tweet = await Tweet.find({
        owner : userId
    })

    //if no tweet is found , return a response
    if(tweet.length === 0){
        return res.status(404).json({
            message : "Tweet not found"
        })
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const{content} = req.body

    //find the tweet
    const tweet = await Tweet.findById(tweetId)

    //check if tweet exists
    if(!tweet){
        throw new apiError(400,"Tweet not found")
    }

    //update the tweet
    if(content) Tweet.content = content

    //save the tweet
    await tweet.save()

    //return the response
    return res.status(200)
    .json(
        new ApiResponse(200,"Tweet updated successfully",tweet)
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    //find the tweet
    const tweet = await Tweet.findById(tweetId)

    //check if tweet exists
    if(!tweet){
        throw new apiError(404,"Tweet not found")
    }

    //delete the tweet
    await tweet.remove()

    //return the response
    return res.status(200)
    .json(
        new ApiResponse(200,"tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
