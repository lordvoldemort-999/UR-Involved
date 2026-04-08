const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const Club = require("./models/Club");
const User = require("./models/User");

const seedUsers = [
  {
    email: "rob@uregina.ca",
    password: "robspassword",
    role: "systemAdmin"
  },
  {
    email: "luka@uregina.ca",
    password: "lukaspassword",
    role: "systemAdmin"
  },
  {
    email: "peyton@uregina.ca",
    password: "peytonspassword",
    role: "systemAdmin"
  }
];

const seedClubs = [
  {
    name: "RESS",
    description: "Regina Engineering Students Society",
    category: "Science",
    contactEmail: "resscomm@uregina.ca",
    approved: true
  },
  {
    name: "Cybersecurity Club",
    description: "Don't click on suspicious links!",
    category: "Science",
    contactEmail: "cyber@uregina.ca",
    approved: true
  },
  {
    name: "CSSS",
    description: "Computer Science Students' Society",
    category: "Science",
    contactEmail: "csss@uregina.ca",
    approved: true
  },
  {
    name: "Enactus",
    description: "Inspiring change through entrepreneurship",
    category: "Business",
    contactEmail: "enactusreginapres@gmail.com",
    approved: true
  },
  {
    name: "UR Investing",
    description: "Eth to the moon!",
    category: "Business",
    contactEmail: "urinvesting@gmail.com",
    approved: true
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/ur_involved");
    console.log("Connected to MongoDB");

    // Ensure system admin accounts exist, but do not delete existing users
    for (const user of seedUsers) {
      const existingUser = await User.findOne({ email: user.email.toLowerCase() });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        await User.create({
          email: user.email.toLowerCase(),
          password: hashedPassword,
          role: user.role
        });

        console.log(`Inserted user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }
    }

    const systemAdmin = await User.findOne({ email: "rob@uregina.ca" });

    await Club.deleteMany({});
    console.log("Deleted existing clubs");

    const clubsWithOwnership = seedClubs.map(club => ({
      ...club,
      createdBy: systemAdmin ? systemAdmin._id : undefined,
      admins: systemAdmin ? [systemAdmin._id] : [],
      members: systemAdmin ? [systemAdmin._id] : []
    }));

    await Club.insertMany(clubsWithOwnership);
    console.log("Inserted clubs");

    await mongoose.connection.close();
    console.log("Closed MongoDB connection");
  } catch (error) {
    console.error("Seeding error:", error);
    await mongoose.connection.close();
  }
}

seedDatabase();