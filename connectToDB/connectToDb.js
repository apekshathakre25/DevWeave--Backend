const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb://apekshathakre25_db_user:Apeksha%40123@ac-dty4lox-shard-00-00.ofxd34v.mongodb.net:27017,ac-dty4lox-shard-00-01.ofxd34v.mongodb.net:27017,ac-dty4lox-shard-00-02.ofxd34v.mongodb.net:27017/?ssl=true&replicaSet=atlas-o7ts2a-shard-0&authSource=admin&appName=devTinder",
    );
    console.log("MongoDb connected succesfully");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  connectToDB,
};
