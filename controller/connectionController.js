const Connection = require("../model/connection");
const User = require("../model/user");

const sendConnectionRequest = async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const requestStatus = req.params.status;

    const receiver = await User.findById(toUserId);
    if (!receiver) {
      throw new Error("Receiver does not exist");
    }

    const allowedStatus = ["interested", "ignored"];

    if (!allowedStatus.includes(requestStatus)) {
      throw new Error("Status must be either 'interested' or 'ignored'");
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
      status: requestStatus,
    });

    await connection.save();

    return res.status(201).json({
      message: `Connection request marked as ${requestStatus} successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendConnectionRequest,
};
