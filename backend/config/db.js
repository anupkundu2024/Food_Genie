// config/db.js
// Handles the connection to MongoDB using Mongoose.

const mongoose = require("mongoose");
const dns = require("dns");

// Some systems (and certain ISPs/VPNs) run a local DNS resolver that refuses
// SRV record lookups, which breaks "mongodb+srv://" connection strings with
// "querySrv ECONNREFUSED". Point Node at public DNS servers so the Atlas SRV
// record can always be resolved, regardless of the machine's default resolver.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * If the connection fails, we log the error and exit the process so
 * the app doesn't keep running in a broken state.
 */
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in .env");
    throw new Error("Missing MongoDB URI");
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      tls: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
