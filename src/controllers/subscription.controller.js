import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const {subscriberId} = req.user._id

    //prevent self subscription
    if(subscriberId === channelId){
        throw new apiError(400,"You cannot subscribe yourself")
    }

    //check if subscription exists
    const existingSubscription = await Subscription.findOne({
        subscriber : subscriberId,
        channel : channelId,
    })

    if(existingSubscription){
        //if subscription exists , unsubscribe them
        await Subscription.findByIdAndDelete(existingSubscription._id)
        throw new ApiResponse(200,"Unsubscribed Successfully")
    }
    else{
        //otherwise Subscribe 
        await Subscription.create({
            subscriber : subscriberId,
            channel : channelId
        })
        throw new ApiResponse(201,"Subscribed successfully")
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    //find the all subscribers of this channel
    const subscribers = await Subscription.find({
        channel : channelId
    })
    .populate("subscriber","username email ")
    .exec()

    if(subscribers.length === 0){
        throw new apiError(404,"No Subscribers found for this channel")
    }

    res.status(200).json(
        new ApiResponse(200,subscribers ,subscribers)
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    //find all the subscribed channels
    const subscribed = Subscription.find({
        subscriber : subscriberId,
    })
    .populate("channel","username email")
    .exec() 

    if(subscribed.length === 0){
        throw new apiError(404,"No channel is subscribed")
    }

    return res.status(200).json(
        new ApiResponse(200,channel ,subscribed)
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}