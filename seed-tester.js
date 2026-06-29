require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/User');
const CallType = require('./model/CallType');
const Flag = require('./model/Flag');

const USERNAME = 'admin';
const PASSWORD = 'changeme123';

const CALL_TYPES = ['Phone', 'email', 'in-person', 'Text', 'other'];
const FLAGS = ['Interested', 'Not Interested', 'Follow Up', 'Closed', 'No Answer'];

async function seedCollection(Model, labels, name) {
    const existing = await Model.find().exec();
    if (existing.length > 0) {
        console.log(`${name} already seeded (${existing.length} found)`);
        return;
    }
    await Model.insertMany(labels.map(label => ({ label })));
    console.log(`Seeded ${labels.length} ${name}`);
}

async function main() {
    await mongoose.connect(process.env.DATABASE_URI);

    const existing = await User.findOne({ username: USERNAME }).exec();
    if (existing) {
        console.log('User already exists:', USERNAME);
    } else {
        const hashedPwd = await bcrypt.hash(PASSWORD, 10);
        const user = await User.create({
            username: USERNAME,
            password: hashedPwd,
            roles: { User: 2001, Admin: 5150 }
        });
        console.log('Created admin:', user.username);
    }

    await seedCollection(CallType, CALL_TYPES, 'call types');
    await seedCollection(Flag, FLAGS, 'flags');

    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
