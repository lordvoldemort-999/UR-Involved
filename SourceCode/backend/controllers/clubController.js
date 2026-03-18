const Club = require("../../database/models/Club");

exports.showHomePage = async(req, res) => {
    try {
        // getting club data
        const clubs = await Club.find({ approved: true }).sort({ name: 1 });
        
        // render homepage
        res.render("home", {clubs});
    }
    catch (error) {
        console.error("failure rendering home page", error);
        res.status(500).send("Error loading homepage.");
    }
};

exports.showClubDetails = async(req, res) => {
    try {
        const club = await Club.findById(req.params.id);
        res.render("clubDetail", {club});
    }
    catch (error) {
        console.error("failure rendering club details page", error);
        res.status(500).send("Error loading club details page.");
    }
};