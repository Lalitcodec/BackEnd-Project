import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    // Parse pagination values
    const pageNum = parseInt(page)
    const pageLimit = parseInt(limit)

    // Ensure that the `videoId` is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Build the filter object
    const filter = {videoId: mongoose.Types.ObjectId(videoId)}

    // Get all comments for the video
    const comments = await Comment.aggregatePaginate(
        Comment.find(filter).sort({createdAt: -1}),
        {page: pageNum, limit: pageLimit}
    )

    // Return the paginated comments
    res.status(200).json(comments);
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    //validate content
    if(!content || content.trim().length === 0){
        throw new apiError(400,"Comment content is required")
    }

    //validate videoId
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new apiError(400,"Invalid Video ID")
    }

    //create a new comment
    const newComment = new Comment({
        content,
        video : videoId,
        owner : req.user._id
    }) 

    //save the comment
    await newComment.save()

    res.status(201).json({
        message: "Comment added successfully",
        comment : newComment
    })

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    //validate content
    if(!content || content.trim().length === 0){
        throw new apiError(400,"Comment content is required")
    }

    //find the comment
    const comment = await Comment.findByIdAndUpdate(comment)

    //validate comment
    if(!comment){
        throw new apiError(404,"Comment not found")
    }

    //validate ownership
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new apiError(403,"You are not authorized to perform this action")
    }

    //update the content
    comment.content = content

    //save the comment
    await comment.save()

    //return the updated comment
    res.status(200).json({
        message: "Comment updated successfully",
        comment
    })

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    //find the comment
    const comment = Comment.findById(commmentId)

    //validate content
    if(!comment){
        throw new apiError(404,"Comment not found")
    }

    //delete the content
    await comment.delete()

    //return the response
    res.status(200).json({
        message: "Comment deleted successfully"
    })
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
