import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    // Parse pagination values
    const pageNum = parseInt(page);
    const pageLImit = parseInt(limit)

    // Define default sorting (based on the "sortBy" and "sortType" parameters)
    const sortObject = {};
    sortObject[sortBy] = sortType === "asc" ? 1 : -1;

    // Build the filter object
    const filter = {};

    // If the "query" parameter is present, filter by title and description
    if (query) {
    const regex = new RegExp(query, "i");
    filter.$or = [
        { title : { $regex : regex } },
        { description : { $regex : regex } }
    ];
    }

    // If the "userId" parameter is present, filter by the user ID
    if (userId) {
        filter(videoOwner) = userId;
    }

    // Aggregate query
    const options = {
        page: pageNum,
        limit: pageLimit,
        sort: sortObject,
    };

    try {
        // Use aggregation and pagination together
        const videos = await Video.aggregatePaginate(
            Video.aggregate([
                { $match: filter }, // Apply filters (query, userId, etc.)
                { $sort: sortObject }, // Apply sorting
            ]),
            options
        );

        // Return the paginated and filtered video data
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving videos", error: error.message });
    }
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    //get the vido and thumbnail file from the request

    const videoLocalpath = req.files?.avatar[0]?.path;
    const thumbnailLocalpath = req.files?.avatar[1]?.path;

    //check if video and thumbnail file is present

    if(!videoLocalpath){
            throw new apiError(400,"path is required")
    }

    if(!thumbnailLocalpath){
        throw new apiError(400,"path is required")
    }
    
    
    //upload the video and thumbnail on cloudinary

    const videos = await uploadOnCloudinary(videoLocalpath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)

    //check if video and thumbnail has been uploaded successfully

    if(!video){
        throw new apiError(500,"Error uploading video")
    }

    if(!thumbnail){
        throw new apiError(500,"Error uploading thumbnail")
    }

    

    //create the video

    const newvideo = await Video.create({
        videoFile : videos.url,
        thumbnail : thumbnail.url,
        title,
        description,
        duration : 0,
        videoOwner : req.user._id
    })

    //return the response

    return res
        .status(201)
        .json(
            new ApiResponse(201,newvideo,"Video published successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    //fine the video by id and populate the videoOwner field

    const video = await Video.findById(videoId).populate("videoOwner")

    //check if video is present

    if(!video){
        throw new apiError(404,"Video not found")
    }

    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId){
        throw new apiError(400,"videoId is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalpath)


    if(!thumbnail.url){
        throw new apiError(400,"Error while Uploading Thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        req.video?._id,
        {
            $set: {
                title : title,
                description : description,
                thumbnail : thumbnail.url
            }
        },
        { new : true}
    )



    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video details upadted successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    //find the video by id

    const video = await Video.findById(videoId)

     //check if video is present

    if(!video){
        throw new apiError(404,"Video not found")
    }

    //delete the video
    uploadOnCloudinary.uploader.destroy(video.videoFile)
    uploadOnCloudinary.uploader.destroy(video.thumbnail)
    await video.remove()

    return res
        .status(200)
        .json(
            new ApiResponse(200,"Video deleted successfully")
        )


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //find the video
    const video = await Video.findById(videoId)

    //validate video
    if(!video){
        throw new apiError(404,"Video not found")
    }

    // Toggle the publish status
    video.isPublished = !video.isPublished

    // Step 5: Return a success response with the updated video status
    res.status(200).json({
        message: `Video publish status updated to ${video.isPublished ? "published" : "unpublished"}`,
        video: {
            _id: video._id,
            title: video.title,
            isPublished: video.isPublished,
        },
    });
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
