import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { APIError } from "../utils/APIError.js";
import { ApiResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    // check if channelId is valid
    if (!isValidObjectId(channelId)) {
        throw new APIError({ status: 400, message: "Invalid channel id" });
    }
    const userId = req.user?._id;

    const subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id);       
            return res
            .status(200)
            .json(new ApiResponse(200, {}, "unsubscribed Successfully"));
    } else {
        const newSubscription = await  Subscription.create({
            subscriber: userId,
            channel: channelId,
        });
console.log(newSubscription);
console.log(subscription);

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Subscribed Successfully"));
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // check if channelId is valid
    if (!isValidObjectId(channelId)) {
        throw new APIError({ status: 400, message: "Invalid channel id" });
    }

    const subscribersList = await Subscription.aggregate([
        {
            $match: {
                channel: await new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "Subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$Subscribers",
                },
            },
        },
        {
            $project:
            {
                subscriber: 1,
                cretedAt: 1,

            }
        }
    ]);

    if (!subscribersList?.length) {
        throw new APIError(401, "subscribers not found");
    }
console.log(subscribersList);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribersList, "Subscribers Fetched Successfully"))
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    // check if channelId is valid
    if (!isValidObjectId(subscriberId)) {
        throw new APIError({ status: 400, message: "Invalid SubscriberId" });
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: await new mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "channelList",
                pipeline:
                    [
                        {
                            $project: {
                                username: 1,
                                avatar: 1,
                                fullname: 1
                            }
                        }

                    ]
            }
        },
        {
            $addFields:
            {
                channel:
                {
                    $first: "$channelList"
                }
            }
        },
        {
            $project: {
                channel: 1,
                avatar: 1
            }
        }
    ])
    if (!subscribedChannels) {
        throw new APIError(401, "Channels not found!");

    }
    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Channels Fecthed Successfully"))
});




export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
