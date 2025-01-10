import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {APIError} from "../utils/APIError.js"
import {ApiResponse} from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
   //1. find video which is liked by user by aquiring user through req.user._id
   const user = req.user?._id
  
  const LikedVideo = await Like.findOne({
    video:videoId,
    likedBy:user,
  })

  if (LikedVideo) {
    await Like.findByIdAndUpdate(LikedVideo?._id,{
        $unset:{video:""},
    })
    return res.status(200).json(new ApiResponse(200,{},"Unliked"))
  }
else{
const newLikevideo = await Like.findByIdAndUpdate(videoId,
    {
    $set:{video:videoId},
    }
)
return res.status(200).json(new ApiResponse(200,{},"Liked"))
}

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const user = req.user?._id
  
  const LikedComment = await Like.findOne({
    comment:commentId,
    likedBy:user,
  })

  if (LikedComment) {
    await comment.findByIdAndUpdate(LikedComment?._id,{
        $unset:{comment:""},
    })
    return res.status(200).json(new ApiResponse(200,{},"Unliked"))
  }
else{
const newLikecomment = await LikedComment.findByIdAndUpdate(LikedComment?._id,
    {
    $set:{comment:commentId},
    }
)
return res.status(200).json(new ApiResponse(200,{},"Liked"))
}

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const user = req.user?._id
  
  const likedTweet = await comment.findOne({
    tweet:commentId,
    likedBy:user,
  })

  if (likedTweet) {
    await tweet.findByIdAndUpdate(likedTweet?._id,{
        $unset:{comment:""},
    })
    return res.status(200).json(new ApiResponse(200,{},"Unliked"))
  }
else{
const newlikeTweet = await likedTweet.findByIdAndUpdate(likedTweet?._id,
    {
    $set:{tweet:likedTweet},
    }
)
return res.status(200).json(new ApiResponse(200,{},"Liked"))
}

   
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    // if (!isValidObjectId(videoId)) {
    //     throw new APIError(400, "Invalid Video id")
    // }
 
    const user = req.user?._id

    const likedvideos = await Like.aggregate([
        {
        $match:{
          likedBy:user
        }
    },
    {
        $lookup:{
            from:"videos",
            localfield:"video",
            foreignfield:"_id",
            as:"Likedvideos",        
    }
    },
    {
        $addFields:{
          likedVideos:{
            $first: "$Likedvideos",
          }
        }
    },
   {
    $project:{
      likedVideos:1
    }
   }

    ])
    
  return res.status(200)
  .json(new ApiResponse(200,likedvideos,"Liked Videos"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}