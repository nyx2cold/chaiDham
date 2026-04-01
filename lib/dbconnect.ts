import mongoose from "mongoose";
import dns from "dns";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // If already connected, don't connect again
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  // Workaround for DNS lookup failures (querySrv ECONNREFUSED) on Windows
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (err) {
    console.warn("Failed to set DNS servers:", err);
  }

  const uri = process.env.MONGODB_URI!;

  try {
    const db = await mongoose.connect(uri);
    connection.isConnected = db.connections[0].readyState;
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

export default dbConnect;