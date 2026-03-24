import mongoose from "mongoose";

// Create a connection object to track the connection status
type ConnectionObject = {
  isConnected?: number;
};

// Initialize the connection object
const connection: ConnectionObject = {};

// Function to connect to the database  
async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    // console.log("✅ Already connected to the database.");
    return;
  }

  // Get the MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI;

  // Check if the URI is defined
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables.");
  }

  // Attempt to connect to the database
  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    connection.isConnected = db.connections[0].readyState;
    console.log("✅ Connected to the database.");
  } catch (error) {
    // console.error("🔴 Database connection failed:", error); // ← Log the error
    throw error; // ← Let the route's catch block handle it and return a proper response
  }
}

export default dbConnect;