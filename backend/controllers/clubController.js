const Club = require("../../database/models/Club");

exports.showHomePage = async(req, res) => {
    try {
        // getting club data
        const clubs = await Club.find({approved: true});
        const categories = await Club.distinct("category", {approved: true});
        
        // render homepage
        res.render("home", {clubs, categories});
    }
    catch (error) {
        console.error("failure rendering home page", error);
    }
};

exports.showClubs = async(req, res) => {
    try {

    }
    catch (error) {

    }
};

exports.clubDetails = async(req, res) => {
    try {

    }
    catch (error) {

    }
};