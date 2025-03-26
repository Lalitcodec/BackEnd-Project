import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError, ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    const {userId} = req.user._id

    //check if the name and description ia provided
    if(!name || !description){
        throw new apiError(400 , "Name and Description is required")
    }

    //check if playlist with given name already exists
    const existingPlaylist = await Playlist.findOne({
        name,owner : mongoose.Types.ObjectId(userId)
    })

    if(existingPlaylist){
        throw new apiError(400, "A playlist with given name already exists")
    }
    
    //create new playlist
    const newPlaylist = new Playlist({
        name,
        description,
        owner: req.user._id,
        videos : []
    })

    //save the playlist
    await newPlaylist.save()

    //send the response
    res.status(200)
    .json({
        message : "Playlist created successfully",
        playlist: newPlaylist
    })
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    //validate userId
    if(!userId){
        throw new apiError(400, "UserId is required")
    }

    //find all playlist of user
    const playlist = await Playlist.find({
        owner : userId
    }).sort({ createdAt : -1})

    //if no playlist is found , send a appropriate message
    if(playlist.length === 0){
        res.status(404).json({
            message : "No playlist found"
        })
    }

    //return the playlist
    res.status(200).json({
        message : "Playlists retreived successfully",
        playlist
    })
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    //validate Id
    if(!playlistId){
        throw new apiError(400, "provide PlaylistId")
    }

    //find playlist by id
    const playlist = await Playlist.findById(playlistId)
        .populate("owner","name email")

    //return error if playlist not found
    if(!playlist){
        throw new apiError(404,"no playlist found")
    }

    //return the response
    res.status(200).json({
        message : "Playlist retreived successfully",
        playlist,
    })
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
