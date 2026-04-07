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

    await Club.deleteMany({});
    console.log("Deleted existing clubs");

    await User.deleteMany({});
    console.log("Deleted existing users");

    const hashedUsers = [];
    for (const user of seedUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      hashedUsers.push({
        email: user.email.toLowerCase(),
        password: hashedPassword,
        role: user.role
      });
    }

    const insertedUsers = await User.insertMany(hashedUsers);
    console.log("Inserted users");

    const systemAdmin = insertedUsers.find(
      user => user.email === "rob@uregina.ca"
    );

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