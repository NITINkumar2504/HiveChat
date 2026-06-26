import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const mongo_uri = process.env.MONGO_URI
        if(!mongo_uri) throw new Error("MONGO_URI is required")

        const connectionInstance = await mongoose.connect(mongo_uri)
        console.log(`MONGODB connected !! DB Host: ${connectionInstance.connection.host}`);
    } 
    catch (error) {
        console.log(`Error connection to mongoDB: ${error.message}`)
        process.exit(1)
    }
}

export { connectDB }