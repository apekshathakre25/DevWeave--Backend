const Connection = require("../model/connection");
const User = require("../model/user");
const { sendEmail } = require("../utils/sendEmail");
const mongoose = require("mongoose");

const requiredFields = [
  "firstname",
  "lastname",
  "profilePicture",
  "age",
  "skills",
  "gender",
  "about",
];

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const sendConnectionRequest = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { status, toUserId } = req.params;

    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Only 'interested' or 'ignored' allowed",
      });
    }

    if (!mongoose.isValidObjectId(toUserId)) {
      return res.status(400).json({ message: "Invalid receiver id" });
    }

    const receiver = await User.findById(toUserId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver does not exist" });
    }

    if (fromUserId.equals(toUserId)) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself" });
    }

    const existingConnection = await Connection.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingConnection) {
      return res
        .status(409)
        .json({ message: "Connection request already exists" });
    }

    const connection = new Connection({
      fromUserId,
      toUserId,
      status,
    });

    await connection.save();

    let emailSent = false;
    if (status === "interested") {
      const senderName =
        `${req.user.firstname} ${req.user.lastname || ""}`.trim();
      const receiverName =
        `${receiver.firstname} ${receiver.lastname || ""}`.trim() || "there";
      const escapedSenderName = escapeHtml(senderName);
      const escapedReceiverName = escapeHtml(receiverName);

      try {
        await sendEmail({
          to: receiver.email,
          subject: "New connection request on DevTinder",
          text: `Hi ${receiverName}, ${senderName} sent you a connection request on DevTinder.`,
          html: `
            <p>Hi ${escapedReceiverName},</p>
            <p>${escapedSenderName} sent you a connection request on DevTinder.</p>
          `,
        });
        emailSent = true;
      } catch (emailError) {
        console.error(
          "Failed to send connection request email:",
          emailError.message,
        );
      }
    }

    return res.status(201).json({
      message: `Connection request marked as ${status} successfully`,
      emailSent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
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

    if (!mongoose.isValidObjectId(requestId)) {
      return res.status(400).json({ message: "Invalid request id" });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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
    })
      .select(requiredFields)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      data: showFeed,
    });
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
