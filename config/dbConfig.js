const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}`
        );

        console.log(
            `MongoDB connected !! DB Host : ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("MongoDB connectionn error : ", error);
        process.exit(1);
    }
};

module.exports = connectDB;
