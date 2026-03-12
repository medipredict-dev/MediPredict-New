require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Prediction = require('./models/Prediction');
        const User = require('./models/User');

        const preds = await Prediction.find().lean();
        const userIdsInPreds = preds.map(p => p.player);
        console.log(`Found ${preds.length} predictions holding ${userIdsInPreds.length} player IDs.`);

        const matchedUsers = await User.find({ _id: { $in: userIdsInPreds } });
        console.log(`Out of those, ${matchedUsers.length} matched a User in the DB.`);

        if (matchedUsers.length === 0) {
            console.log("No users matched. This means the DB was likely wiped/re-seeded, but predictions were left behind (orphaned).");
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}
run();
