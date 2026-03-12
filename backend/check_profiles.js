require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const User = require('./models/User');
        const Role = require('./models/Role');
        const PlayerProfile = require('./models/PlayerProfile');

        const r = await Role.findOne({ name: 'Player' });
        const players = await User.find({ roles: r._id });
        const profiles = await PlayerProfile.find();

        console.log(`There are ${players.length} users with Player role.`);
        console.log(`There are ${profiles.length} total PlayerProfiles in the DB.`);
    } catch (e) { console.error(e) }
    process.exit(0);
}
run();
