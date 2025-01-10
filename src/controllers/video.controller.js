import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { APIError } from "../utils/APIError.js"
import { ApiResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const Videos = await Video.aggregate([
        {
            $match: {
                $or: [
                    {
                        title: { $regex: query, $options: "i" },

                    },
                    {
                        description: { $regex: query, $options: "i" }
                    }

                ]
            },
        },
        {
            $lookup:
            {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "cretedBy",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            name: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:
            {
                Creator: {
                    $first: "$createdBy"
                }
            }
        },
        {
            $project: {
                thumbnail: 1,
                videoFile: 1,
                title: 1,
                description: 1,
                createdBy:1
        }
    }

    ])

    if (!getAllVideos?.length) {
        throw new APIError(401, "Video Not Found");

    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos found successfuly"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    //while uploading video ,also uplaod thumbnail with it 

    if (!title || !description) {
        throw new APIError(402, "All fields are required");
    }
    const videoLocalPath = req.files?.video[0]?.path;

    if (!videoLocalPath) {
        throw new APIError(401, "Video File is required");
    }

    const thumbNailLocalPath = req.files?.thumbnail[0]?.path;
    if (!thumbNailLocalPath) {
        throw new APIError(401, "please upload thumbnail With video");
    }

    const uploadVideo = await uploadOnCloudinary(videoLocalPath)
    const thumbNail = await uploadOnCloudinary(thumbNailLocalPath)
    console.log("video:", uploadVideo);

    const videoPublished = await Video.create({
        title,
        description,
        videoFile: uploadVideo?.url,
        thumbnail: thumbNail?.url,
        duration: uploadVideo.duration,
        owner: req.user?._id
    })
    if (!videoPublished) {
        throw new APIError(401, "Unable To publish video");
    }
    console.log(videoPublished);

    return res
        .status(200)
        .json(new ApiResponse(200, videoPublished, "Successfully Video Uploaded"))
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    //TODO: get video by id

    if (!isValidObjectId(videoId)) {
        throw new APIError(401, "Invalid Video Id");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new APIError(401, "No Video Found")
    }

    console.log(video);


    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Fetched"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const { title, description } = req.body;

    let updatedthumbnail;
    let updatedData = { title, description }


    if (req.files?.thumbnail[0]?.path) {
        updatedthumbnail = await uploadOnCloudinary(req.files?.thumbnail[0]?.path)
        updatedData.updatedthumbnail
    }

    const updatedvideo = await Video.findByIdAndUpdate(videoId, {
        $set: updatedData,
    }, { new: true })

    if (!updatedvideo) {
        throw new APIError(401, "Video not updated")
    }
    console.log(updatedvideo);
    return res
        .status(200)
        .json(new ApiResponse(200, updatedvideo, "Successfully Video Updated"))



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid Video id")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if (!deletedVideo) {
        throw new APIError(400, "Video not Deleted or Video not available")
    }
    console.log("DeletedVideo:", deletedVideo);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video Deleted Successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid Video id")
    }


    const videoStatus = await Video.findByIdAndUpdate(videoId, [{
        $set: {
            // isPublished:!isPublished
            // Key Operation: The toggle logic is handled in your application code, not directly in the database.
            isPublished: { $not: "isPublished" }
        },
    }], { new: true })

     if (!videoStatus) {
        throw new APIError(401,"Unable to Set");
     }
return res
.status(200)
.json(new ApiResponse(200,videoStatus,"Successfully Updated"))

})





export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}