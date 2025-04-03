import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const {channelId} = req.params

    //get total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel : channelId
    })

    //get total videos
    const totalVideos = await Video.countDocuments({
        owner : channelId
    })

    //get total likes & views
    const videoStats = await Video.aggregate([
        { $match : {
            owner : channelId
        }},
        {
            $group : {
                _id : null,
                totalViews : { $sum : "$views"},
                totalLikes : { $sum : "$likes"},
            },
        },
    ])

    const totalViews = videoStats.length ? videoStats[0].totalViews : 0
    const totalLikes = videoStats.length ? videoStats[0].totalLikes : 0

    return res.status(200).json({
        totalSubscribers,
        totalVideos,
        totalLikes,
        totalViews
    })

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params
    const { page = 1, limit = 10 } = req.query

    //get all the videos
    const totalVideos = await Video.find({
        owner : channelId
    })
    .sort({ createdAt : -1})
    .skip((page - 1))
    .limit(parseInt(limit))
    .exec()

    if (!videos.length) {
        return res.status(404).json({ message: "No videos found for this channel." });
    }

    return res.status(200).json({videos})
})

export {
    getChannelStats, 
    getChannelVideos
    }