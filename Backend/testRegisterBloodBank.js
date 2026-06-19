import "dotenv/config";
import mongoose from "mongoose";
import BloodBank from "./models/BloodBank.js";
import crypto from "crypto";

const mongoURI = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

async function runTest() {
  await mongoose.connect(mongoURI, { dbName });
  console.log("Connected to database.");

  // Clean up any old test data
  await BloodBank.deleteMany({ email: "testbb@raktdaan.online" });

  try {
    // 1. Invite Blood Bank
    console.log("\n--- Step 1: Inviting Blood Bank ---");
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const testBB = new BloodBank({
      name: "Test Blood Bank Pimpri",
      managerName: "Test Manager",
      email: "testbb@raktdaan.online",
      mobile: "9876543210",
      city: "Pimpri-Chinchwad",
      licenseNumber: "LIC-999-TEST",
      status: "invited",
      inviteToken: inviteToken,
      inviteTokenExpiresAt: inviteTokenExpiresAt,
      isVerified: false
    });
    await testBB.save();
    console.log("Invited Blood Bank saved. ID:", testBB._id);

    // 2. Submit Registration (Simulate Registration Form)
    console.log("\n--- Step 2: Submitting Registration Form ---");
    testBB.address = "Sector 21, Yamuna Nagar, Nigdi";
    testBB.state = "Maharashtra";
    testBB.pincode = "411044";
    testBB.latitude = 18.6548;
    testBB.longitude = 73.7897;
    testBB.location = {
      type: "Point",
      coordinates: [73.7897, 18.6548] // Longitude, Latitude
    };
    testBB.emergencyContact = "9876543211";
    testBB.is24x7 = true;
    testBB.licenseExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    testBB.licenseDocumentUrl = "/uploads/licenses/test.pdf";
    testBB.status = "pending";
    testBB.inviteTokenUsed = true;
    testBB.registeredAt = new Date();
    await testBB.save();
    console.log("Registration submitted. Status is now:", testBB.status);

    // 3. Admin Approval
    console.log("\n--- Step 3: Admin Approval ---");
    testBB.status = "approved";
    testBB.isVerified = true;
    testBB.verifiedAt = new Date();
    await testBB.save();
    console.log("Blood Bank approved. Status is now:", testBB.status, ", isVerified:", testBB.isVerified);

    // 4. Set Password / Activation
    console.log("\n--- Step 4: Activating Account (Set Password) ---");
    testBB.password = "$2a$10$abcdefghijklmnopqrstuvw"; // dummy bcrypt hash
    testBB.status = "active";
    testBB.passwordSetAt = new Date();
    await testBB.save();
    console.log("Blood Bank activated. Status is now:", testBB.status, ", isVerified:", testBB.isVerified);

    // 5. Test Nearby Query Integration
    console.log("\n--- Step 5: Testing Location-Based query ---");
    // User is located near Nigdi (lat: 18.6500, lng: 73.7800)
    const userLat = 18.6500;
    const userLng = 73.7800;
    const radiusInMeters = 20 * 1000;

    const matchQuery = { status: { $in: ["approved", "active"] }, isVerified: true };

    const nearbyBanks = await BloodBank.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [userLng, userLat] },
          distanceField: "distanceMeters",
          maxDistance: radiusInMeters,
          query: matchQuery,
          spherical: true,
        },
      }
    ]);

    console.log(`Found ${nearbyBanks.length} nearby blood banks.`);
    nearbyBanks.forEach(b => {
      console.log(`- Name: ${b.name}, Status: ${b.status}, isVerified: ${b.isVerified}, Distance: ${(b.distanceMeters/1000).toFixed(2)} km`);
    });

    const isFound = nearbyBanks.some(b => b.email === "testbb@raktdaan.online");
    if (isFound) {
      console.log("\n✅ SUCCESS: The newly registered and activated blood bank is successfully visible in search results!");
    } else {
      console.log("\n❌ FAILED: The newly registered blood bank is NOT visible in search results.");
    }

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Clean up test data
    await BloodBank.deleteMany({ email: "testbb@raktdaan.online" });
    console.log("\nTest data cleaned up.");
    await mongoose.disconnect();
  }
}

runTest();
