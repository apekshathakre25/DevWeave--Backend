const Connection = require("../model/connection");
const User = require("../model/user");

const requiredFields = [
  "firstName",
  "lastName",
  "profilePicture",
  "age",
  "skills",
  "gender",
  "about",
];

const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;

const skip = (page - 1) * limit;

const sendConnectionRequest = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;

    const receiver = await User.findById(toUserId);
    if (!receiver) {
      throw new Error("Receiver does not exist");
    }

    if (fromUserId.equals(toUserId)) {
      throw new Error("You cannot send a request to yourself");
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnection) {
      throw new Error("Connection request already exists");
    }

    const connection = new Connection({
      fromUserId,
      toUserId,
      status: "interested",
    });

    await connection.save();

    return res.status(201).json({
      message: `Connection request marked as interested successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const reviewConnectionRequest = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const { requestId, status } = req.params;

    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Only 'accepted' or 'rejected' allowed",
      });
    }

    const connectionRequest = await Connection.findOne({
      _id: requestId,
      toUserId: loggedInUser,
      status: "interested",
    });

    if (!connectionRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    connectionRequest.status = status;
    await connectionRequest.save();

    return res.status(200).json({
      message: `Connection request ${status}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getAllConnection = async (req, res) => {
  try {
    const user = req.user;

    const connections = await Connection.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
      status: "accepted",
    })
      .populate("fromUserId", requiredFields)
      .populate("toUserId", requiredFields);

    return res.status(200).json({
      message: "Connection fetched succesfully",
      data: connections,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getPendingConnection = async (req, res) => {
  try {
    const user = req.user;

    const pendingRequests = await Connection.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", requiredFields);

    return res.status(200).json({
      message: "Pending connections fetched successfully",
      data: pendingRequests,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const getFeed = async (req, res) => {
  try {
    const user = req.user;

    const connectionExist = await Connection.find({
      $or: [{ fromUserId: user._id }, { toUserId: user._id }],
    });

    const hideUserFromFeed = new Set();

    connectionExist.forEach((conn) => {
      hideUserFromFeed.add(conn.fromUserId.toString());
      hideUserFromFeed.add(conn.toUserId.toString());
    });

    hideUserFromFeed.add(user._id.toString());

    const showFeed = await User.find({
      _id: {
        $nin: Array.from(hideUserFromFeed),
      },
    }).select(requiredFields);

    return res
      .status(200)
      .json({
        data: showFeed,
      })
      .skip(skip)
      .limit(limit);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

module.exports = {
  sendConnectionRequest,
  reviewConnectionRequest,
  getAllConnection,
  getPendingConnection,
  getFeed,
};
