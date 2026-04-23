require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./model/User');

const USERNAME = 'admin';
const PASSWORD = 'changeme123';

async function main() {
    await mongoose.connect(process.env.DATABASE_URI);
    const existing = await User.findOne({ username: USERNAME }).exec();
    if (existing) {
        console.log('User already exists:', USERNAME);
        process.exit(0);
    }
    const hashedPwd = await bcrypt.hash(PASSWORD, 10);
    const user = await User.create({
        username: USERNAME,
        password: hashedPwd,
        roles: { User: 2001, Admin: 5150 }
    });
    console.log('Created admin:', user.username);
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });