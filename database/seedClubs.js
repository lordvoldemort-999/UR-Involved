const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const Club = require("./models/Club");

const clubs = [
    {
        name: "RESS",
        description: "Regina Engineering Students Society",
        category: "Science",
        contactEmail: "resscomm@uregina.ca",
        approved: true
    },
    {
        name: "Cybersercurity Club",
        description: "Don't click on suspicious links!",
        category: "Science",
        contactEmail: "N/A",
        approved: true
    },
    {
        name: "CSSS",
        description: "Computer Science Students' Society",
        category: "Science",
        contactEmail: "N/A",
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
        console.log("connection made to mongodb");

        await Club.deleteMany({});
        console.log("clubs deleted");

        await Club.insertMany(clubs);
        console.log("clubs inserted into database");

        mongoose.connection.close();
        console.log("connection to mongodb closed");
    }
    catch (error) {
        console.error("error: ", error);
        mongoose.connection.close();
    }
}

seedDatabase();